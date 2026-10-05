/* eslint-disable no-await-in-loop, no-continue -- Files and generated tokens are processed in order. */
import { Tokenizer } from '@huggingface/tokenizers';
import { sha256 } from '@noble/hashes/sha2.js'; // eslint-disable-line import/extensions -- Required ESM export path.
import { bytesToHex } from '@noble/hashes/utils.js'; // eslint-disable-line import/extensions -- Required ESM export path.
import { Directory, File, Paths } from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode as decodeJpeg } from 'jpeg-js';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

import { containsDiagnosticClaim } from '@/features/insights/utils/aiSafety';

import { LOCAL_VISION_MODEL } from './visionModelManifest';

type StoredDirectory = InstanceType<typeof Directory> & {
  create(options?: { idempotent?: boolean; intermediates?: boolean }): void;
  delete(): void;
  exists: boolean;
};

type StoredFile = InstanceType<typeof File> & {
  bytes(): Promise<Uint8Array>;
  create(options?: { overwrite?: boolean }): void;
  delete(): void;
  exists: boolean;
  move(destination: StoredFile): void;
  open(): {
    close(): void;
    offset: number | null;
    readBytes(length: number): Uint8Array<ArrayBuffer>;
  };
  size: number;
  text(): Promise<string>;
  uri: string;
  write(content: string): void;
};

const DownloadableFile = File as typeof File & {
  downloadFileAsync(url: string, destination: StoredFile): Promise<StoredFile>;
};

const IMAGE_SIZE = 768;
const EMBEDDING_WIDTH = 768;
const VOCAB_SIZE = 51_289;
const MAX_CAPTION_TOKENS = 80;

function modelDirectory() {
  return new Directory(
    Paths.document,
    'barklog-ai',
    LOCAL_VISION_MODEL.id,
  ) as StoredDirectory;
}

function modelFile(name: string) {
  return new File(modelDirectory(), name) as StoredFile;
}

async function fileSha256(file: StoredFile) {
  const hash = sha256.create();
  const handle = file.open();
  let chunks = 0;
  try {
    while ((handle.offset ?? 0) < file.size) {
      hash.update(
        handle.readBytes(
          Math.min(1024 * 1024, file.size - (handle.offset ?? 0)),
        ),
      );
      chunks += 1;
      if (chunks % 8 === 0) {
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 0);
        });
      }
    }
    return bytesToHex(hash.digest());
  } finally {
    handle.close();
  }
}

let installedPromise: Promise<boolean> | null = null;
let downloadPromise: Promise<void> | null = null;
let captionPromise: Promise<string> | null = null;

export async function isVisionModelInstalled(): Promise<boolean> {
  if (!installedPromise) {
    installedPromise = (async () => {
      const marker = modelFile('verified.json');
      if (!marker.exists) return false;
      try {
        const saved = JSON.parse(await marker.text()) as { id?: string };
        return (
          saved.id === LOCAL_VISION_MODEL.id &&
          LOCAL_VISION_MODEL.files.every((definition) => {
            const file = modelFile(definition.name);
            return file.exists && file.size === definition.sizeBytes;
          })
        );
      } catch {
        return false;
      }
    })();
  }
  return installedPromise;
}

export async function downloadVisionModel(): Promise<void> {
  if (downloadPromise) return downloadPromise;
  downloadPromise = (async () => {
    if (await isVisionModelInstalled()) return;
    if (Paths.availableDiskSpace < LOCAL_VISION_MODEL.sizeBytes + 150_000_000) {
      throw new Error(
        'Free at least 340 MB of device storage before downloading photo descriptions.',
      );
    }
    modelDirectory().create({ idempotent: true, intermediates: true });
    const marker = modelFile('verified.json');
    if (marker.exists) marker.delete();
    for (const definition of LOCAL_VISION_MODEL.files) {
      const target = modelFile(definition.name);
      if (
        target.exists &&
        target.size === definition.sizeBytes &&
        (await fileSha256(target)) === definition.sha256
      )
        continue;
      if (target.exists) target.delete();
      const temporary = modelFile(`${definition.name}.download`);
      if (temporary.exists) temporary.delete();
      try {
        await DownloadableFile.downloadFileAsync(definition.url, temporary);
        if (
          temporary.size !== definition.sizeBytes ||
          (await fileSha256(temporary)) !== definition.sha256
        ) {
          throw new Error('The local photo model failed verification.');
        }
        temporary.move(target);
      } finally {
        if (temporary.exists) temporary.delete();
      }
    }
    marker.create({ overwrite: true });
    marker.write(JSON.stringify({ id: LOCAL_VISION_MODEL.id }));
  })().finally(() => {
    downloadPromise = null;
    installedPromise = null;
  });
  return downloadPromise;
}

export async function deleteVisionModel(): Promise<void> {
  if (downloadPromise) await downloadPromise;
  if (captionPromise) await captionPromise.catch(() => undefined);
  const directory = modelDirectory();
  if (directory.exists) directory.delete();
  installedPromise = null;
}

