package com.dracoarts.shared.domain.model

data class TrainingProgram(val id: String, val title: String, val purpose: String, val steps: List<TrainingStep>)
data class TrainingStep(val title: String, val instruction: String)

/** Original short practice prompts following AVSAB's reward-based principles. */
object TrainingCatalog {
    const val version = "2026-10-15"
    const val source = "https://avsab.org/wp-content/uploads/2021/08/AVSAB-Humane-Dog-Training-Position-Statement-2021.pdf"
    const val stop = "Keep practice brief. Pause if your dog disengages or shows stress. Never force a response."
    val programs = listOf(
        TrainingProgram("name-response", "Name response", "A cheerful check-in in a quiet room.", listOf(
            TrainingStep("Get ready", "Choose a quiet spot and a few small rewards your dog enjoys."),
            TrainingStep("Say the name once", "Wait for your dog to look toward you without repeating the name."),
            TrainingStep("Mark and reward", "Say ‘yes’ when they look, then give a reward. Finish while it feels easy."))),
        TrainingProgram("settle-mat", "Settle on a mat", "Make a comfortable resting place familiar.", listOf(
            TrainingStep("Place the mat", "Put a comfortable mat in a calm area. Let your dog approach freely."),
            TrainingStep("Notice interest", "Reward a voluntary look, sniff or step onto the mat."),
            TrainingStep("Reward a pause", "Offer a reward for choosing to pause there. Let them leave freely."),
            TrainingStep("Finish calmly", "End with a break; keep future practice short."))),
        TrainingProgram("loose-lead", "Loose-lead check-in", "Practice attention without pulling or pressure.", listOf(
            TrainingStep("Choose an easy spot", "Start in a quiet, safe place with a comfortably loose lead."),
            TrainingStep("Notice a check-in", "Mark and reward a voluntary look toward you."),
            TrainingStep("Take a few steps", "Reward staying nearby while the lead remains loose."),
            TrainingStep("Take a break", "Pause or increase space if distractions make this difficult."))),
    )
}
