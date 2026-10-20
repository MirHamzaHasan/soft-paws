package com.dracoarts.shared.presentation.companion

/** File 2667919's authored view-model triggers and real clip durations. */
enum class CatAction(val trigger: String, val durationMs: Int) {
    Hello("hello", 2400), Curious("curious", 2800), Saved("saved", 2200), Rest("rest", 180),
}
data class CatCue(val action: CatAction, val serial: Int)
