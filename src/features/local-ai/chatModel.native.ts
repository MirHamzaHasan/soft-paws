/* eslint-disable no-await-in-loop, no-continue, no-bitwise -- File and token loops are sequential; float16 uses bit fields. */
import { Tokenizer } from '@huggingface/tokenizers';
import { sha256 } from '@noble/hashes/sha2.js'; // eslint-disable-line import/extensions -- Required ESM export path.
import { bytesToHex } from '@noble/hashes/utils.js'; // eslint-disable-line import/extensions -- Required ESM export path.
import { Directory, File, Paths } from 'expo-file-system';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

import { LOCAL_CHAT_MODEL } from './chatModelManifest';

type StoredDirectory = InstanceType<typeof Directory> & {
  create(options?: { idempotent?: boolean; intermediates?: boolean }): void;
  delete(): void;
  exists: boolean;
};

type StoredFile = InstanceType<typeof File> & {
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

const LAYERS = 28;
const VOCAB_SIZE = 151_936;
const MAX_PROMPT_TOKENS = 384;
const MAX_OUTPUT_TOKENS = 112;
const END_TOKENS = new Set([151_643, 151_645]);

function modelDirectory() {
  return new Directory(
    Paths.document,
    'barklog-ai',
    LOCAL_CHAT_MODEL.id,
  ) as StoredDirectory;
}

function modelFile(name: string) {
  return new File(modelDirectory(), name) as StoredFile;
}

async function fileSha256(file: StoredFile) {
  const hash = sha256.create();
  const handle = file.open();
  try {
    while ((handle.offset ?? 0) < file.size) {
      hash.update(
        handle.readBytes(
          Math.min(1024 * 1024, file.size - (handle.offset ?? 0)),
        ),
      );
      // Give the UI a chance to repaint while checking a large download.
      if (((handle.offset ?? 0) / (1024 * 1024)) % 8 === 0) {
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
let sessionPromise: Promise<InferenceSession> | null = null;
let tokenizerPromise: Promise<Tokenizer> | null = null;
let generationTail: Promise<void> = Promise.resolve();

export async function isChatModelInstalled(): Promise<boolean> {
  if (!installedPromise) {
    installedPromise = (async () => {
      const marker = modelFile('verified.json');
      if (!marker.exists) return false;
      try {
        const saved = JSON.parse(await marker.text()) as { id?: string };
        return (
          saved.id === LOCAL_CHAT_MODEL.id &&
          LOCAL_CHAT_MODEL.files.every((definition) => {
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

export async function downloadChatModel(): Promise<void> {
  if (downloadPromise) return downloadPromise;
  downloadPromise = (async () => {
    if (await isChatModelInstalled()) return;
    if (Paths.availableDiskSpace < LOCAL_CHAT_MODEL.sizeBytes + 150_000_000) {
      throw new Error(
        'Free at least 520 MB of device storage before downloading local conversation.',
      );
    }
    const directory = modelDirectory();
    directory.create({ idempotent: true, intermediates: true });
    const marker = modelFile('verified.json');
    if (marker.exists) marker.delete();
    for (const definition of LOCAL_CHAT_MODEL.files) {
      const target = modelFile(definition.name);
      if (
        target.exists &&
        target.size === definition.sizeBytes &&
        (await fileSha256(target)) === definition.sha256
      ) {
        continue;
      }
      if (target.exists) target.delete();
      const temporary = modelFile(`${definition.name}.download`);
      if (temporary.exists) temporary.delete();
      try {
        await DownloadableFile.downloadFileAsync(definition.url, temporary);
        if (
          temporary.size !== definition.sizeBytes ||
          (await fileSha256(temporary)) !== definition.sha256
        ) {
          throw new Error('The local conversation model failed verification.');
        }
        temporary.move(target);
      } finally {
        if (temporary.exists) temporary.delete();
      }
    }
    marker.create({ overwrite: true });
    marker.write(JSON.stringify({ id: LOCAL_CHAT_MODEL.id }));
    installedPromise = Promise.resolve(true);
  })().finally(() => {
    downloadPromise = null;
    installedPromise = null;
  });
  return downloadPromise;
}

export async function deleteChatModel(): Promise<void> {
  if (downloadPromise) await downloadPromise;
  await generationTail;
  const activeSession = await sessionPromise?.catch(() => null);
  await activeSession?.release();
  sessionPromise = null;
  tokenizerPromise = null;
  const directory = modelDirectory();
  if (directory.exists) directory.delete();
  installedPromise = null;
}

async function getSession() {
  if (!(await isChatModelInstalled()))
    throw new Error('Download local conversation first.');
  if (!sessionPromise) {
    sessionPromise = InferenceSession.create(
      modelFile('model_q4f16.onnx').uri,
      {
        executionProviders: ['cpu'],
      },
    ).catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

async function getTokenizer() {
  if (!tokenizerPromise) {
    tokenizerPromise = Promise.all([
      modelFile('tokenizer.json').text(),
      modelFile('tokenizer_config.json').text(),
    ]).then(
      ([definition, config]) =>
        new Tokenizer(JSON.parse(definition), JSON.parse(config)),
    );
  }
  return tokenizerPromise;
}

function float16ToNumber(bits: number) {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >>> 10) & 0x1f;
  const fraction = bits & 0x3ff;
  if (exponent === 0) return sign * (fraction / 1024) * 2 ** -14;
  if (exponent === 31) return fraction ? NaN : sign * Infinity;
  return sign * (1 + fraction / 1024) * 2 ** (exponent - 15);
}

function nextToken(logits: Tensor) {
  if (logits.dims.length !== 3 || logits.dims[2] !== VOCAB_SIZE) {
    throw new Error('The local conversation model returned unexpected output.');
  }
  const values = logits.data as Uint16Array;
  const offset = values.length - VOCAB_SIZE;
  let bestToken = 0;
  let bestLogit = -Infinity;
  for (let id = 0; id < VOCAB_SIZE; id += 1) {
    const value = float16ToNumber(values[offset + id]!);
    if (value > bestLogit) {
      bestLogit = value;
      bestToken = id;
    }
  }
  return bestToken;
}

async function runLocalChat(prompt: string): Promise<string> {
  const [activeSession, tokenizer] = await Promise.all([
    getSession(),
    getTokenizer(),
  ]);
  const promptIds = tokenizer.encode(prompt).ids;
  if (promptIds.length === 0 || promptIds.length > MAX_PROMPT_TOKENS) {
    throw new Error('The question is too long for local conversation.');
  }
  const emptyCache = new Tensor('float16', new Uint16Array(0), [1, 8, 0, 128]);
  let cached: Record<string, Tensor> = {};
  for (let layer = 0; layer < LAYERS; layer += 1) {
    cached[`past_key_values.${layer}.key`] = emptyCache;
    cached[`past_key_values.${layer}.value`] = emptyCache;
  }
  let inputIds = promptIds;
  const generated: number[] = [];
  let reachedEnd = false;
  for (let step = 0; step < MAX_OUTPUT_TOKENS; step += 1) {
    const totalLength = promptIds.length + generated.length;
    const outputs = await activeSession.run({
      ...cached,
      input_ids: new Tensor('int64', BigInt64Array.from(inputIds, BigInt), [
        1,
        inputIds.length,
      ]),
      attention_mask: new Tensor(
        'int64',
        BigInt64Array.from({ length: totalLength }, () => 1n),
        [1, totalLength],
      ),
    });
    const { logits } = outputs;
    if (!logits)
      throw new Error('The local conversation model returned no answer.');
    const token = nextToken(logits);
    if (END_TOKENS.has(token)) {
      reachedEnd = true;
      break;
    }
    generated.push(token);
    const nextCache: Record<string, Tensor> = {};
    for (let layer = 0; layer < LAYERS; layer += 1) {
      for (const kind of ['key', 'value'] as const) {
        const output = outputs[`present.${layer}.${kind}`];
        if (!output)
          throw new Error(
            'The local conversation model returned incomplete state.',
          );
        nextCache[`past_key_values.${layer}.${kind}`] = output;
      }
    }
    cached = nextCache;
    inputIds = [token];
  }
  if (!reachedEnd)
    throw new Error('The local conversation answer was incomplete.');
  return tokenizer.decode(generated, { skip_special_tokens: true }).trim();
}

export async function generateLocalChat(prompt: string): Promise<string> {
  const previous = generationTail;
  let unlock: () => void = () => undefined;
  generationTail = new Promise<void>((resolve) => {
    unlock = resolve;
  });
  await previous;
  try {
    return await runLocalChat(prompt);
  } finally {
    const activeSession = await sessionPromise?.catch(() => null);
    sessionPromise = null;
    try {
      await activeSession?.release();
    } finally {
      unlock();
    }
  }
}
