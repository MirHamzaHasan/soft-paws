package com.dracoarts.shared.presentation.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.semantics.clearAndSetSemantics
import androidx.compose.ui.unit.dp
import com.dracoarts.shared.domain.model.*
import com.dracoarts.shared.presentation.companion.PremiumFeature
import com.dracoarts.shared.presentation.components.*
import com.dracoarts.shared.presentation.navigation.*
import com.dracoarts.shared.presentation.theme.boardColor
import com.dracoarts.shared.services.*
import kotlinx.coroutines.*

@Composable
internal fun EmergencyCountryServices(context: FeatureContext) {
    var country by rememberSaveable { mutableStateOf(runCatching { context.platform.storage.getString("emergency-country") }.getOrNull().orEmpty()) }
    var entry by rememberSaveable { mutableStateOf(if (country.isBlank()) "" else EmergencyDirectory.countryName(country)) }
    var error by remember { mutableStateOf<String?>(null) }
    var dialFailed by remember { mutableStateOf(false) }
    var applied by rememberSaveable { mutableStateOf(country.isNotBlank()) }
    fun select(value: String, display: String = EmergencyDirectory.countryName(value)) {
        try { context.platform.storage.setString("emergency-country", value); country = value; entry = display; applied = true; error = null }
        catch (_: Exception) { error = "Couldn't keep this region. Your saved clinic contacts are still available." }
    }
    SoftPawsHeading("Start with your region.", "Animal-service contacts vary by country.", "your region.")
    BarkField("Country or region", entry, { if (it.length <= 100) { entry = it; applied = false; error = null } }, Modifier.fillMaxWidth(), softPaws = true)
    BarkButton("Use this region", { select(EmergencyDirectory.resolveCountry(entry).orEmpty(), entry.trim()) }, enabled = entry.isNotBlank(), secondary = true)
    SoftPawsCard("Verified numbers only") {
        SupportingText("A contact is shown only when its country, purpose and source have been checked.")
        CaptionText("Bundled listings: ${EmergencyDirectory.countries.joinToString { it.name }}. Check that the region matches where you are.")
    }
    AreaChoice(context, "Use my area for country", onArea = { area ->
        if (area.countryCode.isNotBlank()) select(EmergencyDirectory.resolveCountry(area.countryCode).orEmpty(), EmergencyDirectory.countries.firstOrNull { it.code == area.countryCode }?.name ?: area.countryCode)
    })
    if (applied) {
        val contacts = EmergencyDirectory.forCountry(country)
        if (contacts.isEmpty()) SoftPawsCard("Use your own clinic contact") {
            SupportingText("No bundled number is verified for ${entry.ifBlank { "this region" }}. Use your saved veterinarian or add a verified local emergency clinic.")
        }
        contacts.forEach { contact ->
            SoftPawsCard(contact.name) {
                Text(contact.displayNumber, style = MaterialTheme.typography.bodyLarge)
                SupportingText(contact.scope)
                BarkButton("Call ${contact.displayNumber}", { dialFailed = !context.platform.device.dial(contact.dialNumber) }, icon = "phone")
                BarkTextAction("Service website & fees", { if (!context.platform.device.openSource(contact.source)) error = "Couldn't open the service website. The displayed number is still available." }, icon = "arrow-up-right")
                CaptionText("Animal poison service, not a general emergency clinic. Source checked ${EmergencyDirectory.checked}. Numbers, coverage and fees can change. Domestic numbers may not work abroad.")
            }
        }
    }
    error?.let { ErrorCard(it) }
    if (dialFailed) ErrorCard("Couldn't open the phone app. Dial the displayed number directly.")
    CaptionText("No universal veterinary number is assumed. Your own saved contacts remain available offline.")
    BoardStickyAction { BarkButton("Back to saved contacts", { context.navigation.returnTo(Feature.Emergency) }) }
}

