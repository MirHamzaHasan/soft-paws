package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material3.IconButton
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.state.JournalDates
import com.dracoarts.shared.services.DeviceResult
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.datetime.LocalDate
import kotlinx.datetime.LocalTime

/** The native picker commits only on Done; labelled text entry stays available. */
@Composable
internal fun CareDateTimeField(form: FeatureForm, key: String, label: String, context: FeatureContext, time: Boolean = false) {
    var choosing by remember(form, key) { mutableStateOf(false) }
    val scope = rememberCoroutineScope()
    val focus = LocalFocusManager.current
    val keyboard = LocalSoftwareKeyboardController.current
    val enabled = !context.saving && !choosing
    BarkField(label, form[key], { if (it.length <= if (time) 8 else 10) form[key] = it },
        Modifier.fillMaxWidth(), enabled, softPaws = true, trailingAction = {
            IconButton(onClick = choose@{
                if (choosing || context.saving) return@choose
                focus.clearFocus(); keyboard?.hide(); choosing = true
                scope.launch {
                    try {
                        val valid = runCatching { if (time) LocalTime.parse(form[key]) else LocalDate.parse(form[key]) }.isSuccess
                        val initial = if (valid) form[key] else if (time) "09:00" else JournalDates.day(context.now, context.zone).toString()
                        val result = if (time) context.platform.device.pickTime(initial, label) else context.platform.device.pickDate(initial, label)
                        when (result) {
                            is DeviceResult.Success -> {
                                if (time) LocalTime.parse(result.value) else LocalDate.parse(result.value)
                                form[key] = result.value
                            }
                            DeviceResult.Cancelled -> Unit
                            DeviceResult.Denied -> form.error = "Couldn't open this picker. You can still enter the value."
                            is DeviceResult.Failed -> form.error = result.message
                        }
                    } catch (cancelled: CancellationException) { throw cancelled }
                    catch (_: Exception) { form.error = "Couldn't use this picker. Your entered value is unchanged." }
                    finally { choosing = false }
                }
            }, enabled = enabled, modifier = Modifier.size(48.dp).semantics { contentDescription = "Choose ${if (time) "time" else "date"} for $label" }) {
                BarkIcon(if (time) "clock" else "calendar", Modifier.size(20.dp))
            }
        })
}
