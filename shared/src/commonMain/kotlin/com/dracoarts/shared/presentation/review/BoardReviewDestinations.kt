package com.dracoarts.shared.presentation.review

import com.dracoarts.shared.presentation.navigation.Feature
import com.dracoarts.shared.presentation.navigation.Route
import com.dracoarts.shared.domain.model.ReportContent

/** Board IDs resolve to real screens; state-specific evidence remains individually tracked. */
val boardReviewFeatures = mapOf(
    "safety" to Feature.Safety,
    "symptoms" to Feature.Triage,
    "contacts" to Feature.Emergency,
    "contact-form" to Feature.EmergencyEdit,
    "region" to Feature.Emergency,
    "nearby-vets" to Feature.NearestVet,
    "location-denied" to Feature.NearestVet,
    "toxicity" to Feature.Toxicity,
    "safety-topics" to Feature.FirstAid,
    "calendar" to Feature.Calendar,
    "task-detail" to Feature.TaskDetail,
    "task-form" to Feature.TaskForm,
    "medications" to Feature.Medications,
    "med-form" to Feature.MedicationForm,
    "med-detail" to Feature.MedicationDetail,
    "med-history" to Feature.MedicationHistory,
    "vaccinations" to Feature.Vaccinations,
    "vaccine-form" to Feature.VaccinationForm,
    "next-highlight-editor" to Feature.VideoHighlight,
    "next-highlight-empty" to Feature.VideoHighlight,
    "next-highlight-gate" to Feature.VideoHighlightGate,
    "log-chooser" to Feature.Chooser,
    "dog-switcher" to Feature.DogSwitcher,
    "dog-add" to Feature.DogAdd,
    "dog-edit" to Feature.DogEdit,
    "profile-settings" to Feature.Settings,
    "delete-dog" to Feature.DeleteDog,
    "delete-all-data" to Feature.DeleteAll,
    "health-records" to Feature.Health,
    "medication-list" to Feature.Medications,
    "medication-plan" to Feature.MedicationForm,
    "medication-plan-edit" to Feature.MedicationForm,
    "medication-detail" to Feature.MedicationDetail,
    "medication-given" to Feature.MedicationGiven,
    "medication-archive" to Feature.MedicationArchive,
    "vaccination-list" to Feature.Vaccinations,
    "vaccination-form" to Feature.VaccinationForm,
    "medication-empty" to Feature.Medications,
    "medication-save-error" to Feature.MedicationDetail,
    "care-calendar" to Feature.Calendar,
    "care-task-detail" to Feature.TaskDetail,
    "care-task-form" to Feature.TaskForm,
    "reminder-opt-in" to Feature.ReminderOptIn,
    "reminder-denied" to Feature.ReminderOptIn,
    "reminder-failure" to Feature.ReminderOptIn,
    "care-task-overdue" to Feature.TaskDetail,
    "care-task-complete" to Feature.TaskDetail,
    "reminder-scheduled" to Feature.ReminderOptIn,
    "care-task-delete" to Feature.TaskDetail,
    "trends-month" to Feature.Monthly,
    "trends-sparse" to Feature.Monthly,
    "trends-empty" to Feature.Monthly,
    "next-safety" to Feature.Safety,
    "next-emergency" to Feature.Emergency,
    "next-toxicity" to Feature.Toxicity,
    "next-safety-topics" to Feature.FirstAid,
    "next-nearby-vet" to Feature.NearestVet,
    "next-train-dog" to Feature.TrainDog,
    "next-triage" to Feature.Triage,
    "safety-home" to Feature.Safety,
    "emergency-card" to Feature.Emergency,
    "emergency-contact" to Feature.EmergencyEdit,
    "toxicity-search" to Feature.Toxicity,
    "toxicity-result" to Feature.Toxicity,
    "toxicity-unknown" to Feature.Toxicity,
    "first-aid" to Feature.FirstAid,
    "triage" to Feature.Triage,
    "vet-prep" to Feature.Report,
    "report-preview" to Feature.ReportPreview,
    "export-format" to Feature.ReportFormat,
    "export-progress" to Feature.Export,
    "export-failure" to Feature.Export,
    "export-complete" to Feature.Export,
    "share-handoff" to Feature.Export,
    "training-catalog" to Feature.Training,
    "training-program" to Feature.Program,
    "training-session" to Feature.Session,
    "training-summary" to Feature.TrainingSummary,
    "training-empty" to Feature.Training,
    "training-error" to Feature.Training,
    "training-progress" to Feature.TrainingProgress,
    "photo-journal" to Feature.Photos,
    "photo-picker" to Feature.PhotoForm,
    "photo-form" to Feature.PhotoForm,
    "photo-detail" to Feature.PhotoDetail,
    "photo-baselines" to Feature.Baselines,
    "photo-missing" to Feature.PhotoDetail,
    "photo-unavailable" to Feature.PhotoForm,
    "photo-permission-denied" to Feature.PhotoForm,
    "expenses-list" to Feature.Expenses,
    "expense-form" to Feature.ExpenseForm,
    "expense-detail" to Feature.ExpenseDetail,
    "expense-delete" to Feature.ExpenseDetail,
    "expense-error" to Feature.ExpenseForm,
    "expense-empty" to Feature.Expenses,
    "expense-receipt" to Feature.ExpenseForm,
    "memory-book" to Feature.Memory,
    "memory-highlight" to Feature.MemoryHighlight,
    "memory-sparse" to Feature.Memory,
    "memory-photo-missing" to Feature.MemoryHighlight,
    "memory-share" to Feature.MemoryShare,
    "memory-collection" to Feature.MemoryCollection,
    "memory-caption" to Feature.MemoryCaption,
    "memory-empty" to Feature.Memory,
    "permission-denied" to Feature.ReminderOptIn,
)

