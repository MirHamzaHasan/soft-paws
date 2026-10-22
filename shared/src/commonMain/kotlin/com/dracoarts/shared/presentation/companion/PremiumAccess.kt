package com.dracoarts.shared.presentation.companion

/** Product gates only. DemoSession is not a verified store entitlement. */
enum class PremiumFeature(val title: String, val description: String) {
    AdditionalDog("A journal for each cat.", "Adding another cat is part of Premium. Your existing cats stay available."),
    AiChat("Ask about your cat.", "Soft Paws AI conversations are part of Premium."),
    Toxicity("Know what to ask.", "Cat-specific toxicity explanations use Soft Paws AI and are part of Premium. Emergency calls stay free."),
    SafetyTopics("Safety for your cat.", "Personalized safety explanations use Soft Paws AI and are part of Premium."),
    NearestVet("Find a vet nearby.", "Search Maps for veterinary clinics near your chosen location with Premium."),
    DogTraining("Train your cat.", "A future Premium feature. Coming soon; training is not included as an available service yet."),
    VideoHighlight("Keep their moments moving.", "MP4 video export and sharing are part of Premium."),
    ReportPdf("Take their report with you.", "PDF export, printing and sharing are part of Premium."),
    MemoryBookPdf("Keep a copy of their memories.", "Memory Book PDF export and sharing are part of Premium."),
}

/** Existing journals must retain companion actions in legacy Debug review too. */
fun companionAvailable(reviewEnabled: Boolean, reviewStart: String?, hasDog: Boolean): Boolean =
    hasDog || !reviewEnabled || reviewStart?.startsWith("next-") == true || reviewStart == "welcome" || reviewStart?.startsWith("cat-") == true
