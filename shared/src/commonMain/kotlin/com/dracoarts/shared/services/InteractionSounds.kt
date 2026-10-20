package com.dracoarts.shared.services

import com.dracoarts.shared.generated.resources.Res
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import org.jetbrains.compose.resources.ExperimentalResourceApi

enum class SoundCue { Tap, Selection, Saved }
enum class SoundReadiness { Idle, Loading, Ready, Unavailable }

interface InteractionSoundPlayer {
    val readiness: StateFlow<SoundReadiness>
    fun prepare()
    fun play(cue: SoundCue, texture: String, volume: Float)
    fun stop()
    fun close()
}

object SilentInteractionSoundPlayer : InteractionSoundPlayer {
    override val readiness = MutableStateFlow(SoundReadiness.Unavailable).asStateFlow()
    override fun prepare() = Unit
    override fun play(cue: SoundCue, texture: String, volume: Float) = Unit
    override fun stop() = Unit
    override fun close() = Unit
}

fun soundKey(cue: SoundCue, texture: String): String = if (cue == SoundCue.Saved) "saved" else "${if (texture == "pop") "pop" else "wood"}-${cue.name.lowercase()}"
val interactionSoundKeys = listOf("wood-tap", "wood-selection", "pop-tap", "pop-selection", "saved")

@OptIn(ExperimentalResourceApi::class)
suspend fun interactionSoundBytes(key: String): ByteArray {
    require(key in interactionSoundKeys)
    return Res.readBytes("files/sounds/$key.wav")
}

/** UI preferences only. Restoring them never plays a sound. */
class InteractionSounds(private val player: InteractionSoundPlayer, private val now: () -> Long) {
    private var enabled = false
    private var volume = .35f
    private var texture = "wood"
    private var foreground = true
    private var closed = false
    private var lastAt: Long? = null
    val readiness get() = player.readiness
    fun configure(enabled: Boolean, volume: Float, texture: String, foreground: Boolean) {
        if (closed) return
        val starting = !this.enabled && enabled
        this.enabled = enabled; this.volume = volume.takeIf { it.isFinite() }?.coerceIn(0f, 1f) ?: 0f; this.texture = if (texture == "pop") "pop" else "wood"; this.foreground = foreground
        if (!enabled || !foreground || this.volume == 0f) runCatching { player.stop() }
        else if (starting || player.readiness.value == SoundReadiness.Idle) runCatching { player.prepare() }
    }
    fun retry() { if (!closed && enabled && foreground && volume > 0f) runCatching { player.prepare() } }
    fun play(cue: SoundCue) {
        if (closed || !enabled || !foreground || volume == 0f) return
        val at = now()
        if (cue != SoundCue.Saved && lastAt?.let { at - it in 0..69 } == true) return
        lastAt = at
        runCatching { player.play(cue, texture, volume) }
    }
    fun close() { closed = true; runCatching { player.stop() }; runCatching { player.close() } }
}
