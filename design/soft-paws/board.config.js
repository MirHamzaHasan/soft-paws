window.BOARD = {
  id: "soft-paws-v1",
  name: "Soft Paws",
  startView: "screens",
  answers: {
    name: "Miso",
    breed: "Domestic shorthair",
    age: "3 years",
    life: "Indoor",
    sex: "Female",
    neutered: "Spayed",
    weight: "4.2",
    goals: ["Everyday care", "Vet prep"],
    reminders: false,
    records: [],
  },
  sections: [
    {
      id: "foundations",
      view: "kit",
      title: "The Soft Paws kit",
      intent: "Apricot, teal and seven care colours. One original tabby.",
    },
    {
      id: "opening",
      title: "01 · A little closer, every day",
      intent: "One cat carries the opening into a real care record.",
    },
    {
      id: "setup",
      title: "02 · Meet your cat",
      intent: "Quick start, optional detail, independent profiles.",
    },
    {
      id: "home",
      title: "03 · A day with Miso",
      intent: "Named quick logs, a quiet companion and useful next steps.",
    },
    {
      id: "journal",
      title: "04 · The little things, kept",
      intent: "Record, find, edit and keep the context.",
    },
    {
      id: "health",
      title: "05 · Care that has a place",
      intent: "Health records, opt-in reminders and observations over time.",
    },
    {
      id: "safety",
      title: "06 · When something feels wrong",
      intent:
        "Free saved contacts first. Optional search and bounded education.",
    },
    {
      id: "memories",
      title: "07 · More than the check-ins",
      intent: "Private photos, a Memory Book, highlights and expenses.",
    },
    {
      id: "ai",
      title: "08 · Ask about Miso",
      intent: "A compact chat with explicit weekly cloud context.",
    },
    {
      id: "account",
      title: "09 · Yours, with room to grow",
      intent:
        "Optional account, Premium boundaries, settings and data control.",
    },
    {
      id: "states",
      title: "10 · The days that do not go to plan",
      intent: "Empty, loading, offline, denied and recoverable failures.",
    },
    {
      id: "motion",
      view: "transitions",
      title: "Motion & companion",
      intent: "Bounded Rive reactions and native-reproducible transitions.",
    },
  ],
  research: {
    opening: [
      {
        title: "Finch · a companion throughout setup",
        took: "Keep the same companion through a short personal setup; ask for reminders after their purpose is clear.",
        url: "https://mobbin.com/flows/80ef83ef-f872-4825-b18d-6b193d60a9aa",
      },
      {
        title: "Finch · goals become a plan",
        took: "Carry the selected goals into a visible starter plan; skip irrelevant questions.",
        url: "https://mobbin.com/flows/19212698-61fe-43ca-9144-60c9e73bbcd2",
      },
    ],
    home: [
      {
        title: "Finch · a companion beside useful actions",
        took: "Keep the companion present while daily actions stay distinct and easy to find. Soft Paws uses its own cat, colour roles and layout.",
        url: "https://mobbin.com/screens/b63e72e3-54bd-4a16-9950-0f3b496fc7d4",
      },
      {
        title: "Fi · current pet as the anchor",
        took: "Put the selected animal and dated care above discovery content.",
        url: "https://mobbin.com/screens/64c4ae66-ff01-43e1-b36f-964bb3c2cdfb",
      },
      {
        title: "BitePal · one direct logging prompt",
        took: "Keep the main logging action readable beside a character. Soft Paws assigns stable colours to its own named care categories.",
        url: "https://mobbin.com/screens/eb74890f-44ab-41bd-8933-7beebe1036c3",
      },
    ],
    journal: [
      {
        title: "Bevel · a week above the journal",
        took: "Use a compact week to navigate dated observations, with explicit filters.",
        url: "https://mobbin.com/screens/ef31943c-df1d-405b-8436-0ba766143ffc",
      },
      {
        title: "Nike Run Club · readable activity rows",
        took: "Let the event title, time and details establish the hierarchy.",
        url: "https://mobbin.com/screens/c34c0cf4-7081-4d69-9d76-cbaef4baece4",
      },
    ],
    memories: [
      {
        title: "X · selected media above its sequence",
        took: "Keep the selected photo close to its ordered sequence and the next action. Soft Paws uses its own cat kit, real local images and free preview; it does not copy posting or social tools.",
        url: "https://mobbin.com/screens/d268f7ed-340c-4733-8258-602f6c0b5aeb",
      },
      {
        title: "Once · title beside the film cover",
        took: "Keep the editable film title beside its chosen cover. Soft Paws persists it in the existing local draft and keeps export separate from editing.",
        url: "https://mobbin.com/screens/d4dcb2ca-977c-45d8-ae64-27ac1e3a7f33",
      },
      {
        title: "Google Photos · a photo beside its saved details",
        took: "Keep the entered date and editable caption close to the image. Separate saved metadata from whether the local file is available. Soft Paws keeps private local copies and makes no backup promise.",
        url: "https://mobbin.com/screens/50fa71b5-390d-4890-952f-a5bfb4dc3854",
      },
      {
        title: "Brex · dated costs with explicit currency",
        took: "Keep currency beside each recorded amount and group costs by their entered date. Soft Paws retains separate currency totals and its own cat-care categories; there are no company or household claims.",
        url: "https://mobbin.com/screens/1bec3e82-7d91-4969-afcf-5cbfb8402845",
      },
    ],
    ai: [
      {
        title: "Peerspace · compact conversation",
        took: "Keep the composer anchored and separate evidence from message prose.",
        url: "https://mobbin.com/screens/00e71f8b-2bdd-49ab-a4fd-cb832e713fda",
      },
    ],
    account: [
      {
        title: "Lovi · plans that can be compared",
        took: "Keep plan choices on one screen. Use complete recurring prices and a clear exit; omit unverified claims.",
        url: "https://mobbin.com/screens/b19ae89c-7af8-4485-b23a-2188aaf0522d",
      },
    ],
    safety: [
      {
        title: "Grab Driver · saved emergency contacts",
        took: "Show the saved name and number directly, with a separate add-contact action. Soft Paws keeps contacts local and does not copy its location sharing.",
        url: "https://mobbin.com/screens/c2ad0973-1719-4ef4-a31f-bb2fed7ef6d1",
      },
    ],
    health: [
      {
        title: "Visible · explicit ranges and separate measures",
        took: "Keep the date range visible and each recorded measure distinct. Soft Paws uses its own cat kit and counts observations without inferring a health score.",
        url: "https://mobbin.com/screens/dd1ad5e7-a166-48a0-a8b1-0c1efb859820",
      },
      {
        title: "Amie · selected day and chronological agenda",
        took: "Keep the selected date visible and the agenda in time order. Care tasks show their saved time and recorded completion; they do not imply measured durations or outcomes.",
        url: "https://mobbin.com/screens/e198fa03-f4d9-4a6c-8f5c-854478fd40a2",
      },
      {
        title: "Mindvalley · explicit reminder choice",
        took: "Show whether reminders are on, keep time and repeat choices explicit, then show the saved schedule. We keep the cat kit and omit wellness frequency suggestions.",
        url: "https://mobbin.com/flows/5fa563c5-ee26-4563-a70a-6bd98e484b7c",
      },
      {
        title: "Apple Health · prescribed details and chosen schedule",
        took: "Keep the entered instructions separate from a chosen reminder and review the saved facts. Soft Paws does not copy medication search, interaction claims, clinical options or artwork.",
        url: "https://mobbin.com/flows/61a17fd3-3918-40b6-bfcb-6b12927d5244",
      },
      {
        title: "Fitbit · missing data stays missing",
        took: "Label an unrecorded measurement as absent rather than scoring the person.",
        url: "https://mobbin.com/screens/e5fe7258-9cb6-44d8-b602-1af9d2f536f0",
      },
    ],
  },
};
