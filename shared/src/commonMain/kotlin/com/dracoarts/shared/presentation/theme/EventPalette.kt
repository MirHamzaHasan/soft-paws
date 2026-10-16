package com.dracoarts.shared.presentation.theme

import androidx.compose.ui.graphics.Color
import com.dracoarts.shared.domain.model.CareEventType

data class EventPalette(val background: Color, val border: Color, val text: Color) {
    companion object {
        fun forType(type: CareEventType, dark: Boolean): EventPalette = when (type) {
            CareEventType.Poop -> if (dark) EventPalette(GeneratedDesignTokens.Dark.poopBg, GeneratedDesignTokens.Dark.poopLine, GeneratedDesignTokens.Dark.poopInk) else EventPalette(GeneratedDesignTokens.Light.poopBg, GeneratedDesignTokens.Light.poopLine, GeneratedDesignTokens.Light.poopInk)
            CareEventType.Pee -> if (dark) EventPalette(GeneratedDesignTokens.Dark.peeBg, GeneratedDesignTokens.Dark.peeLine, GeneratedDesignTokens.Dark.peeInk) else EventPalette(GeneratedDesignTokens.Light.peeBg, GeneratedDesignTokens.Light.peeLine, GeneratedDesignTokens.Light.peeInk)
            CareEventType.Meal -> if (dark) EventPalette(GeneratedDesignTokens.Dark.mealBg, GeneratedDesignTokens.Dark.mealLine, GeneratedDesignTokens.Dark.mealInk) else EventPalette(GeneratedDesignTokens.Light.mealBg, GeneratedDesignTokens.Light.mealLine, GeneratedDesignTokens.Light.mealInk)
            CareEventType.Walk -> if (dark) EventPalette(GeneratedDesignTokens.Dark.walkBg, GeneratedDesignTokens.Dark.walkLine, GeneratedDesignTokens.Dark.walkInk) else EventPalette(GeneratedDesignTokens.Light.walkBg, GeneratedDesignTokens.Light.walkLine, GeneratedDesignTokens.Light.walkInk)
            CareEventType.Mood -> if (dark) EventPalette(GeneratedDesignTokens.Dark.moodBg, GeneratedDesignTokens.Dark.moodLine, GeneratedDesignTokens.Dark.moodInk) else EventPalette(GeneratedDesignTokens.Light.moodBg, GeneratedDesignTokens.Light.moodLine, GeneratedDesignTokens.Light.moodInk)
            CareEventType.Symptom -> if (dark) EventPalette(GeneratedDesignTokens.Dark.symptomBg, GeneratedDesignTokens.Dark.symptomLine, GeneratedDesignTokens.Dark.symptomInk) else EventPalette(GeneratedDesignTokens.Light.symptomBg, GeneratedDesignTokens.Light.symptomLine, GeneratedDesignTokens.Light.symptomInk)
            CareEventType.Behavior -> if (dark) EventPalette(GeneratedDesignTokens.Dark.behaviorBg, GeneratedDesignTokens.Dark.behaviorLine, GeneratedDesignTokens.Dark.behaviorInk) else EventPalette(GeneratedDesignTokens.Light.behaviorBg, GeneratedDesignTokens.Light.behaviorLine, GeneratedDesignTokens.Light.behaviorInk)
            CareEventType.Grooming -> if (dark) EventPalette(GeneratedDesignTokens.Dark.groomingBg, GeneratedDesignTokens.Dark.groomingLine, GeneratedDesignTokens.Dark.groomingInk) else EventPalette(GeneratedDesignTokens.Light.groomingBg, GeneratedDesignTokens.Light.groomingLine, GeneratedDesignTokens.Light.groomingInk)
            CareEventType.Weight -> if (dark) EventPalette(GeneratedDesignTokens.Dark.weightBg, GeneratedDesignTokens.Dark.weightLine, GeneratedDesignTokens.Dark.weightInk) else EventPalette(GeneratedDesignTokens.Light.weightBg, GeneratedDesignTokens.Light.weightLine, GeneratedDesignTokens.Light.weightInk)
            else -> if (dark) EventPalette(GeneratedDesignTokens.Dark.inset, GeneratedDesignTokens.Dark.hair, GeneratedDesignTokens.Dark.ink) else EventPalette(GeneratedDesignTokens.Light.inset, GeneratedDesignTokens.Light.hair, GeneratedDesignTokens.Light.ink)
        }
    }
}
