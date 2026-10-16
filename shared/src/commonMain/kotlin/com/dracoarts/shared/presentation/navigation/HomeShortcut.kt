package com.dracoarts.shared.presentation.navigation

/** UI preferences only; choosing a shortcut never enables a reminder. */
enum class HomeShortcut(val label: String, val feature: Feature) {
    Medication("Medication", Feature.Medications),
    Training("Training", Feature.Training),
    Photos("Photos", Feature.Photos),
    CareTasks("Care tasks", Feature.Calendar),
    Expenses("Expenses", Feature.Expenses),
    Memories("Memories", Feature.Memory);

    companion object {
        val guidedChoices = listOf(Medication, Training, Photos, CareTasks)

        fun decode(value: String?): Set<HomeShortcut> = value.orEmpty().split(',').mapNotNull { label ->
            if (label == "Calendar") CareTasks else entries.firstOrNull { it.label == label }
        }.toSet()

        fun encode(selection: Set<HomeShortcut>): String =
            entries.filter { it in selection }.joinToString(",") { it.label }

        fun selecting(current: Set<HomeShortcut>, shortcut: HomeShortcut, on: Boolean): Set<HomeShortcut> {
            val next = if (on) current + shortcut else current - shortcut
            // Earlier builds allowed more choices. Always allow removing one of those.
            require(!on || next.size <= 2) { "Choose up to two Home shortcuts." }
            return next
        }
    }
}
