package com.dracoarts.shared.presentation.components

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.onGloballyPositioned
import androidx.compose.ui.layout.positionInWindow
import androidx.compose.ui.platform.LocalWindowInfo
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.services.DeviceServices
import com.dracoarts.shared.services.decodeLocalPhoto
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

private sealed interface PhotoFrame {
    data object Loading : PhotoFrame
    data object Missing : PhotoFrame
    data class Ready(val bitmap: ImageBitmap) : PhotoFrame
}

@Composable
fun LocalPhoto(fileId: String, description: String, device: DeviceServices, modifier: Modifier = Modifier, onUnavailable: () -> Unit = {}) {
    var frame by remember(fileId) { mutableStateOf<PhotoFrame>(PhotoFrame.Loading) }
    var visible by remember(fileId) { mutableStateOf(false) }
    val windowHeight = LocalWindowInfo.current.containerSize.height
    LaunchedEffect(fileId, visible) {
        frame = PhotoFrame.Loading
        if (visible) frame = withContext(Dispatchers.Default) { device.photoBytes(fileId)?.let(::decodeLocalPhoto)?.let(PhotoFrame::Ready) ?: PhotoFrame.Missing }
    }
    val bitmap = (frame as? PhotoFrame.Ready)?.bitmap
    LaunchedEffect(fileId, frame, visible) { if (visible && frame == PhotoFrame.Missing) onUnavailable() }
    Box(modifier.fillMaxWidth().then(if (frame == PhotoFrame.Missing) Modifier.heightIn(min = 158.dp) else Modifier.height(158.dp)).onGloballyPositioned { coordinates ->
        val top = coordinates.positionInWindow().y
        visible = top + coordinates.size.height >= -220 && top <= windowHeight + 220
    }) {
    if (bitmap != null) Image(bitmap, description, Modifier.fillMaxSize().clip(RoundedCornerShape(24.dp)), contentScale = ContentScale.Crop)
    else if (visible) JournalCard(if (frame == PhotoFrame.Missing) Modifier.fillMaxWidth() else Modifier.fillMaxSize()) {
        if (frame == PhotoFrame.Loading) { SkeletonLine(160.dp, 60.dp); CaptionText("Opening photo…") }
        else { BarkIcon("image", Modifier.size(30.dp)); SectionTitle("Photo unavailable"); SupportingText("The caption, date and notes stay saved. You can choose a replacement photo.") }
    }
    }
}
