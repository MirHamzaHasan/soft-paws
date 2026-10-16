package com.dracoarts.shared

import kotlin.test.Test
import kotlin.test.assertEquals

class NativeCollectionsRegressionTest {
    @Test fun removingAndReinsertingCollidingNativeKeysDoesNotDuplicateKeys() {
        // Collision sequence from JetBrains KT-82783. This corrupts Compose's
        // layout-node heap on the old Kotlin/Native runtime, beyond app-level recovery.
        // https://youtrack.jetbrains.com/issue/KT-82783
        val keys = listOf(148961824, 148962400, 148963552, 148964704, 148965856,
            148967008, 148968160, 148969312, 148970464, 148971616, 148972768,
            148973920, 148975072, 148976224, 148977376, 148978528)
        val values = mutableMapOf<Int, Int>()
        keys.forEach { values[it] = 1 }
        values.remove(keys.first())
        values[keys.last()] = 2
        assertEquals(keys.drop(1).toSet(), values.keys)
        assertEquals(15, values.size)
        assertEquals(15, values.keys.toList().distinct().size)
        assertEquals(1, values.keys.count { it == keys.last() })
        assertEquals(2, values[keys.last()])
        keys.drop(1).forEach { values.remove(it) }
        assertEquals(0, values.size)
    }
}
