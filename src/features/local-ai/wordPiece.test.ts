import { encodeWordPiece, parseWordPieceVocab } from './wordPiece';

it('encodes text with the pinned model’s WordPiece input convention', () => {
  const vocab = parseWordPieceVocab(
    '[PAD]\n[UNK]\n[CLS]\n[SEP]\nwalk\n##ing\ndog\n?',
  );
  expect(encodeWordPiece('Walking dog?', vocab)).toEqual([2, 4, 5, 6, 7, 3]);
  expect(encodeWordPiece('unknown', vocab)).toEqual([2, 1, 3]);
});
