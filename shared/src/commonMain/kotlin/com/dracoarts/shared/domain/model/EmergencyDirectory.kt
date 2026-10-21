package com.dracoarts.shared.domain.model

import io.ktor.http.encodeURLParameter

/** Bundled animal services, independent of AI and purchases. Never replaces a saved clinic. */
data class AnimalEmergencyContact(val country: String, val name: String, val displayNumber: String, val dialNumber: String, val scope: String, val source: String)
data class EmergencyCountry(val code: String, val name: String)
object EmergencyDirectory {
    const val checked = "2026-10-21"
    val countries = listOf(EmergencyCountry("US", "United States"), EmergencyCountry("CA", "Canada"), EmergencyCountry("GB", "United Kingdom"), EmergencyCountry("AU", "Australia"), EmergencyCountry("NZ", "New Zealand"), EmergencyCountry("SG", "Singapore"))
    val contacts = listOf(
        AnimalEmergencyContact("US", "ASPCA Poison Control", "(888) 426-4435", "+18884264435", "Animal poisoning · 24/7 · consultation fees may apply", "https://www.aspca.org/pet-care/aspca-poison-control"),
        AnimalEmergencyContact("CA", "Animal Poisons Helpline", "+1 917 722 5958", "+19177225958", "Animal poisoning · international service · consultation and call fees may apply", "https://www.animalpoisons.com.au/"),
        AnimalEmergencyContact("GB", "Animal PoisonLine", "01202 509000", "+441202509000", "Animal poisoning · 24 hours · consultation fees apply", "https://www.animalpoisonline.co.uk/"),
        AnimalEmergencyContact("AU", "Animal Poisons Helpline", "1300 869 738", "1300869738", "Animal poisoning · Australia domestic number · consultation fees apply", "https://www.animalpoisons.com.au/"),
        AnimalEmergencyContact("NZ", "Animal Poisons Helpline", "0800 869 738", "0800869738", "Animal poisoning · New Zealand domestic number · consultation fees may apply", "https://www.animalpoisons.com.au/"),
        AnimalEmergencyContact("SG", "Animal Poisons Helpline", "3106 4216", "+6531064216", "Animal poisoning · consultation fees may apply", "https://www.animalpoisons.com.au/")
    )
    fun forCountry(code: String) = contacts.filter { it.country == code.uppercase() }
    fun countryName(code: String) = countries.firstOrNull { it.code == code.uppercase() }?.name ?: "Another country"
    fun resolveCountry(value: String): String? {
        val clean = value.trim().lowercase()
        return countries.firstOrNull { it.code.lowercase() == clean || it.name.lowercase() == clean }?.code
            ?: when (clean) { "usa", "united states of america" -> "US"; "uk", "great britain" -> "GB"; else -> null }
    }
}

object NearbyVets {
    fun searchUrl(place: String): String {
        val location = place.trim().take(160)
        require(location.isNotEmpty())
        return "https://www.google.com/maps/search/?api=1&query=" + "emergency veterinary clinic near $location".encodeURLParameter()
    }
}