async function pixelTensor(uri: string) {
  const resized = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: IMAGE_SIZE, height: IMAGE_SIZE } }],
    { compress: 1, format: ImageManipulator.SaveFormat.JPEG },
  );
  const resizedFile = new File(resized.uri) as StoredFile;
  let jpeg: Uint8Array;
  try {
    jpeg = await resizedFile.bytes();
  } finally {
    if (resizedFile.exists) resizedFile.delete();
  }
  const { data, width, height } = decodeJpeg(jpeg, {
    useTArray: true,
    formatAsRGBA: true,
    maxResolutionInMP: 1,
    maxMemoryUsageInMB: 100,
  });
  if (width !== IMAGE_SIZE || height !== IMAGE_SIZE)
    throw new Error('The selected photo could not be resized.');
  const planeSize = IMAGE_SIZE * IMAGE_SIZE;
  const pixels = new Float32Array(3 * planeSize);
  const means = [0.485, 0.456, 0.406];
  const deviations = [0.229, 0.224, 0.225];
  for (let index = 0; index < planeSize; index += 1) {
    for (let channel = 0; channel < 3; channel += 1) {
      pixels[channel * planeSize + index] =
        (data[index * 4 + channel]! / 255 - means[channel]!) /
        deviations[channel]!;
    }
  }
  return new Tensor('float32', pixels, [1, 3, IMAGE_SIZE, IMAGE_SIZE]);
}

async function runModel(
  fileName: string,
  feeds: Record<string, Tensor>,
  outputName: string,
) {
  const session = await InferenceSession.create(modelFile(fileName).uri, {
    executionProviders: ['cpu'],
  });
  try {
    const outputs = await session.run(feeds);
    const output = outputs[outputName];
    if (!output)
      throw new Error('The local photo model returned incomplete output.');
    return output;
  } finally {
    await session.release();
  }
}

function int64Tensor(ids: number[]) {
  return new Tensor('int64', BigInt64Array.from(ids, BigInt), [1, ids.length]);
}

function ones(length: number) {
  return new Tensor(
    'int64',
    BigInt64Array.from({ length }, () => 1n),
    [1, length],
  );
}

async function caption(uri: string): Promise<string> {
  if (!(await isVisionModelInstalled()))
    throw new Error('Download local photo descriptions first.');
  const [tokenizerDefinition, tokenizerConfig] = await Promise.all([
    modelFile('tokenizer.json').text(),
    modelFile('tokenizer_config.json').text(),
  ]);
  const tokenizer = new Tokenizer(
    JSON.parse(tokenizerDefinition),
    JSON.parse(tokenizerConfig),
  );
  const imageFeatures = await runModel(
    'vision_encoder_q4f16.onnx',
    { pixel_values: await pixelTensor(uri) },
    'image_features',
  );
  if (
    imageFeatures.dims.length !== 3 ||
    imageFeatures.dims[2] !== EMBEDDING_WIDTH
  ) {
    throw new Error(
      'The local photo model returned unexpected image features.',
    );
  }
  const promptIds = tokenizer.encode('What does the image describe?').ids;
  const promptFeatures = await runModel(
    'embed_tokens_int8.onnx',
    { input_ids: int64Tensor(promptIds) },
    'inputs_embeds',
  );
  const imageLength = imageFeatures.dims[1]!;
  const inputLength = imageLength + promptIds.length;
  const embeddings = new Float32Array(inputLength * EMBEDDING_WIDTH);
  embeddings.set(imageFeatures.data as Float32Array);
  embeddings.set(
    promptFeatures.data as Float32Array,
    imageLength * EMBEDDING_WIDTH,
  );
  const hidden = await runModel(
    'encoder_model_q4f16.onnx',
    {
      inputs_embeds: new Tensor('float32', embeddings, [
        1,
        inputLength,
        EMBEDDING_WIDTH,
      ]),
      attention_mask: ones(inputLength),
    },
    'last_hidden_state',
  );
  const embeddingSession = await InferenceSession.create(
    modelFile('embed_tokens_int8.onnx').uri,
    { executionProviders: ['cpu'] },
  );
  let decoderSession: InferenceSession | null = null;
  const generated = [2]; // Florence's decoder start token.
  let complete = false;
  try {
    decoderSession = await InferenceSession.create(
      modelFile('decoder_model_q4f16.onnx').uri,
      { executionProviders: ['cpu'] },
    );
    for (let step = 0; step < MAX_CAPTION_TOKENS; step += 1) {
      const tokenEmbeddings = await embeddingSession.run({
        input_ids: int64Tensor(generated),
      });
      const inputsEmbeds = tokenEmbeddings.inputs_embeds;
      if (!inputsEmbeds)
        throw new Error('The local photo model returned incomplete output.');
      const outputs = await decoderSession.run({
        inputs_embeds: inputsEmbeds,
        encoder_hidden_states: hidden,
        encoder_attention_mask: ones(inputLength),
      });
      const { logits } = outputs;
      if (!logits || logits.dims[2] !== VOCAB_SIZE)
        throw new Error('The local photo model returned unexpected tokens.');
      const values = logits.data as Float32Array;
      const offset = values.length - VOCAB_SIZE;
      let token = 0;
      for (let id = 1; id < VOCAB_SIZE; id += 1) {
        if (values[offset + id]! > values[offset + token]!) token = id;
      }
      if (token === 2) {
        complete = true;
        break;
      }
      generated.push(token);
    }
  } finally {
    await Promise.all([embeddingSession.release(), decoderSession?.release()]);
  }
  if (!complete) throw new Error('The local photo description was incomplete.');
  const result = tokenizer
    .decode(generated, { skip_special_tokens: true })
    .trim();
  if (
    !result ||
    result.length > 600 ||
    containsDiagnosticClaim(result) ||
    /\b(healthy|unhealthy|sick|infected|infection|pain|injur\w*|wound\w*|disease|diagnos\w*|tumou?r|cancer|treat\w*)\b/i.test(
      result,
    )
  )
    throw new Error('The local photo description was unavailable.');
  return result;
}

export async function describeLocalPhoto(uri: string): Promise<string> {
  if (!captionPromise) {
    captionPromise = caption(uri).finally(() => {
      captionPromise = null;
    });
  }
  return captionPromise;
}
