// Apache-2.0 Qwen3 weights, pinned to a specific ONNX Community revision.
// The model and tokenizer are downloaded only after the caregiver asks for them.
const revision = 'd6beae7d59bc21264488d12f466f4ca6b252806f';
const base = `https://huggingface.co/onnx-community/Qwen3-0.6B-DQ-ONNX/resolve/${revision}`;

export const LOCAL_CHAT_MODEL = {
  id: 'qwen3-06b-dq-q4f16-v1',
  label: 'Local conversation',
  sizeBytes: 366_943_594,
  files: [
    {
      name: 'model_q4f16.onnx',
      url: `${base}/onnx/model_q4f16.onnx`,
      sizeBytes: 64_238_474,
      sha256:
        'e020dd2bd158459e12296648fe73b6ec92c15a2cd83da5487f1efdf42c3d1b52',
    },
    {
      name: 'model_q4f16.onnx_data',
      url: `${base}/onnx/model_q4f16.onnx_data`,
      sizeBytes: 291_272_704,
      sha256:
        '2705201c0bc9a7b11e31c3354644f99d274e266272870045d61e7410966a88e5',
    },
    {
      name: 'tokenizer.json',
      url: `${base}/tokenizer.json`,
      sizeBytes: 11_422_654,
      sha256:
        'aeb13307a71acd8fe81861d94ad54ab689df773318809eed3cbe794b4492dae4',
    },
    {
      name: 'tokenizer_config.json',
      url: `${base}/tokenizer_config.json`,
      sizeBytes: 9_762,
      sha256:
        '3c0884a30471f4f542dc89630f62a380bb70a341fafda826136a7be921fec7ea',
    },
  ],
} as const;
