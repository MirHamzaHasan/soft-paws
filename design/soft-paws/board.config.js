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
    health: [
      {
        title: "Fitbit · missing data stays missing",
        took: "Label an unrecorded measurement as absent rather than scoring the person.",
        url: "https://mobbin.com/screens/e5fe7258-9cb6-44d8-b602-1af9d2f536f0",
      },
    ],
  },
};
