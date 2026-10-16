package com.dracoarts.shared.services

import com.dracoarts.shared.managers.AppManagers
import com.dracoarts.shared.data.local.SqlDelightJournalRepository
import com.dracoarts.shared.presentation.state.StartupController
import com.dracoarts.shared.presentation.state.EventController
import com.dracoarts.shared.presentation.state.TimelineController
import com.dracoarts.shared.presentation.state.CareController
import com.dracoarts.shared.presentation.state.SettingsController
import com.dracoarts.shared.domain.model.CareEvent
import com.dracoarts.shared.presentation.review.BoardReviewFaults
import kotlinx.coroutines.NonCancellable
import kotlinx.coroutines.withContext

/** Product dependencies are wired here, never created by individual screens. */
class AppContainer(platform: AppPlatform, modules: List<AppModule> = emptyList(), reviewFaults: BoardReviewFaults? = null) {
    private val device by lazy { platform.device }
    val managers = AppManagers(platform)
    val journal = SqlDelightJournalRepository(platform.journalDriverFactory, platform::newId, platform::nowMillis)
    private val reviewed = reviewFaults?.repository(journal, journal)
    val journalAccess: com.dracoarts.shared.domain.repository.JournalRepository = reviewed ?: journal
    val careAccess: com.dracoarts.shared.domain.repository.CareRepository = reviewed ?: journal
    val registry = ModuleRegistry(listOfNotNull(reviewFaults?.startupModule, LocalDataModule(journal)) + TemplatePlugins.createModules(managers) + modules)
    val startup = StartupController(registry)
    val settings = SettingsController(platform.storage)
    val companion = com.dracoarts.shared.presentation.companion.CompanionController(journal, journalAccess, careAccess, platform)
    fun createEventController(onCreated: (CareEvent) -> Unit = {}) = EventController(journalAccess, managers.haptics, onCreated)
    fun createTimelineController() = TimelineController(journalAccess)
    fun createCareController() = CareController(careAccess, managers.haptics, device)

    suspend fun close() = withContext(NonCancellable) {
        try { companion.close(); registry.close() } finally { managers.close() }
    }
}
