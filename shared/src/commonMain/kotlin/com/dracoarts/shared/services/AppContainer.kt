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
class AppContainer(platform: AppPlatform, modules: List<AppModule> = emptyList(), reviewFaults: BoardReviewFaults? = null, liveAiReview: Boolean = false) {
    private val device by lazy { platform.device }
    val managers = AppManagers(platform)
    val journal = SqlDelightJournalRepository(platform.journalDriverFactory, platform::newId, platform::nowMillis)
    private val reviewed = reviewFaults?.repository(journal, journal)
    val journalAccess: com.dracoarts.shared.domain.repository.JournalRepository = com.dracoarts.shared.domain.repository.PremiumDogJournalRepository(reviewed ?: journal) { companion.hasPremium }
    val careAccess: com.dracoarts.shared.domain.repository.CareRepository = reviewed ?: journal
    val authentication = NativeAuthentication(if (TemplatePlugins.isEnabled("auth")) platform.authEngine else UnavailableAuthEngine)
    val purchases = NativePurchases(if (TemplatePlugins.isEnabled("purchases")) platform.purchasesEngine else UnavailablePurchasesEngine) { authentication.snapshot.value.user?.uid }
    val atlas = com.dracoarts.shared.services.ai.AtlasClient(authentication, com.dracoarts.shared.services.ai.KtorAtlasTransport(platform.atlasPlatform), platform.atlasEnabled)
    val highlights = com.dracoarts.shared.presentation.highlights.HighlightController(careAccess, platform.highlights, { companion.hasPremium })
    private val videoModule = object : AppModule {
        override val id = "local-video"
        override val priority = 50
        override val dependencies = setOf("local-data")
        override suspend fun initialize() = Unit
        override suspend fun close() = highlights.close()
    }
    val registry = ModuleRegistry(listOfNotNull(reviewFaults?.startupModule, LocalDataModule(journal), videoModule, authentication, purchases, atlas) + TemplatePlugins.createModules(managers) + modules)
    val startup = StartupController(registry)
    val settings = SettingsController(platform.storage)
    val companion = com.dracoarts.shared.presentation.companion.CompanionController(journal, journalAccess, careAccess, platform,
        responder = if (reviewFaults != null && !liveAiReview) com.dracoarts.shared.presentation.companion.DemoResponseProvider() else com.dracoarts.shared.presentation.companion.AtlasResponseProvider(atlas, platform::newId),
        authentication = authentication, purchases = purchases)
    fun createEventController(onCreated: (CareEvent) -> Unit = {}) = EventController(journalAccess, managers.haptics, onCommitted = { managers.sounds.play(SoundCue.Saved) }, onCreated = onCreated)
    fun createTimelineController() = TimelineController(journalAccess)
    fun createCareController() = CareController(careAccess, managers.haptics, device) { managers.sounds.play(SoundCue.Saved) }

    suspend fun close() = withContext(NonCancellable) {
        try { companion.close(); registry.close() } finally { managers.close() }
    }
}
