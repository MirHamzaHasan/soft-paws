@file:OptIn(kotlinx.cinterop.ExperimentalForeignApi::class)
package com.dracoarts.shared

import com.dracoarts.shared.services.*
import kotlinx.cinterop.*
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import platform.AVFAudio.*
import platform.Foundation.*
import platform.UIKit.*

class IosInteractionSounds : InteractionSoundPlayer {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private val state = MutableStateFlow(SoundReadiness.Idle)
    override val readiness = state.asStateFlow()
    private val players = mutableMapOf<String, AVAudioPlayer>()
    private var closed = false
    private val observers = listOf(UIApplicationWillResignActiveNotification, AVAudioSessionInterruptionNotification, AVAudioSessionRouteChangeNotification).map { name ->
        NSNotificationCenter.defaultCenter.addObserverForName(name, null, NSOperationQueue.mainQueue) { stop() }
    }
    override fun prepare() {
        if (closed || state.value in setOf(SoundReadiness.Loading, SoundReadiness.Ready)) return
        state.value = SoundReadiness.Loading
        scope.launch {
            try {
                val bytes = withContext(Dispatchers.Default) { interactionSoundKeys.associateWith { interactionSoundBytes(it) } }
                if (closed) return@launch
                check(AVAudioSession.sharedInstance().setCategory(AVAudioSessionCategoryAmbient, error = null))
                bytes.forEach { (key, value) ->
                    val data = value.usePinned { NSData.create(bytes = it.addressOf(0), length = value.size.toULong()) }
                    val player = AVAudioPlayer(data = data, error = null)
                    check(player.prepareToPlay()); players[key] = player
                }
                state.value = SoundReadiness.Ready
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { stop(); players.clear(); state.value = SoundReadiness.Unavailable }
        }
    }
    override fun play(cue: SoundCue, texture: String, volume: Float) {
        if (closed || state.value != SoundReadiness.Ready || UIApplication.sharedApplication.applicationState != UIApplicationState.UIApplicationStateActive) return
        val player = players[soundKey(cue, texture)] ?: return
        stop(); player.currentTime = 0.0; player.volume = volume; player.play()
    }
    override fun stop() { players.values.forEach { it.stop() } }
    override fun close() { if (closed) return; closed = true; stop(); scope.cancel(); players.clear(); observers.forEach(NSNotificationCenter.defaultCenter::removeObserver) }
}
