package com.dracoarts.shared.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class DogDetails(
    val breed: String = "", val age: String = "", val sex: String = "Not recorded",
    val vetName: String = "", val vetPhone: String = "", val emergencyPhone: String = "",
    val companion: DogContext = DogContext(),
    val notes: String = "", val photoId: String? = null, val emergencyServiceName: String = "",
) {
    fun validate() {
        companion.validate()
        require(breed.length <= 100 && age.length <= 60 && sex in listOf("Not recorded", "Female", "Male")) { "Check the profile details." }
        require(vetName.length <= 160 && emergencyServiceName.length <= 160 && notes.length <= 2000) { "Profile notes are too long." }
        listOf(vetPhone, emergencyPhone).forEach { require(it.length <= 40 && it.all { c -> c.isDigit() || c in "+()- ." }) { "Enter a valid contact number." } }
        require(photoId == null || Regex("[a-zA-Z0-9-]+\\.(jpg|png|jpeg)").matches(photoId)) { "Invalid photo reference." }
    }
}

data class Dog(val id: String, val name: String, val createdAtMillis: Long, val details: DogDetails = DogDetails(), val revision: Long = 1)