val boardReviewTabs = mapOf(
    "home" to Route.Home,
    "timeline" to Route.Timeline,
    "timeline-filters" to Route.Timeline,
    "timeline-local-events" to Route.Timeline,
    "timeline-pagination" to Route.Timeline,
    "home-coach" to Route.Home,
    "profile-hub" to Route.Profile,
    "insights-overview" to Route.Insights,
    "home-empty" to Route.Home,
    "home-loading" to Route.Home,
    "timeline-filtered-empty" to Route.Timeline,
    "offline-ready" to Route.Home,
    "reduced-motion-state" to Route.Home,
)

/** IDs below refer only to committed records in the explicitly selected Full QA database. */
fun boardReviewArgument(boardId: String?, feature: Feature, newId: () -> String): String {
    val scope = "2026-10-08@2026-10-14@${BoardReviewFixture.dogId}@${ReportContent.encode(ReportContent.defaults)}"
    return when (feature) {
        Feature.Emergency -> if (boardId == "region") "region" else ""
        Feature.NearestVet -> if (boardId == "location-denied") "manual-denied" else ""
        Feature.MedicationDetail, Feature.MedicationArchive -> BoardReviewFixture.itemId(200)
        Feature.MedicationGiven -> BoardReviewFixture.itemId(450)
        Feature.MedicationForm -> if (boardId == "medication-plan-edit") BoardReviewFixture.itemId(200) else ""
        Feature.TaskDetail -> when (boardId) {
            "care-task-delete" -> "${BoardReviewFixture.itemId(300)}@2026-10-14@delete"
            "care-task-overdue" -> "${BoardReviewFixture.itemId(302)}@2026-10-13"
            "care-task-complete" -> "${BoardReviewFixture.itemId(301)}@2026-10-14"
            else -> "${BoardReviewFixture.itemId(300)}@2026-10-14"
        }
        Feature.ReminderOptIn -> BoardReviewFixture.itemId(300)
        Feature.TaskForm -> if (boardId == "care-task-form") BoardReviewFixture.itemId(300) else ""
        Feature.ReportPreview, Feature.ReportFormat -> scope
        Feature.Export -> "$scope@PDF"
        Feature.Program, Feature.TrainingProgress -> "name-response"
        Feature.Monthly -> if (boardId == "trends-sparse") "weight" else ""
        Feature.Toxicity -> when (boardId) { "toxicity-result" -> "chocolate"; "toxicity-unknown" -> "unknown-product"; else -> "" }
        Feature.FirstAid -> if (boardId == "first-aid") "bleeding" else ""
        Feature.Session -> "name-response@0@${newId()}"
        Feature.TrainingSummary -> BoardReviewFixture.itemId(501)
        Feature.PhotoDetail -> BoardReviewFixture.itemId(if (boardId == "photo-missing") 601 else 600)
        Feature.PhotoForm -> if (boardId == "photo-form") BoardReviewFixture.itemId(600) else "picker"
        Feature.ExpenseDetail -> BoardReviewFixture.itemId(700) + if (boardId == "expense-delete") "@delete" else ""
        Feature.MemoryHighlight, Feature.MemoryCaption -> BoardReviewFixture.itemId(if (boardId == "memory-photo-missing") 802 else 800)
        Feature.Memory -> when (boardId) { "memory-sparse" -> "2026-09"; "memory-empty" -> "2026-08"; else -> "" }
        Feature.MemoryCollection, Feature.MemoryShare -> "2026-10"
        else -> ""
    }
}
