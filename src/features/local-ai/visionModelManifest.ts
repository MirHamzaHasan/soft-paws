// Florence-2-base-ft ONNX weights, pinned to an ONNX Community revision.
// These files are optional and downloaded only at the caregiver's request.
const revision = 'e88a44eaf3791a35eae0c5a47b3dbcd36e67eb6f';
const base = `https://huggingface.co/onnx-community/Florence-2-base-ft/resolve/${revision}`;

export const LOCAL_VISION_MODEL = {
  id: 'florence2-base-ft-caption-v1',
  label: 'Local photo description',
  sizeBytes: 186_197_519,
  files: [
    {
      name: 'vision_encoder_q4f16.onnx',
      url: `${base}/onnx/vision_encoder_q4f16.onnx`,
      sizeBytes: 62_416_644,
      sha256:
        '1e993fb7081302294b5c286b2cc6c2a63283959f399317dc2be49eca94f2dd18',
    },
    {
      name: 'encoder_model_q4f16.onnx',
      url: `${base}/onnx/encoder_model_q4f16.onnx`,
      sizeBytes: 25_705_965,
      sha256:
        '1550d697836639b0fec53023dac96253342c2ec1e7fa682595fda80d157e9f64',
    },
    {
      name: 'embed_tokens_int8.onnx',
      url: `${base}/onnx/embed_tokens_int8.onnx`,
      sizeBytes: 39_390_433,
      sha256:
        '6b2258db1c8ee9b160576ccde3cd3814d83a2edaed0dd1c6ca9ff3c38fa62214',
    },
    {
      name: 'decoder_model_q4f16.onnx',
      url: `${base}/onnx/decoder_model_q4f16.onnx`,
      sizeBytes: 56_188_858,
      sha256:
        'ba61f607285efe9ee2c30c968ae7f4705957353479f76900a95c8d60573c54f3',
    },
    {
      name: 'tokenizer.json',
      url: `${base}/tokenizer.json`,
      sizeBytes: 2_297_961,
      sha256:
        'd69dcdb2323e124ac4f800cb9863ddccea0d7bb11e16125e8df3bd60f2f8aeac',
    },
    {
      name: 'tokenizer_config.json',
      url: `${base}/tokenizer_config.json`,
      sizeBytes: 197_658,
      sha256:
        'd8e64607233cb53b619fb46664f6cad08176c26e0e8735b2d30d888364f19600',
    },
  ],
} as const;
