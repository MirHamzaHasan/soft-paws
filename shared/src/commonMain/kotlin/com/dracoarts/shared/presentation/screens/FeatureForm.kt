package com.dracoarts.shared.presentation.screens

import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.Saver
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.foundation.layout.fillMaxWidth
import com.dracoarts.shared.presentation.components.BarkField
import com.dracoarts.shared.presentation.components.ErrorCard
import com.dracoarts.shared.presentation.components.BoardConfirmDialog
import com.dracoarts.shared.domain.repository.LocalDraft
import androidx.compose.material3.*
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.debounce
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json

@Serializable private data class SavedForm(val requestId: String, val values: Map<String, String>, val baseline: Map<String, String> = values, val completed: Boolean = false)
class FeatureForm(id: String, initial: Map<String, String>) {
    var requestId by mutableStateOf(id)
    var values by mutableStateOf(initial)
    var error by mutableStateOf<String?>(null)
    var baseline by mutableStateOf(initial)
    var completed by mutableStateOf(false)
    var closeRequested by mutableStateOf(false)
    var restored = false
    var slot = ""
    val lock = Mutex()
    val dirty get() = values.filterKeys { !it.startsWith('_') } != baseline.filterKeys { !it.startsWith('_') }
    fun encode() = Json.encodeToString(SavedForm.serializer(), SavedForm(requestId, values, baseline, completed))
    fun restore(value: String) { val saved = Json.decodeFromString(SavedForm.serializer(), value); requestId = saved.requestId; values = saved.values; baseline = saved.baseline; completed = saved.completed }
    fun files() = listOf("file", "receipt", "photo").mapNotNull { values[it]?.takeIf { value -> value.isNotBlank() } }.distinct()
    operator fun get(key: String) = values[key].orEmpty()
    val expectedRevision get() = values["_revision"]?.toLongOrNull()
    val createdAt get() = values.getValue("_createdAt").toLong()
    operator fun set(key: String, value: String) { values = values + (key to value); error = null }
    fun reset(id: String, initial: Map<String, String>) { requestId = id; values = initial + ("_createdAt" to (initial["_createdAt"] ?: values["_createdAt"] ?: "0")); baseline = values; completed = true; error = null }
    suspend fun attempt(block: suspend () -> Unit) {
        try { lock.withLock { error = null; block() } }
        catch (cancelled: CancellationException) { throw cancelled }
        catch (cause: IllegalArgumentException) { error = cause.message ?: "Check the entered details." }
        catch (_: Exception) { error = "Couldn't keep this change. Your entries stay here; please try again." }
    }
    companion object {
        val Saver = Saver<FeatureForm, String>(save = { it.encode() }, restore = { runCatching { FeatureForm("", emptyMap()).apply { restore(it); restored = true } }.getOrNull() })
    }
}

@Composable
@OptIn(kotlinx.coroutines.FlowPreview::class)
fun rememberFeatureForm(context: FeatureContext, slot: String, initial: Map<String, String> = emptyMap()): FeatureForm {
    val item = context.items.firstOrNull { it.id == context.navigation.featurePage?.id?.substringBefore('@') }
    val defaults = initial + mapOf("_createdAt" to (item?.occurredAt ?: context.now).toString()) +
        ((item?.revision ?: if (slot.startsWith("profile-")) context.dog.revision else null)?.let { mapOf("_revision" to it.toString()) } ?: emptyMap())
    val form = rememberSaveable(context.dog.id, slot, saver = FeatureForm.Saver) { FeatureForm(context.platform.newId(), defaults) }
    form.slot = slot
    val persistent = !slot.startsWith("report") && !slot.startsWith("enrollment-") && !slot.startsWith("session-")
    val scope = rememberCoroutineScope()
    LaunchedEffect(form) {
        if (form.completed) { form.reset(context.platform.newId(), defaults); form.completed = false }
        else if (persistent && !form.restored && !form.dirty) {
            try { context.care.loadDraft(context.dog.id, slot)?.let { form.restore(it.value) } }
            catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { form.error = "Couldn't reopen a retained draft. Your current entries stay here." }
        }
        if (persistent) snapshotFlow { form.values to form.completed }.debounce(350).collect {
            form.lock.withLock {
                if (form.dirty && !form.completed) try { context.care.saveDraft(context.dog.id, slot, LocalDraft(form.encode(), form.files())) }
                catch (cancelled: CancellationException) { throw cancelled }
                catch (_: Exception) { form.error = "Couldn't retain this draft. Keep this screen open and try saving again." }
            }
        }
    }
    DisposableEffect(form, persistent) {
        val guard: () -> Boolean = { if (form.dirty && !form.completed) { form.closeRequested = true; true } else false }
        if (persistent) context.navigation.backGuard = guard
        onDispose { if (context.navigation.backGuard === guard) context.navigation.backGuard = null }
    }
    if (form.expectedRevision != null && item != null && form.expectedRevision != item.revision && !form.completed) {
        ErrorCard("The saved record changed. Your draft is kept here.")
        TextButton({ form.reset(context.platform.newId(), defaults); form.completed = false; scope.launch { context.care.discardDraft(context.dog.id, slot) } }) { Text("Reload saved details") }
    }
    if (form.closeRequested) BoardConfirmDialog("Keep this draft?", form.error ?: "Keep your entries for later, or discard the draft. Saved records stay unchanged.", "Discard draft", context.saving, { form.closeRequested = false }, keepLabel = "Keep draft", danger = false,
        onKeep = { scope.launch { form.attempt {
            context.care.saveDraft(context.dog.id, slot, LocalDraft(form.encode(), form.files()))
            form.closeRequested = false; context.navigation.backGuard = null; context.navigation.backUnconditionally()
        } } },
        onConfirm = { scope.launch { form.attempt {
            context.care.discardDraft(context.dog.id, slot); form.completed = true; form.closeRequested = false
            context.navigation.backGuard = null; context.navigation.backUnconditionally()
        } } })
    return form
}

@Composable
fun FeatureInput(form: FeatureForm, key: String, label: String, enabled: Boolean = true, multiline: Boolean = false, max: Int = 2000, placeholder: String? = null) {
    BarkField(label, form[key], { if (it.length <= max) form[key] = it }, Modifier.fillMaxWidth(), enabled, placeholder, multiline)
}

@Composable
fun FeatureFormError(form: FeatureForm) { form.error?.let { ErrorCard(it) } }
