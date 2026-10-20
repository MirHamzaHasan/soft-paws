package com.dracoarts.shared.presentation.screens

import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.companion.PremiumFeature
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*

@Composable
internal fun EmergencyCountryServices(context: FeatureContext) {
    var country by rememberSaveable { mutableStateOf(runCatching { context.platform.storage.getString("emergency-country") }.getOrNull() ?: context.platform.device.suggestedCountry()) }
    var choose by rememberSaveable { mutableStateOf(false) }
    var dialFailed by remember { mutableStateOf(false) }
    fun select(value: String) { country = value; choose = false; runCatching { context.platform.storage.setString("emergency-country", value) } }
    JournalCard {
        SectionTitle("Animal poison services")
        SupportingText("${EmergencyDirectory.countryName(country)} · check this matches where you are.")
        CaptionText("The initial country can come from your device region. It does not confirm your location. These are animal poison services, not general emergency clinics.")
        BarkButton("Change country", { choose = !choose }, secondary = true, icon = "globe")
        if (choose) BoardMenu {
            EmergencyDirectory.countries.forEach { item -> FeatureRow(item.name, if (country == item.code) "Selected country" else "Animal poison service", "globe") { select(item.code) } }
            FeatureRow("Another country", "Use a verified local veterinarian", "globe") { select("") }
        }
        AreaChoice(context, "Use my area for country", onArea = { area -> if (area.countryCode.isNotBlank()) select(area.countryCode) })
        val contacts = EmergencyDirectory.forCountry(country)
        if (contacts.isEmpty()) CaptionText("No bundled number is verified for this country yet. Use your saved veterinarian or add a verified local emergency clinic above.")
        contacts.forEach { contact ->
            JournalCard {
                SectionTitle(contact.name)
                SupportingText(contact.scope)
                BarkButton("Call ${contact.displayNumber}", { dialFailed = !context.platform.device.dial(contact.dialNumber) }, icon = "phone")
                BarkTextAction("Service website & fees", { context.platform.device.openSource(contact.source) }, icon = "arrow-up-right")
                CaptionText("Source checked ${EmergencyDirectory.checked}. Numbers, coverage and fees can change. Domestic numbers may not work while abroad.")
            }
        }
        if (dialFailed) ErrorCard("Couldn't open the phone app. Dial the displayed number directly.")
    }
}

@Composable
internal fun NearbyVetScreen(context: FeatureContext) {
    var city by rememberSaveable { mutableStateOf("") }
    var area by remember { mutableStateOf<ApproximateArea?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    ScreenHeading("Find a vet nearby", "Choose a clinic in Maps, then call · Premium")
    BarkButton("Open saved emergency contacts", { context.open(com.dracoarts.shared.presentation.navigation.Feature.Emergency) }, secondary = true, icon = "phone")
    if (PremiumSafetyGate(context, PremiumFeature.NearestVet)) return
    JournalCard {
        SectionTitle("Where should we look?")
        SupportingText("Enter a city and country, or use your approximate area once. Choose a clinic in Maps, check opening hours and phone before travelling.")
        BarkField("City and country", city, { if (it.length <= 160) { city = it; area = null; error = null } }, placeholder = "e.g. London, UK")
        AreaChoice(context, "Use my approximate area", onArea = { area = it; city = ""; error = null })
        if (area != null) CaptionText("Approximate area ready. Coordinates are kept only while this screen is open.")
        CaptionText("Opening Maps sends your search location to Google Maps. No dog profile, care records or AI messages are included. No location permission is needed for a typed city.")
        BarkButton("Find clinics in Maps", {
            if (context.companion?.hasPremium != true) { context.companion?.requestPremium(PremiumFeature.NearestVet); return@BarkButton }
            val location = area?.searchPlace ?: city.trim()
            error = if (location.isBlank() || !context.platform.device.openSource(NearbyVets.searchUrl(location))) "Couldn't open Maps. Check your connection or try another city." else null
        }, enabled = area != null || city.isNotBlank(), icon = "map-pin")
    }
    error?.let { ErrorCard(it) }
    CaptionText("Maps is an external service and needs a connection. Results and call options vary by country; BarkLog cannot verify the nearest clinic, its hours or availability.")
}

@Composable
private fun AreaChoice(context: FeatureContext, label: String, onArea: (ApproximateArea) -> Unit) {
    val scope = rememberCoroutineScope()
    var job by remember { mutableStateOf<Job?>(null) }
    var busy by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf<String?>(null) }
    DisposableEffect(Unit) { onDispose { job?.cancel() } }
    LaunchedEffect(context.platform) { context.platform.device.foreground.collect { if (!it) { job?.cancel(); busy = false } } }
    CaptionText("Optional: your phone can find your area once. No background tracking. Location stays out of your journal and AI context.")
    BarkButton(if (busy) "Finding your area…" else label, {
        busy = true; status = null
        job = scope.launch {
            try {
                when (val result = context.platform.device.currentArea()) {
                    is DeviceResult.Success -> { onArea(result.value); status = if (result.value.countryCode.isBlank()) "Area found. If no country was identified, choose it manually." else "Area found. Check the selected country." }
                    DeviceResult.Denied -> status = "Location wasn't allowed. You can still choose a country or enter a city."
                    DeviceResult.Cancelled -> status = "Location request canceled."
                    is DeviceResult.Failed -> status = result.message
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { status = "Couldn't find your area. Choose a country or enter a city instead." }
            finally { busy = false }
        }
    }, secondary = true, enabled = !busy, icon = "map-pin")
    if (busy) BarkTextAction("Cancel location request", { job?.cancel(); busy = false; status = "Location request canceled." })
    status?.let { CaptionText(it) }
}
