package com.dracoarts.shared.services.ai

data class ModelFile(val name: String, val repo: String, val revision: String, val bytes: Long, val sha256: String) {
    val url get() = "https://huggingface.co/$repo/resolve/$revision/$name"
}
data class ModelSpec(val kind: ModelKind, val title: String, val files: List<ModelFile>) {
    val bytes get() = files.sumOf { it.bytes }
    val sizeLabel get() = "${(bytes + 999_999) / 1_000_000} MB"
}
/** Publisher-owned GGUF files, immutable revisions and LFS SHA-256, Apache 2.0. */
object ModelCatalog {
    val text = ModelSpec(ModelKind.Text, "Qwen 2.5 · 0.5B", listOf(ModelFile(
        "qwen2.5-0.5b-instruct-q4_k_m.gguf", "Qwen/Qwen2.5-0.5B-Instruct-GGUF", "9217f5db79a29953eb74d5343926648285ec7e67", 491400032,
        "74a4da8c9fdbcd15bd1f6d01d621410d31c6fc00986f5eb687824e7b93d7a9db")))
    val photo = ModelSpec(ModelKind.Photo, "SmolVLM · 500M", listOf(
        ModelFile("SmolVLM-500M-Instruct-Q8_0.gguf", "ggml-org/SmolVLM-500M-Instruct-GGUF", "72e986006ef53e37cdd3f6d4241c90b0f01df376", 436806912,
            "9d4612de6a42214499e301494a3ecc2be0abdd9de44e663bda63f1152fad1bf4"),
        ModelFile("mmproj-SmolVLM-500M-Instruct-f16.gguf", "ggml-org/SmolVLM-500M-Instruct-GGUF", "72e986006ef53e37cdd3f6d4241c90b0f01df376", 199468800,
            "4b2fca922e549e9b9608f4ba56f93565dd5220e935ba5570a2a864a0fcc988a6")))
    val all = listOf(text, photo)
    fun spec(kind: ModelKind) = if (kind == ModelKind.Text) text else photo
}
