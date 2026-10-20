package com.dracoarts.shared.domain.repository

import com.dracoarts.shared.domain.model.Dog
import com.dracoarts.shared.domain.model.DogDetails
import com.dracoarts.shared.domain.model.PremiumPolicy
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.sync.Mutex
import kotlinx.coroutines.sync.withLock

class PremiumRequiredException : IllegalStateException("Adding another dog is part of BarkLog Premium. Your existing dogs stay available.")

/** Enforces the product rule at every app dog-creation path, including retained drafts. */
class PremiumDogJournalRepository(
    private val delegate: JournalRepository,
    private val hasPremium: () -> Boolean,
) : JournalRepository by delegate {
    private val creation = Mutex()

    override suspend fun addDog(name: String, details: DogDetails, requestId: String?, draftSource: DraftSource?): Dog = creation.withLock {
        val dogs = delegate.observeDogs().first()
        // Repeating an already committed request must still return the same dog after access ends.
        val committedRetry = requestId != null && dogs.any { it.id == requestId }
        if (!committedRetry && !PremiumPolicy.canAddDog(dogs.size, hasPremium())) throw PremiumRequiredException()
        delegate.addDog(name, details, requestId, draftSource)
    }
}
