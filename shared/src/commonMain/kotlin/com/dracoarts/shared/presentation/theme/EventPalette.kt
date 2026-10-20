package com.dracoarts.shared.presentation.theme

import androidx.compose.ui.graphics.Color
import com.dracoarts.shared.domain.model.CareEventType

data class EventPalette(val background: Color, val border: Color, val text: Color) {
    companion object {
        fun forType(type: CareEventType, dark: Boolean): EventPalette {
            val palette = if (dark) SoftPawsDesignTokens.Dark.values else SoftPawsDesignTokens.Light.values
            return EventPalette(palette.getValue("${type.key}-bg"), palette.getValue("${type.key}-line"), palette.getValue("${type.key}-ink"))
        }
    }
}
