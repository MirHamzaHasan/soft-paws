package com.dracoarts.shared.presentation.components

import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import app.rive.*
import com.dracoarts.shared.R
import com.dracoarts.shared.presentation.companion.CatCue
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

@Composable
internal actual fun RiveCatSurface(modifier: Modifier, cue: CatCue?, playing: Boolean, onReady: (Boolean) -> Unit) {
    val context = LocalContext.current.applicationContext
    var initialized by remember { mutableStateOf(false) }
    LaunchedEffect(context) {
        initialized = withContext(Dispatchers.IO) {
            runCatching { app.rive.runtime.kotlin.core.Rive.init(context); true }.getOrDefault(false)
        }
    }
    if (!initialized) return
    val errors = remember { mutableStateOf<Throwable?>(null) }
    val worker = rememberRiveWorkerOrNull(errors) ?: return
    val file = (rememberRiveFile(RiveFileSource.RawRes.from(R.raw.soft_paws_cat), worker) as? Result.Success)?.value ?: return
    val artboard = (rememberArtboardResult(file, "Soft Paws Cat") as? Result.Success)?.value ?: return
    val machine = (rememberStateMachineResult(artboard, "Cat Companion") as? Result.Success)?.value ?: return
    val binding = (rememberViewModelInstanceResult(file, remember(artboard) { ViewModelSource.DefaultForArtboard(artboard).defaultInstance() }) as? Result.Success)?.value ?: return
    val ready by rememberUpdatedState(onReady)
    DisposableEffect(binding) { onDispose { ready(false) } }
    LaunchedEffect(binding, cue?.serial) { cue?.let { binding.fireTrigger(it.action.trigger) } }
    Rive(file, modifier, playing, artboard, machine, binding, fit = Fit.Contain(),
        backgroundColor = android.graphics.Color.TRANSPARENT, onBitmapAvailable = { ready(true) })
}
