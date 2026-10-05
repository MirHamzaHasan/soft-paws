// Pinned Apache-2.0 model: https://huggingface.co/Xenova/all-MiniLM-L6-v2
// This is a sentence-embedding model for routing factual journal questions.
// It does not generate clinical or conversational text.
const revision = '751bff37182d3f1213fa05d7196b954e230abad9';
const base = `https://huggingface.co/Xenova/all-MiniLM-L6-v2/resolve/${revision}`;

export const STARTER_LOCAL_MODEL = {
  id: 'minilm-l6-v2-int8-v1',
  label: 'Local journal questions',
  description:
    'Answers supported questions about recent BarkLog entries on this device.',
  sizeBytes: 23_203_878,
  files: [
    {
      name: 'model.onnx',
      url: `${base}/onnx/model_int8.onnx`,
      sizeBytes: 22_972_370,
      sha256:
        'afdb6f1a0e45b715d0bb9b11772f032c399babd23bfc31fed1c170afc848bdb1',
    },
    {
      name: 'vocab.txt',
      url: `${base}/vocab.txt`,
      sizeBytes: 231_508,
      sha256:
        '07eced375cec144d27c900241f3e339478dec958f92fddbc551f295c992038a3',
    },
  ],
} as const;
