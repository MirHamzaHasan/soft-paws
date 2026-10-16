package com.draco.arts.apps.bark.log.dogs.journal

import android.content.Context
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import com.dracoarts.shared.managers.HapticKind
import com.dracoarts.shared.managers.HapticManager

class AndroidHapticManager(context: Context) : HapticManager {
    private val vibrator = context.getSystemService(Vibrator::class.java)

    override fun perform(kind: HapticKind) {
        if (vibrator?.hasVibrator() != true) return
        val duration = when (kind) {
            HapticKind.Selection, HapticKind.Light -> 15L
            HapticKind.Medium, HapticKind.Success -> 30L
            HapticKind.Heavy, HapticKind.Warning -> 55L
            HapticKind.Error -> 80L
        }
        val amplitude = when (kind) {
            HapticKind.Selection, HapticKind.Light -> 60
            HapticKind.Medium, HapticKind.Success -> 120
            HapticKind.Heavy, HapticKind.Warning, HapticKind.Error -> 200
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            vibrator.vibrate(VibrationEffect.createOneShot(duration, amplitude))
        } else {
            @Suppress("DEPRECATION")
            vibrator.vibrate(duration)
        }
    }
}
