package com.dracoarts.shared.domain.model

enum class VeterinaryContactKind(val label: String) { Vet("Regular veterinarian"), Emergency("Emergency clinic or service") }

/** The two established profile slots stay independent of general care notes. */
data class VeterinaryContact(val name: String, val phone: String, val note: String = "") {
    val empty get() = name.isBlank() && phone.isBlank() && note.isBlank()
    fun validated(allowEmpty: Boolean = false): VeterinaryContact {
        val clean = VeterinaryContact(name.trim(), phone.trim(), note.trim())
        if (allowEmpty && clean.empty) return clean
        require(clean.name.isNotBlank() && clean.name.length <= 160) { "Add the vet or clinic name." }
        require(clean.phone.length <= 40 && clean.phone.any(Char::isDigit) && clean.phone.all { it.isDigit() || it in "+()- ." }) { "Add a phone number you have checked." }
        require(clean.note.length <= 2000) { "Keep the contact note within 2,000 characters." }
        return clean
    }
}

fun DogDetails.veterinaryContact(kind: VeterinaryContactKind) = when (kind) {
    VeterinaryContactKind.Vet -> VeterinaryContact(vetName, vetPhone, vetNote)
    VeterinaryContactKind.Emergency -> VeterinaryContact(emergencyServiceName, emergencyPhone, emergencyNote)
}

fun DogDetails.withVeterinaryContact(kind: VeterinaryContactKind, contact: VeterinaryContact): DogDetails = when (kind) {
    VeterinaryContactKind.Vet -> copy(vetName = contact.name, vetPhone = contact.phone, vetNote = contact.note)
    VeterinaryContactKind.Emergency -> copy(emergencyServiceName = contact.name, emergencyPhone = contact.phone, emergencyNote = contact.note)
}
