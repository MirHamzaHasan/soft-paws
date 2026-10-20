package com.draco.arts.apps.bark.log.dogs.journal

import com.dracoarts.shared.presentation.companion.RiveDogAction
import com.dracoarts.shared.presentation.companion.RiveDogShuffle
import kotlin.random.Random
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertNotEquals

class RiveDogMotionTest {
    @Test fun quietIdlesCoverEveryActionWithoutRepeatingAtBagBoundaries() {
        repeat(40) { seed ->
            val shuffle = RiveDogShuffle(Random(seed))
            val actions = List(80) { shuffle.next() }
            actions.windowed(2).forEach { assertNotEquals(it[0], it[1]) }
            actions.chunked(4).forEach { assertEquals(4, it.toSet().size) }
            assertFalse(actions.any { it == RiveDogAction.Saved || it == RiveDogAction.Hello })
        }
    }
}
