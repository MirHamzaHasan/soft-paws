package com.dracoarts.shared.domain.model

data class SafetyTopic(val id: String, val title: String, val guidance: String, val source: String)
data class ToxicityReference(val name: String, val aliases: Set<String>, val guidance: String, val source: String)

/** Species-specific, bounded contact guidance. Never a diagnosis, dose or safe-to-wait decision. */
object SafetyReference {
    const val version = "2026-10-20-cat-v1"
    const val avma = "https://ebusiness.avma.org/files/productdownloads/mcm-client-brochures-pet-first-aid-2023.pdf"
    const val hazards = "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/common-cat-hazards"
    const val poison = "https://www.aspca.org/news/it-ever-safe-induce-vomiting"
    const val lilies = "https://www.fda.gov/animal-veterinary/animal-health-literacy/lovely-lilies-and-curious-cats-dangerous-combination"
    const val urinary = "https://www.vet.cornell.edu/departments-centers-and-institutes/cornell-feline-health-center/health-information/feline-health-topics/feline-lower-urinary-tract-disease"
    const val urgent = "If your cat may be in immediate danger, contact a veterinarian or local emergency veterinary hospital now. This guide cannot assess severity."
    val topics = listOf(
        SafetyTopic("urination", "Straining with little or no urine", "Repeated attempts to urinate with little or no urine can be an emergency. Contact an emergency veterinarian immediately; do not wait for a journal or AI assessment.", urinary),
        SafetyTopic("poison", "Suspected exposure", "Contact a veterinarian or animal poison service immediately. Do not try to make your cat vomit or give home remedies. Follow the veterinary professional’s instructions.", poison),
        SafetyTopic("lilies", "Possible lily exposure", "If your cat may have eaten a lily, licked its pollen or drunk its vase water, call a veterinarian or animal poison service immediately. Keep the plant name or a photo if available.", lilies),
        SafetyTopic("medicines", "Medicines and flea products", "Human medicines and dog flea treatments can be toxic to cats. For a possible exposure, call a veterinarian immediately and keep the product label.", hazards),
        SafetyTopic("prepare", "Details for the call", "Keep the substance or product label, when exposure may have happened and what you observed. Do not delay the call to complete the journal.", hazards),
    )
    val toxicity = listOf(
        ToxicityReference("Lilies", setOf("lily", "lilies", "daylily", "daylilies", "lily pollen", "lily vase water"), topics.first { it.id == "lilies" }.guidance, lilies),
        ToxicityReference("Human medicines", setOf("acetaminophen", "paracetamol", "ibuprofen", "aspirin", "human medicine", "human medicines"), topics.first { it.id == "medicines" }.guidance, hazards),
        ToxicityReference("Dog flea treatments", setOf("dog flea treatment", "dog flea treatments", "dog flea product"), topics.first { it.id == "medicines" }.guidance, hazards),
    )
    fun lookup(query: String): ToxicityReference? {
        val normalized = query.trim().lowercase().replace(Regex("\\s+"), " ")
        return toxicity.firstOrNull { normalized in it.aliases }
    }
}
