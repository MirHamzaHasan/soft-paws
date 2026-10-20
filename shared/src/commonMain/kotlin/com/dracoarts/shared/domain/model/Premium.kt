package com.dracoarts.shared.domain.model

/** Owner-approved USD reference prices. Configured stores supply actual localized prices. */
enum class PremiumPlan(val key: String, val title: String, val period: String, val usdCents: Int) {
    Weekly("weekly", "Weekly", "week", 299),
    Monthly("monthly", "Monthly", "month", 699),
    Yearly("yearly", "Yearly", "year", 3999);

    val referencePrice get() = "$${usdCents / 100}.${(usdCents % 100).toString().padStart(2, '0')}"
    val referenceCharge get() = "$referencePrice / $period"
}

data class PremiumOffer(val plan: PremiumPlan, val price: String, val packageId: String)

/** Comes from the billing adapter, never from a saved local demo flag. */
data class PremiumCustomer(
    val configured: Boolean = false,
    val entitled: Boolean = false,
    val customerId: String? = null,
    val anonymous: Boolean = false,
    val expiresAtMillis: Long? = null,
    val managementUrl: String? = null,
    val offers: List<PremiumOffer> = emptyList(),
    val error: String? = null,
)

object PremiumPolicy {
    fun canAddDog(existingCount: Int, hasPremium: Boolean): Boolean = existingCount == 0 || hasPremium
}
