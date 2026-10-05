/* eslint-disable no-await-in-loop -- Model files are verified and installed sequentially. */
import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { InferenceSession, Tensor } from 'onnxruntime-react-native';

import { STARTER_LOCAL_MODEL } from './modelManifest';
import { encodeWordPiece, parseWordPieceVocab } from './wordPiece';

type StoredDirectory = InstanceType<typeof Directory> & {
  create(options?: { idempotent?: boolean; intermediates?: boolean }): void;
  delete(): void;
  exists: boolean;
};

type StoredFile = InstanceType<typeof File> & {
  bytes(): Promise<Uint8Array<ArrayBuffer>>;
  create(options?: { overwrite?: boolean }): void;
  delete(): void;
  exists: boolean;
  move(destination: StoredFile): void;
  size: number;
  text(): Promise<string>;
  uri: string;
  write(content: string): void;
};

const DownloadableFile = File as typeof File & {
  downloadFileAsync(url: string, destination: StoredFile): Promise<StoredFile>;
};

function modelDirectory() {
  return new Directory(
    Paths.document,
    'barklog-ai',
    STARTER_LOCAL_MODEL.id,
  ) as StoredDirectory;
}

function modelFile(name: string) {
  return new File(modelDirectory(), name) as StoredFile;
}

function digestHex(bytes: Uint8Array<ArrayBuffer>) {
  return Crypto.digest(Crypto.CryptoDigestAlgorithm.SHA256, bytes).then(
    (digest) =>
      [...new Uint8Array(digest)]
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join(''),
  );
}

async function verifyFile(
  file: StoredFile,
  expected: {
    sizeBytes: number;
    sha256: string;
  },
) {
  if (!file.exists || file.size !== expected.sizeBytes) return false;
  return (await digestHex(await file.bytes())) === expected.sha256;
}

let installedPromise: Promise<boolean> | null = null;
let downloadPromise: Promise<void> | null = null;
let sessionPromise: Promise<InferenceSession> | null = null;
let vocabPromise: Promise<Map<string, number>> | null = null;

export async function isStarterModelInstalled(): Promise<boolean> {
  if (!installedPromise) {
    installedPromise = (async () => {
      const marker = modelFile('verified.json');
      if (!marker.exists) return false;
      try {
        const verified = JSON.parse(await marker.text()) as { id?: string };
        return (
          verified.id === STARTER_LOCAL_MODEL.id &&
          STARTER_LOCAL_MODEL.files.every((file) => {
            const saved = modelFile(file.name);
            return saved.exists && saved.size === file.sizeBytes;
          })
        );
      } catch {
        return false;
      }
    })();
  }
  return installedPromise;
}

export async function downloadStarterModel(): Promise<void> {
  if (downloadPromise) return downloadPromise;
  downloadPromise = (async () => {
    if (await isStarterModelInstalled()) return;
    const directory = modelDirectory();
    directory.create({ idempotent: true, intermediates: true });
    const marker = modelFile('verified.json');
    if (marker.exists) marker.delete();
    for (const definition of STARTER_LOCAL_MODEL.files) {
      const target = modelFile(definition.name);
      if (!(await verifyFile(target, definition))) {
        if (target.exists) target.delete();
        const temporary = modelFile(`${definition.name}.download`);
        if (temporary.exists) temporary.delete();
        try {
          await DownloadableFile.downloadFileAsync(definition.url, temporary);
          if (!(await verifyFile(temporary, definition))) {
            throw new Error(
              'The downloaded local AI model failed verification.',
            );
          }
          temporary.move(target);
        } finally {
          const leftoverDownload = modelFile(`${definition.name}.download`);
          if (leftoverDownload.exists) leftoverDownload.delete();
        }
      }
    }
    marker.create({ overwrite: true });
    marker.write(JSON.stringify({ id: STARTER_LOCAL_MODEL.id }));
    installedPromise = Promise.resolve(true);
  })().finally(() => {
    downloadPromise = null;
    installedPromise = null;
  });
  return downloadPromise;
}

export async function deleteStarterModel(): Promise<void> {
  if (downloadPromise) await downloadPromise;
  const activeSession = await sessionPromise?.catch(() => null);
  await activeSession?.release();
  sessionPromise = null;
  vocabPromise = null;
  const directory = modelDirectory();
  if (directory.exists) directory.delete();
  installedPromise = null;
}

async function session(): Promise<InferenceSession> {
  if (!(await isStarterModelInstalled())) {
    throw new Error('Download the local AI model first.');
  }
  if (!sessionPromise) {
    sessionPromise = InferenceSession.create(modelFile('model.onnx').uri, {
      executionProviders: ['cpu'],
    }).catch((error: unknown) => {
      sessionPromise = null;
      throw error;
    });
  }
  return sessionPromise;
}

async function vocabulary() {
  if (!vocabPromise) {
    vocabPromise = modelFile('vocab.txt').text().then(parseWordPieceVocab);
  }
  return vocabPromise!;
}

export async function embedLocalTexts(
  texts: readonly string[],
): Promise<number[][]> {
  if (texts.length === 0) return [];
  const [activeSession, vocab] = await Promise.all([session(), vocabulary()]);
  const sequences = texts.map((text) => encodeWordPiece(text, vocab));
  const sequenceLength = Math.max(...sequences.map((ids) => ids.length));
  const count = texts.length * sequenceLength;
  const inputIds = new BigInt64Array(count);
  const attentionMask = new BigInt64Array(count);
  const tokenTypeIds = new BigInt64Array(count);
  sequences.forEach((ids, row) => {
    ids.forEach((id, column) => {
      const index = row * sequenceLength + column;
      inputIds[index] = BigInt(id);
      attentionMask[index] = 1n;
    });
  });
  const shape: [number, number] = [texts.length, sequenceLength];
  const outputs = await activeSession.run({
    input_ids: new Tensor('int64', inputIds, shape),
    attention_mask: new Tensor('int64', attentionMask, shape),
    token_type_ids: new Tensor('int64', tokenTypeIds, shape),
  });
  const output = outputs.last_hidden_state;
  if (!output || output.dims.length !== 3 || output.dims[2] !== 384) {
    throw new Error('The local AI model returned an unexpected shape.');
  }
  const values = output.data as Float32Array;
  return sequences.map((ids, row) => {
    const pooled = new Array<number>(384).fill(0);
    for (let column = 0; column < ids.length; column += 1) {
      for (let dimension = 0; dimension < 384; dimension += 1) {
        pooled[dimension] =
          (pooled[dimension] ?? 0) +
          values[(row * sequenceLength + column) * 384 + dimension]!;
      }
    }
    let norm = 0;
    for (let dimension = 0; dimension < 384; dimension += 1) {
      pooled[dimension] = (pooled[dimension] ?? 0) / ids.length;
      norm += pooled[dimension]! * pooled[dimension]!;
    }
    norm = Math.sqrt(norm);
    return pooled.map((value) => (norm > 0 ? value / norm : 0));
  });
}
