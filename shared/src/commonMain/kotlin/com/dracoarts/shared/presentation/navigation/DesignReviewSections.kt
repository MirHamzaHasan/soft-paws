package com.dracoarts.shared.presentation.navigation

/** Safe entry points for the opt-in Debug review bar. Detail states use real saved records. */
data class DesignReviewSection(val label: String, val feature: Feature)

val designReviewSections = listOf(
    DesignReviewSection("Dogs", Feature.DogSwitcher),
    DesignReviewSection("Add dog", Feature.DogAdd),
    DesignReviewSection("Edit dog", Feature.DogEdit),
    DesignReviewSection("Settings & storage", Feature.Settings),
    DesignReviewSection("Health records", Feature.Health),
    DesignReviewSection("Medication", Feature.Medications),
    DesignReviewSection("Vaccinations", Feature.Vaccinations),
    DesignReviewSection("Care calendar", Feature.Calendar),
    DesignReviewSection("Monthly trends", Feature.Monthly),
    DesignReviewSection("Safety Center", Feature.Safety),
    DesignReviewSection("Emergency card", Feature.Emergency),
    DesignReviewSection("Toxicity lookup", Feature.Toxicity),
    DesignReviewSection("First aid", Feature.FirstAid),
    DesignReviewSection("Triage", Feature.Triage),
    DesignReviewSection("Vet report", Feature.Report),
    DesignReviewSection("Training", Feature.Training),
    DesignReviewSection("Photo journal", Feature.Photos),
    DesignReviewSection("Baselines", Feature.Baselines),
    DesignReviewSection("Expenses", Feature.Expenses),
    DesignReviewSection("Memory Book", Feature.Memory),
)
