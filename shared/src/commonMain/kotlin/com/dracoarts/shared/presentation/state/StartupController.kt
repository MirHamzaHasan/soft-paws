package com.dracoarts.shared.presentation.state

import com.dracoarts.shared.services.ModuleRegistry
import kotlinx.coroutines.CancellationException
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow

sealed interface StartupState {
    data object Loading : StartupState
    data object Ready : StartupState
    data class Failed(val message: String) : StartupState
}

class StartupController(private val registry: ModuleRegistry) {
    private val mutableState = MutableStateFlow<StartupState>(StartupState.Loading)
    val state = mutableState.asStateFlow()

    suspend fun initialize() {
        mutableState.value = StartupState.Loading
        try {
            registry.initialize()
            mutableState.value = StartupState.Ready
        } catch (cause: CancellationException) {
            throw cause
        } catch (_: Exception) {
            mutableState.value = StartupState.Failed("BarkLog couldn't open. Please try again.")
        }
    }
}
