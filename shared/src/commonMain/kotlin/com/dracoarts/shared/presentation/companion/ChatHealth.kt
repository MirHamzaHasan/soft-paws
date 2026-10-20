package com.dracoarts.shared.presentation.companion

/** Conservative keyword routing to a vet action, never an emergency assessment. */
object ChatHealth {
    private val urgent = Regex("lil(?:y|ies)|(?:can.?t|cannot|unable to) (?:pee|urinate)|straining.{0,60}(?:urin|pee)|(?:little|no) urine|dog flea|chocolate|poison|toxic|collaps|breath|seizure|overdose|emergency|unconscious|heavy bleeding|uncontrolled bleeding", RegexOption.IGNORE_CASE)
    private val treatment = Regex("dose|dosage|diagnos|prescri|cure|\\btreat(?:ment|ing|ed)?\\b|which (medicine|medication)|what (medicine|medication)|recommend.*(medicine|medication)", RegexOption.IGNORE_CASE)
    private val medication = Regex("medicine|medication|tablet|drug|side effect|prescription", RegexOption.IGNORE_CASE)
    fun urgent(text: String) = urgent.containsMatchIn(text)
    fun treatment(text: String) = treatment.containsMatchIn(text)
    fun medication(text: String) = medication.containsMatchIn(text)
    const val medicationSource = "https://www.fda.gov/animal-veterinary/animal-health-literacy/medications-your-pet-questions-your-vet"
    const val medicationEducation = "General medication information: follow your veterinarian’s label for this cat, and keep the medicine name and instructions with your notes. Ask your vet or pharmacist about side effects, missed doses and interactions. Check with your vet before giving a human medicine or changing a treatment. I can help organize those questions; I don’t look up or verify a particular drug."
}
