package com.dracoarts.shared.presentation.companion

import kotlin.random.Random

/** Names and durations are the authored Dog Controller contract, not frame-rate assumptions. */
enum class RiveDogAction(val trigger: String, val durationMs: Int) {
    Hello("hello", 2400), Curious("curious", 2800), Saved("saved", 2200),
    Sleepy("sleepy", 3400), Sniff("sniff", 2400), Ears("ears", 2400), Rest("rest", 180),
}

data class RiveDogCue(val action: RiveDogAction, val serial: Int)

/** Quiet idles exclude greetings and earned save feedback; no repeat across bag boundaries. */
class RiveDogShuffle(private val random: Random = Random.Default) {
    private var bag = mutableListOf<RiveDogAction>()
    private var last: RiveDogAction? = null
    fun next(): RiveDogAction {
        if (bag.isEmpty()) {
            bag = listOf(RiveDogAction.Curious, RiveDogAction.Sleepy, RiveDogAction.Sniff, RiveDogAction.Ears).shuffled(random).toMutableList()
            if (bag.last() == last) { val first = bag[0]; bag[0] = bag.last(); bag[bag.lastIndex] = first }
        }
        return bag.removeAt(bag.lastIndex).also { last = it }
    }
}
