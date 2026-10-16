package com.dracoarts.shared.presentation.review

/** Start the real journey. Viewing a flow never auto-saves, deletes or grants permission. */
val boardReviewFlowStarts = mapOf(
    "seq-home" to "home", // The retired home-before comparison stays on the web board.
    "seq-timeline" to "timeline",
    "seq-records" to "record-detail",
    "seq-forms" to "log-chooser",
    "seq-profile" to "profile-hub", // Historical Profile/Insights styles stay references.
    "seq-setup" to "dog-setup",
    "seq-onboarding" to "opening-value",
    "seq-profiles" to "profile-hub",
    "seq-medications" to "health-records",
    "seq-calendar" to "care-calendar",
    "seq-insights" to "insights-overview",
    "seq-safety" to "safety-home",
    "seq-exports" to "vet-prep",
    "seq-training" to "training-catalog",
    "seq-photos" to "photo-journal",
    "seq-expenses" to "expenses-list",
    "seq-memory" to "memory-book",
    "seq-states" to "startup-loading", // Other contextual states have their own fault/dataset entry.
)

private val motionStarts = mapOf(
    "motion-press" to "log-chooser",
    "transition-setup-home" to "dog-setup",
    "transition-medication-given" to "medication-detail",
    "transition-calendar-edit" to "care-task-detail",
    "transition-trend-report" to "trends-month",
    "transition-photo-memory" to "photo-detail",
    "transition-notes-timeline" to "form-walk",
)

fun boardReviewEntry(id: String?): String? = boardReviewFlowStarts[id] ?: motionStarts[id] ?: id
