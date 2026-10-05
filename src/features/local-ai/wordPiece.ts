const MAX_TOKENS = 64;

export function parseWordPieceVocab(contents: string): Map<string, number> {
  const vocab = new Map<string, number>();
  contents.split(/\r?\n/).forEach((token, index) => {
    if (token) vocab.set(token, index);
  });
  for (const token of ['[PAD]', '[UNK]', '[CLS]', '[SEP]']) {
    if (!vocab.has(token))
      throw new Error('Local AI vocabulary is incomplete.');
  }
  return vocab;
}

function wordPieces(word: string, vocab: Map<string, number>): number[] {
  const direct = vocab.get(word);
  if (direct !== undefined) return [direct];
  const parts: number[] = [];
  let start = 0;
  while (start < word.length) {
    let end = word.length;
    let match: number | undefined;
    while (end > start) {
      match = vocab.get(`${start > 0 ? '##' : ''}${word.slice(start, end)}`);
      if (match !== undefined) break;
      end -= 1;
    }
    if (match === undefined) return [vocab.get('[UNK]')!];
    parts.push(match);
    start = end;
  }
  return parts;
}

export function encodeWordPiece(
  text: string,
  vocab: Map<string, number>,
): number[] {
  const normalized = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const words = normalized.match(/[a-z0-9]+|[^\w\s]/g) ?? [];
  const ids = [vocab.get('[CLS]')!];
  for (const word of words) {
    const next = wordPieces(word, vocab);
    if (ids.length + next.length >= MAX_TOKENS) break;
    ids.push(...next);
  }
  ids.push(vocab.get('[SEP]')!);
  return ids;
}
