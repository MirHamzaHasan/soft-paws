package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.SoundPool
import android.provider.Settings
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.io.File

class AndroidInteractionSounds(context: Context) : InteractionSoundPlayer {
    private val app = context.applicationContext
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main.immediate)
    private val state = MutableStateFlow(SoundReadiness.Idle)
    override val readiness = state.asStateFlow()
    private var pool: SoundPool? = null
    private val ids = mutableMapOf<String, Int>()
    private var stream = 0
    private var closed = false
    private var generation = 0
    override fun prepare() {
        if (closed || state.value in setOf(SoundReadiness.Ready, SoundReadiness.Loading)) return
        state.value = SoundReadiness.Loading
        val version = ++generation
        scope.launch {
            try {
                val files = withContext(Dispatchers.IO) { interactionSoundKeys.associateWith { key ->
                    File(app.cacheDir, "barklog-sound-$key.wav").also { it.writeBytes(interactionSoundBytes(key)) }
                } }
                if (closed || version != generation) return@launch
                pool?.release(); ids.clear()
                val next = SoundPool.Builder().setMaxStreams(1).setAudioAttributes(AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION).build()).build()
                pool = next
                val loaded = mutableSetOf<Int>()
                next.setOnLoadCompleteListener { _, id, status -> scope.launch {
                    if (closed || pool !== next || version != generation) return@launch
                    if (status != 0) { state.value = SoundReadiness.Unavailable; next.release(); pool = null; ids.clear() }
                    else { loaded.add(id); if (loaded.size == interactionSoundKeys.size) state.value = SoundReadiness.Ready }
                } }
                files.forEach { (key, file) -> ids[key] = next.load(file.path, 1).also { check(it != 0) } }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { pool?.release(); pool = null; ids.clear(); state.value = SoundReadiness.Unavailable }
        }
    }
    override fun play(cue: SoundCue, texture: String, volume: Float) {
        if (closed || state.value != SoundReadiness.Ready) return
        val audio = app.getSystemService(Context.AUDIO_SERVICE) as AudioManager
        if (audio.mode != AudioManager.MODE_NORMAL || audio.ringerMode != AudioManager.RINGER_MODE_NORMAL || audio.getStreamVolume(AudioManager.STREAM_SYSTEM) == 0 || Settings.System.getInt(app.contentResolver, Settings.System.SOUND_EFFECTS_ENABLED, 1) == 0) return
        val id = ids[soundKey(cue, texture)] ?: return
        stop(); stream = pool?.play(id, volume, volume, 1, 0, 1f) ?: 0
    }
    override fun stop() { if (stream != 0) pool?.stop(stream); stream = 0 }
    override fun close() { if (closed) return; closed = true; generation++; stop(); pool?.release(); pool = null; scope.cancel() }
}
