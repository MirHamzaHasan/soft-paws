package com.dracoarts.shared.domain.model

import kotlinx.serialization.Serializable

@Serializable
enum class HighlightAspect(val width: Int, val height: Int) { Portrait(720, 1280), Square(720, 720) }
@Serializable
data class HighlightClip(val photoId: String, val caption: String = "")
@Serializable
data class HighlightDraft(val dogId: String, val clips: List<HighlightClip> = emptyList(), val aspect: HighlightAspect = HighlightAspect.Portrait, val revision: Long = 0, val title: String = "") {
    val durationMs: Long get() = clips.size * CLIP_MS
    fun validate(forExport: Boolean = false) {
        require(dogId.isNotBlank())
        require(title.length <= 100) { "Keep the film title within 100 characters." }
        require(clips.size in (if (forExport) 3 else 0)..12) { "Choose 3–12 photos for your film." }
        require(clips.all { LocalAttachmentRules.image.matches(it.photoId) && it.caption.length <= 100 }) { "Choose a valid photo and a caption up to 100 characters." }
        require(clips.map { it.photoId }.distinct().size == clips.size) { "This photo is already in your film." }
    }
    companion object { const val CLIP_MS = 2800L; const val FPS = 30; const val SLOT = "video-highlight-v1" }
}
