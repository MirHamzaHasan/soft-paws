package com.dracoarts.shared.presentation.companion

/** Every surface in the owner-selected task024–026 board has a native route. */
enum class CompanionScreen(val boardId: String) {
    Opening("next-opening"),
    Dog("next-dog"),
    Lifestyle("cat-life"),
    Stage("next-stage"),
    Age("next-age"),
    Breed("next-breed"),
    Sex("next-sex"),
    Size("next-size"),
    Experience("next-experience"),
    Goals("next-goals"),
    Rhythm("next-rhythm"),
    Focus("next-focus"),
    Personality("next-personality"),
    Activities("next-activities"),
    Food("next-food"),
    CareNotes("next-care-notes"),
    Reminder("next-reminder"),
    Permissions("next-permissions"),
    ContextReview("next-context-review"),
    Practice("next-practice"),
    AiDemo("next-ai-demo"),
    Login("next-login"),
    Email("next-email"),
    CheckEmail("next-check-email"),
    EmailExpired("next-email-expired"),
    AuthOffline("next-auth-offline"),
    AccountSettings("next-account-settings"),
    DogProfile("next-dog-profile"),
    DeleteAccount("next-delete-account"),
    Plan("next-plan"),
    Paywall("next-paywall"),
    Trial("next-trial"),
    Ready("next-ready"),
    PremiumReady("next-premium-ready"),
    AiGate("next-ai-gate"),
    Restore("next-restore"),
    ManagePlan("next-manage-plan"),
    Cancel("next-cancel"),
    StoreManage("next-store-manage"),
    Ended("next-ended"),
    Home("next-home"),
    HomePremium("next-home-premium"),
    HomeEmpty("next-home-empty"),
    AiPrivacy("next-ai-privacy"),
    Chat("next-chat"),
    ChatAnswer("next-chat-answer"),
    ChatEmpty("next-chat-empty"),
    ChatOffline("next-chat-offline"),
    ChatError("next-chat-error"),
    ChatLimit("next-chat-limit"),
    Threads("next-threads"),
    ThreadReadonly("next-thread-readonly"),
    WeeklyRecap("next-weekly-recap"),
    VetQuestions("next-vet-questions"),
    MemoryCaption("next-memory-caption"),
    CreateAccount("create-account"),
    PasswordReset("password-reset"),
    FutureFeatures("future-features"),;
    companion object {
        fun fromBoard(id: String?): CompanionScreen? = entries.firstOrNull { it.boardId == id } ?: when (id) {
            "welcome" -> Opening
            "cat-name" -> Dog
            "cat-age" -> Stage
            "cat-details" -> Breed
            "cat-weight" -> Size
            "cat-needs" -> CareNotes
            "cat-goals" -> Goals
            "reminder-setup" -> Permissions
            "plan-reveal" -> Plan
            "sign-in" -> Login
            "email-sign-in" -> Email
            "paywall" -> Paywall
            "account-plan" -> ManagePlan
            "manage-subscription" -> StoreManage
            else -> null
        }
    }
}
