package com.dracoarts.shared.presentation.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.staticCompositionLocalOf
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.LineHeightStyle
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.dracoarts.shared.generated.resources.Res
import com.dracoarts.shared.generated.resources.inter_regular
import com.dracoarts.shared.generated.resources.inter_medium
import com.dracoarts.shared.generated.resources.bricolage_bold
import com.dracoarts.shared.generated.resources.bricolage_extra_bold
import com.dracoarts.shared.generated.resources.bricolage_numbers
import com.dracoarts.shared.generated.resources.bricolage_section
import org.jetbrains.compose.resources.Font

object BarkLogColors {
    val ink = GeneratedDesignTokens.Light.ink
    val paper = GeneratedDesignTokens.Light.ground
    val surface = GeneratedDesignTokens.Light.inset
    val border = GeneratedDesignTokens.Light.hair
    val muted = GeneratedDesignTokens.Light.inkMuted
    val danger = GeneratedDesignTokens.Light.bad
}

object AppSpacing {
    val page = 20.dp
    val section = 32.dp
    val controlHeight = 56.dp
    val contentMaxWidth = 640.dp
}

private val LightColors = lightColorScheme(
    primary = GeneratedDesignTokens.Light.btn, onPrimary = GeneratedDesignTokens.Light.btnInk,
    background = BarkLogColors.paper, onBackground = BarkLogColors.ink,
    surface = GeneratedDesignTokens.Light.panel, onSurface = BarkLogColors.ink,
    surfaceVariant = BarkLogColors.surface, onSurfaceVariant = BarkLogColors.muted,
    outline = BarkLogColors.muted, outlineVariant = BarkLogColors.border,
    error = BarkLogColors.danger,
)

val LocalBoardColors = staticCompositionLocalOf { GeneratedDesignTokens.Light.values }
val LocalBarkDarkTheme = staticCompositionLocalOf { false }
val LocalDisplayFont = staticCompositionLocalOf<FontFamily> { FontFamily.Default }
val LocalNumberFont = staticCompositionLocalOf<FontFamily> { FontFamily.Default }
@Composable fun boardColor(name: String) = LocalBoardColors.current.getValue(name)
private val DarkColors = darkColorScheme(
    primary = GeneratedDesignTokens.Dark.btn, onPrimary = GeneratedDesignTokens.Dark.btnInk,
    background = GeneratedDesignTokens.Dark.ground, onBackground = GeneratedDesignTokens.Dark.ink,
    surface = GeneratedDesignTokens.Dark.panel, onSurface = GeneratedDesignTokens.Dark.ink,
    surfaceVariant = GeneratedDesignTokens.Dark.inset, onSurfaceVariant = GeneratedDesignTokens.Dark.inkMuted,
    outline = GeneratedDesignTokens.Dark.hair2, outlineVariant = GeneratedDesignTokens.Dark.hair,
    error = GeneratedDesignTokens.Dark.bad,
)

@Composable
fun AppTheme(darkTheme: Boolean = isSystemInDarkTheme(), contrast: Boolean = false, content: @Composable () -> Unit) {
    val inter = FontFamily(
        Font(Res.font.inter_regular, FontWeight.Normal),
        Font(Res.font.inter_medium, FontWeight.Medium),
    )
    val display = FontFamily(Font(Res.font.bricolage_bold, FontWeight.Bold), Font(Res.font.bricolage_extra_bold, FontWeight.ExtraBold))
    val section = FontFamily(Font(Res.font.bricolage_section, FontWeight.Bold))
    val numbers = FontFamily(Font(Res.font.bricolage_numbers, FontWeight.ExtraBold))
    fun style(size: Int, weight: FontWeight = FontWeight.Normal, leading: Double = 1.45) =
        TextStyle(fontFamily = inter, fontSize = size.sp, lineHeight = (size * leading).sp, fontWeight = weight,
            platformStyle = boardPlatformTextStyle(),
            lineHeightStyle = LineHeightStyle(LineHeightStyle.Alignment.Center, LineHeightStyle.Trim.None),
            fontFeatureSettings = "tnum", letterSpacing = if (size >= 24) (-.6).sp else 0.sp)
    fun heading(size: Int, leading: Double = 1.02, weight: FontWeight = FontWeight.Bold, tracking: Double = -.035) =
        TextStyle(fontFamily = if (size <= 22) section else display, fontSize = size.sp, lineHeight = (size * leading).sp,
            platformStyle = boardPlatformTextStyle(),
            fontWeight = weight, letterSpacing = (size * tracking).sp,
            lineHeightStyle = LineHeightStyle(LineHeightStyle.Alignment.Center, LineHeightStyle.Trim.None))
    val typography = Typography(
        displayLarge = heading(44, .96, FontWeight.ExtraBold, -.045),
        displaySmall = heading(34),
        headlineSmall = heading(30),
        titleLarge = heading(21, 1.15, tracking = -.025),
        titleMedium = style(15, FontWeight.Medium),
        bodyLarge = style(16), bodyMedium = style(14), bodySmall = style(12),
        labelLarge = style(15, FontWeight.Medium),
        labelMedium = style(12, FontWeight.Medium),
        labelSmall = style(10),
    )
    val boardTokens = if (darkTheme) GeneratedDesignTokens.Dark.values else GeneratedDesignTokens.Light.values
    val accessibleTokens = if (contrast) boardTokens.mapValues { (name, color) -> when {
        name == "hair" || name.endsWith("-line") -> boardTokens.getValue("ink-muted")
        name == "hair-2" -> boardTokens.getValue("ink-strong")
        name == "ink-quiet" -> boardTokens.getValue("ink-muted")
        else -> color
    } } else boardTokens
    CompositionLocalProvider(LocalBoardColors provides accessibleTokens,
        LocalBarkDarkTheme provides darkTheme, LocalDisplayFont provides display, LocalNumberFont provides numbers) {
    MaterialTheme(
        colorScheme = (if (darkTheme) DarkColors else LightColors).let { if (contrast) it.copy(outlineVariant = it.onSurfaceVariant, outline = it.onSurface) else it },
        typography = typography,
        content = content,
    )
    }
}