@Composable
internal fun NearbyVetScreen(page: FeaturePage, context: FeatureContext) {
    val manual = page.id.startsWith("manual")
    var city by rememberSaveable(context.dog.id, page.id) { mutableStateOf(if (manual) nearbyPlaceFromArgument(page.id) else "") }
    var area by remember { mutableStateOf<ApproximateArea?>(null) }
    var error by remember { mutableStateOf<String?>(null) }
    val companion = context.companion
    val state = companion?.state?.collectAsState()?.value
    val premium = state?.premiumAccess == true
    val reason = page.id.substringBefore('@')
    SoftPawsHeading(if (manual) "Type a place instead." else "A vet near your place.",
        if (manual) when (reason) {
            "manual-denied" -> "Location access was not granted."
            "manual-cancelled" -> "The location request was cancelled."
            "manual-failed" -> "Your area couldn't be found."
            else -> "Location is optional."
        } else "Premium · location is always optional.", if (manual) "instead." else "your place.")
    BarkField("City, area or postcode", city, { if (it.length <= 160) { city = it; area = null; error = null } }, Modifier.fillMaxWidth(), softPaws = true)
    if (manual) SoftPawsCard("You can still search") {
        SupportingText("Use manual entry for map-based search. Direct saved contacts remain free and work offline.")
    } else {
        MapSearchIllustration()
        AreaChoice(context, "Use my location", onArea = { area = it; city = ""; error = null }, onUnavailable = { result ->
            val fallback = when (result) { DeviceResult.Denied -> "manual-denied"; DeviceResult.Cancelled -> "manual-cancelled"; else -> "manual-failed" }
            // The argument contains typed text only. Precise coordinates never enter navigation state.
            context.open(Feature.NearestVet, nearbyPlaceArgument(fallback, city))
        })
        BarkTextAction("Type a place instead", { context.open(Feature.NearestVet, nearbyPlaceArgument("manual", city)) })
    }
    if (area != null) CaptionText("Approximate area ready. Coordinates stay only while this screen is open.")
    CaptionText("Coverage and opening hours vary. Call a clinic to confirm availability.")
    CaptionText("Opening Maps sends your search place to Google Maps. No cat profile, journal or AI messages are included. Maps needs a connection.")
    if (error != null) ErrorCard(error!!)
    BoardStickyAction {
        BarkButton(if (premium) "Find clinics in Maps" else "View Premium access", {
            if (!premium || companion?.hasPremium != true) { companion?.requestPremium(PremiumFeature.NearestVet); return@BarkButton }
            val location = area?.searchPlace ?: city.trim()
            error = if (location.isBlank()) "Enter a city, area or postcode."
                else if (!context.platform.device.openSource(NearbyVets.searchUrl(location))) "Couldn't open Maps. Check your connection or try another place." else null
        }, enabled = companion != null && (!premium || city.isNotBlank() || area != null))
        BarkTextAction(if (manual) "Saved contacts" else "Saved contacts · free", { context.open(Feature.Emergency) })
    }
}

@Composable
private fun MapSearchIllustration() {
    val road = boardColor("panel"); val ground = boardColor("inset")
    Surface(shape = RoundedCornerShape(24.dp), color = ground, border = BorderStroke(1.dp, boardColor("hair"))) {
        Box(Modifier.fillMaxWidth().height(160.dp), contentAlignment = Alignment.Center) {
            Canvas(Modifier.matchParentSize().clearAndSetSemantics {}) {
                drawLine(road, Offset(size.width * .17f, 0f), Offset(size.width * .63f, size.height), strokeWidth = 19.dp.toPx())
                drawLine(road, Offset(0f, size.height * .8f), Offset(size.width, size.height * .1f), strokeWidth = 13.dp.toPx())
            }
            Column(horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.spacedBy(16.dp)) {
                BarkIcon("map-pin", Modifier.size(36.dp), boardColor("accent"))
                CaptionText("Search opens in Maps · no clinic results here")
            }
        }
    }
}

@Composable
private fun AreaChoice(context: FeatureContext, label: String, onArea: (ApproximateArea) -> Unit, onUnavailable: ((DeviceResult<ApproximateArea>) -> Unit)? = null) {
    val scope = rememberCoroutineScope()
    var job by remember { mutableStateOf<Job?>(null) }
    var busy by remember { mutableStateOf(false) }
    var status by remember { mutableStateOf<String?>(null) }
    DisposableEffect(Unit) { onDispose { job?.cancel() } }
    LaunchedEffect(context.platform) { context.platform.device.foreground.collect { if (!it) { job?.cancel(); busy = false } } }
    CaptionText("Optional, one search only. No background tracking. Location stays out of your journal and AI context.")
    BarkButton(if (busy) "Finding your area…" else label, {
        busy = true; status = null
        job = scope.launch {
            try {
                when (val result = context.platform.device.currentArea()) {
                    is DeviceResult.Success -> { onArea(result.value); status = if (result.value.countryCode.isBlank()) "Area found. Choose your country manually if needed." else "Area found. Check the selected country." }
                    DeviceResult.Denied -> { status = "Location wasn't allowed. You can still choose a region or type a place."; onUnavailable?.invoke(result) }
                    DeviceResult.Cancelled -> { status = "Location request cancelled."; onUnavailable?.invoke(result) }
                    is DeviceResult.Failed -> { status = result.message; onUnavailable?.invoke(result) }
                }
            } catch (cancelled: CancellationException) { throw cancelled }
            catch (_: Exception) { status = "Couldn't find your area. Choose a region or type a place instead."; onUnavailable?.invoke(DeviceResult.Failed(status!!)) }
            finally { busy = false }
        }
    }, secondary = true, enabled = !busy, icon = "map-pin")
    if (busy) BarkTextAction("Cancel location request", { job?.cancel(); busy = false; status = "Location request cancelled." })
    status?.let { CaptionText(it) }
}
