package com.dracoarts.shared.domain.model

data class SafetyTopic(val id: String, val title: String, val guidance: String, val source: String)
data class ToxicityReference(val name: String, val aliases: Set<String>, val guidance: String, val source: String)

/** Bounded, source-checked reference copy. No dosage, diagnosis or wait-at-home decision. */
object SafetyReference {
    const val version = "2026-10-15"
    const val avma = "https://ebusiness.avma.org/files/productdownloads/mcm-client-brochures-pet-first-aid-2023.pdf"
    const val poison = "https://www.merckvetmanual.com/special-pet-topics/poisoning/general-treatment-of-poisoning"
    const val urgent = "If your dog may be in immediate danger, contact a veterinarian or local emergency veterinary hospital now. This guide cannot assess severity."
    val topics = listOf(
        SafetyTopic("bleeding", "Bleeding", "If safe, hold clean cloth firmly against the wound. Add cloth over soaked layers. Seek urgent veterinary help for severe bleeding.", avma),
        SafetyTopic("heat", "Possible heatstroke", "Arrange emergency veterinary care immediately. Move into shade or a comfortably cool space. Begin cooling with room-temperature wet towels and airflow.", avma),
        SafetyTopic("seizure", "Seizure", "Clear nearby hazards. Keep hands away from the mouth and avoid restraint. Time the episode if safe, then contact emergency veterinary care.", avma),
        SafetyTopic("injury", "Injury", "An injured dog may bite. Limit movement during transport and avoid removing objects embedded in a wound. Contact a veterinary hospital.", avma),
        SafetyTopic("poison", "Possible poisoning", "Call a veterinary professional promptly. Keep packaging and note the possible amount and exposure time. Avoid inducing vomiting or giving remedies unless directed.", poison),
    )
    val toxicity = listOf(
        ToxicityReference("Chocolate", setOf("chocolate", "cocoa", "cacao"), "Risk varies with the product and amount. Contact a veterinary professional with the packaging, estimated amount and exposure time.", "https://www.merckvetmanual.com/toxicology/food-hazards/chocolate-toxicosis-in-animals"),
        ToxicityReference("Grapes and raisins", setOf("grape", "grapes", "raisin", "raisins", "sultana", "sultanas"), "These exposures can harm dogs. Contact a veterinary professional promptly; keep the product and exposure details.", "https://www.merckvetmanual.com/toxicology/food-hazards/grape-raisin-and-tamarind-vitis-spp-tamarindus-spp-toxicosis-in-dogs"),
        ToxicityReference("Xylitol", setOf("xylitol", "birch sugar"), "Xylitol can cause serious poisoning in dogs. Contact a veterinary professional immediately and keep the ingredient label.", "https://www.merckvetmanual.com/toxicology/food-hazards/xylitol-toxicosis-in-dogs"),
    )
    fun lookup(query: String): ToxicityReference? {
        val normalized = query.trim().lowercase().replace(Regex("\\s+"), " ")
        return toxicity.firstOrNull { normalized in it.aliases }
    }
}
