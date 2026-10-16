package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.managers.StorageManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock
import kotlinx.coroutines.withContext

data class UserSettings(val reduceMotion: Boolean = false, val contrast: Boolean = false, val theme: String = "Light", val error: String? = null)

class SettingsController(private val preferences: StorageManager) {
    private val _state = MutableStateFlow(UserSettings())
    val state = _state.asStateFlow()
    private val writing = Mutex()
    suspend fun load() = withContext(Dispatchers.Default) {
        _state.value = try { UserSettings(preferences.getBoolean("reduce_motion") ?: false, preferences.getBoolean("strong_contrast") ?: false,
            preferences.getString("theme")?.takeIf { it in listOf("System", "Light", "Dark") } ?: "Light") }
        catch (_: Exception) { UserSettings(error = "Couldn't read appearance settings. Light appearance is in use.") }
    }
    suspend fun save(settings: UserSettings) = withContext(Dispatchers.Default) {
        writing.withLock {
            try {
                require(settings.theme in listOf("System", "Light", "Dark"))
                preferences.setBoolean("reduce_motion", settings.reduceMotion)
                preferences.setBoolean("strong_contrast", settings.contrast)
                preferences.setString("theme", settings.theme)
                _state.value = settings.copy(error = null)
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { _state.value = _state.value.copy(error = "Couldn't save appearance settings. Please try again.") }
        }
    }
}
