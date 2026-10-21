(() => {
  const S = SP,
    { h } = S;
  S.define("health", "health", "Care, all in one place", (c) => {
    const { scroll } = S.frame(c, { tab: "Care" });
    scroll.append(
      S.head("Care, *in one place.*", S.name(c) + "’s records and routines"),
      S.card(
        "Next on your list",
        h(
          "div",
          h("p.sp-kicker", "TODAY · YOUR CHOSEN TIME"),
          h("h3", "Coat & grooming check"),
          S.caption("18:00 · reminder off"),
          S.row(c, "View care calendar", "Your planned tasks", "calendar", () =>
            S.go(c, "calendar"),
          ),
        ),
        "butter",
      ),
      S.list(
        S.row(
          c,
          "Medication plans",
          "Only your vet’s instructions",
          "heart-pulse",
          () => S.go(c, "medications"),
        ),
        S.row(
          c,
          "Vaccination records",
          "Dates and documents",
          "shield-check",
          () => S.go(c, "vaccinations"),
        ),
        S.row(
          c,
          "Weight & observations",
          "Your recorded measurements",
          "activity",
          () => S.go(c, "insights"),
        ),
        S.row(
          c,
          "Prepare for a vet visit",
          "A report you can read for free",
          "notebook-pen",
          () => S.go(c, "report"),
        ),
        S.row(
          c,
          "Safety & contacts",
          "Direct contact access stays free",
          "phone",
          () => S.go(c, "safety"),
        ),
      ),
    );
  });
  S.define("medications", "health", "Your vet’s plan, remembered", (c) => {
    const { scroll, body } = S.frame(c, { back: "health" });
    scroll.append(
      S.head(
        "Your vet’s plan, *remembered.*",
        "Record instructions you already have.",
      ),
      S.card(
        "No active medication plans",
        h(
          "div",
          S.caption("Add the label and schedule exactly as prescribed."),
          S.row(
            c,
            "Previous plans",
            "Archived plans remain in the journal",
            "archive",
            () => S.go(c, "med-history"),
          ),
        ),
      ),
      S.caption("Soft Paws does not select medication or suggest doses."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Add a prescribed plan", () => S.go(c, "med-form")),
    );
  });
  S.define("med-form", "health", "Keep the prescribed details", (c) => {
    const { scroll, body } = S.frame(c, { back: "medications" });
    scroll.append(
      S.head(
        "Keep the *prescribed details.*",
        "Copy from the label or your vet’s plan.",
      ),
    );
    const name = S.field(c, "Medication name"),
      instructions = S.field(c, "Prescribed instructions", "", "textarea"),
      start = S.field(c, "Start date", "2026-10-20", "date");
    scroll.append(
      name.el,
      instructions.el,
      start.el,
      S.check(c, "Remind me at a time I choose", "medReminder").el,
      S.caption("No dose calculations or treatment recommendations."),
    );
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Keep plan", () => {
        if (!name.input.value.trim() || !instructions.input.value.trim()) {
          err.textContent = "Add the name and prescribed instructions.";
          return;
        }
        c.answers.medication = {
          name: name.input.value,
          instructions: instructions.input.value,
        };
        S.go(c, "med-detail");
      }),
    );
  });
  S.define("med-detail", "health", "A plan with a clear history", (c) => {
    const { scroll, body } = S.frame(c, { back: "medications" });
    scroll.append(
      S.head(
        c.answers.medication?.name || "Prescribed care",
        "Example plan · " + S.name(c),
      ),
      S.card(
        "Your saved instructions",
        c.answers.medication?.instructions ||
          "Your vet’s written directions appear here.",
      ),
      S.section(c, "Given history"),
      S.caption(
        c.answers.medGiven
          ? "Example administration recorded · today, 09:41"
          : "Nothing recorded as given yet.",
      ),
      S.row(
        c,
        "Archive this plan",
        "Retain the administration history",
        "archive",
        () => S.go(c, "med-history"),
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Record as given", () => {
        c.answers.medGiven = true;
        S.toast(c, "Example administration recorded.");
      }),
    );
  });
  S.define("med-history", "health", "Care history stays readable", (c) => {
    const { scroll } = S.frame(c, { back: "medications" });
    scroll.append(
      S.head(
        "Care history, *kept.*",
        "Archived plans are still part of the journal.",
      ),
      S.card(
        c.answers.medication?.name || "No archived plans",
        c.answers.medication?.instructions ||
          "Archived prescribed plans and their given history appear here.",
      ),
      S.caption("Example state · no medication advice."),
    );
  });
  S.define("vaccinations", "health", "Dates worth keeping close", (c) => {
    const { scroll, body } = S.frame(c, { back: "health" });
    scroll.append(
      S.head(
        "Dates worth *keeping close.*",
        "Follow the schedule from your vet.",
      ),
      S.card(
        c.answers.vaccine?.name || "No vaccination records yet",
        c.answers.vaccine
          ? c.answers.vaccine.date
          : "Keep the date, clinic and document together.",
      ),
      S.caption("The app does not infer which vaccines your cat needs."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Add a record", () => S.go(c, "vaccine-form")),
    );
  });
  S.define("vaccine-form", "health", "Add a vaccination record", (c) => {
    const { scroll, body } = S.frame(c, { back: "vaccinations" });
    scroll.append(
      S.head("A vaccination, *recorded.*", "Use the details from your clinic."),
    );
    const n = S.field(c, "Name on the record"),
      d = S.field(c, "Date given", "2026-10-20", "date");
    scroll.append(
      n.el,
      d.el,
      S.field(c, "Clinic or vet").el,
      S.field(c, "Next date, if your vet provided one", "", "date").el,
      S.row(
        c,
        "Attach document",
        "Native photo picker in the app",
        "image",
        () => S.go(c, "photo-picker"),
      ),
    );
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Keep record", () => {
        if (!n.input.value.trim() || !d.input.value) {
          err.textContent = "Add the vaccination name and date.";
          return;
        }
        c.answers.vaccine = { name: n.input.value, date: d.input.value };
        S.go(c, "vaccinations");
      }),
    );
  });
  S.define("calendar", "health", "The care you planned", (c) => {
    const { scroll, body } = S.frame(c, { back: "health" });
    scroll.append(
      S.head("The care *you planned.*", "Reminders only when you choose them."),
      S.week(c, (d) => S.toast(c, "Example agenda · " + d + " October")),
      S.section(c, "Tuesday, 20 October"),
      S.card(
        c.answers.task?.title || "Coat & grooming check",
        h(
          "div",
          S.caption(
            (c.answers.task?.time || "18:00") +
              " · " +
              (c.answers.taskDone ? "Completed" : "Planned") +
              " · reminders off",
          ),
          S.row(
            c,
            "View task",
            "Edit, complete or reschedule",
            "calendar",
            () => S.go(c, "task-detail"),
          ),
        ),
      ),
      S.section(c, "Tomorrow"),
      S.caption("No planned tasks."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Plan a task", () => S.go(c, "task-form")),
    );
  });
  S.define("task-detail", "health", "One task, on your terms", (c) => {
    const { scroll, body } = S.frame(c, { back: "calendar" });
    scroll.append(
      S.head(
        c.answers.task?.title || "Coat & *grooming check.*",
        "For " + S.name(c),
      ),
      S.card(
        "Your plan",
        h(
          "div",
          S.row(
            c,
            "When",
            "20 October · " + (c.answers.task?.time || "18:00"),
            "clock",
          ),
          S.row(c, "Repeat", "Does not repeat", "rotate-ccw"),
          S.row(c, "Reminder", "Off", "bell"),
        ),
      ),
      S.row(
        c,
        "Reschedule or edit",
        "Your other tasks stay as they are",
        "calendar",
        () => S.go(c, "task-form"),
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, c.answers.taskDone ? "Mark incomplete" : "Mark complete", () => {
        c.answers.taskDone = !c.answers.taskDone;
        S.go(c, "calendar");
      }),
      S.btn(
        c,
        "Remove example task",
        () => {
          c.answers.task = null;
          S.toast(c, "Example task removed.");
        },
        "quiet",
      ),
    );
  });
  S.define("task-form", "health", "Make a little room for care", (c) => {
    const { scroll, body } = S.frame(c, { back: "calendar" });
    scroll.append(S.head("Make room for *a little care.*"));
    const t = S.field(c, "Task", c.answers.task?.title || ""),
      time = S.field(c, "Time", c.answers.task?.time || "18:00", "time");
    scroll.append(
      t.el,
      S.field(c, "Date", "2026-10-20", "date").el,
      time.el,
      S.picks(
        c,
        [
          ["Does not repeat", "calendar"],
          ["Every day", "sun"],
          ["Every week", "calendar"],
        ],
        "taskRepeat",
      ),
      S.check(c, "Remind me for this task", "taskReminder").el,
    );
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Keep task", () => {
        if (!t.input.value.trim()) {
          err.textContent = "Give the task a name.";
          return;
        }
        c.answers.task = { title: t.input.value, time: time.input.value };
        S.go(c, "calendar");
      }),
    );
  });
  S.define("insights", "health", "Their week, in your words", (c) => {
    const { scroll } = S.frame(c, { back: "health" });
    scroll.append(
      S.head("Their week, *in view.*", "14–20 October · " + S.name(c)),
      S.card(
        "16 recorded meals",
        h(
          "div",
          S.caption("Meal observations each day · example data"),
          S.bars([2, 3, 2, 2, 3, 2, 2], ["W", "T", "F", "S", "S", "M", "T"]),
          S.caption("Counts show what was logged, not all food eaten."),
        ),
      ),
      S.card(
        "4.2 kg",
        h(
          "div",
          S.caption("Latest measured weight · 18 October · sample"),
          S.row(
            c,
            "View measurements",
            "3 saved entries this month",
            "activity",
            () => S.go(c, "weight-history"),
          ),
        ),
      ),
      S.row(
        c,
        "Prepare a care report",
        "The selected week, with your notes",
        "notebook-pen",
        () => S.go(c, "report"),
      ),
      S.caption(
        "Missing records do not mean missing care. No health scores are inferred.",
      ),
    );
  });
  S.define("weight-history", "health", "Measured, not guessed", (c) => {
    const { scroll, body } = S.frame(c, { back: "insights" });
    scroll.append(
      S.head("Measured, *not guessed.*", "Example measurements · kg"),
      S.list(
        S.row(c, "4.2 kg", "18 October · home scale", "activity"),
        S.row(c, "4.2 kg", "11 October · home scale", "activity"),
        S.row(c, "4.1 kg", "4 October · veterinary scale", "activity"),
      ),
      S.caption("Changes need context. Share concerns with your vet."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Add a measurement", () => S.go(c, "log-weight")),
    );
  });
  S.define("report", "health", "A calmer start to the visit", (c) => {
    const { scroll, body } = S.frame(c, { back: "health" });
    scroll.append(
      S.head(
        "Before the visit, *the facts.*",
        "Read the report on this phone for free.",
      ),
      S.card(
        "Care report",
        h(
          "div",
          h("h3", S.name(c)),
          S.caption("14–20 October 2026 · example week"),
          S.row(
            c,
            "Profile",
            [
              c.answers.breed || "Breed not recorded",
              c.answers.life || "Lifestyle not recorded",
            ].join(" · "),
            "heart",
          ),
          S.row(c, "Recorded meals", "16 observations", "utensils"),
          S.row(
            c,
            "Litter observations",
            "9 observations · urine / stool kept separately",
            "archive",
          ),
          S.row(c, "Measured weight", "4.2 kg · 18 October", "activity"),
        ),
      ),
      S.field(
        c,
        "Questions for your vet",
        "I’d like to discuss the recent change in appetite.",
        "textarea",
      ).el,
      S.caption("Caregiver observations only. The report does not diagnose."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Export options", () => S.go(c, "export-options")),
    );
  });
  S.define("export-options", "health", "Take the facts with you", (c) => {
    const { scroll } = S.frame(c, { back: "report" });
    scroll.append(
      S.head(
        "Take the facts *with you.*",
        "Choose exactly what leaves your device.",
      ),
      S.list(
        S.row(c, "Raw CSV", "Free · saved records as a table", "table", () =>
          S.go(c, "export-progress"),
        ),
        S.row(
          c,
          "PDF report",
          "Premium · readable on this phone for free",
          "notebook-pen",
          () => S.go(c, "paywall"),
        ),
        S.row(
          c,
          "Share or print PDF",
          "Premium · native share sheet in the app",
          "send",
          () => S.go(c, "paywall"),
        ),
      ),
      S.caption("No automatic upload or vet share links."),
    );
  });
  S.define("export-progress", "health", "Prepare, then share", (c) => {
    const { scroll, body } = S.frame(c, { back: "export-options" });
    scroll.append(
      S.head(
        "Ready when *you are.*",
        "Example export · no file has been created.",
      ),
      S.card(
        "Care records.csv",
        h(
          "div",
          S.caption(S.name(c) + " · 14–20 October 2026"),
          S.row(
            c,
            "Selected scope",
            "The selected cat and date range only",
            "check",
          ),
        ),
      ),
      S.caption(
        "The native app builds a file locally before opening the platform share sheet.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Preview native handoff", () =>
        S.toast(c, "Prototype only. No file or share sheet was opened."),
      ),
      S.btn(c, "Cancel", () => S.go(c, "report"), "quiet"),
    );
  });
  S.seq("health", [
    "health",
    "calendar",
    "task-detail",
    "medications",
    "med-form",
    "vaccinations",
    "insights",
    "report",
    "export-options",
  ]);
  S.define("safety", "safety", "A clear place to start", (c) => {
    const { scroll } = S.frame(c, { back: "home" });
    scroll.append(
      S.head(
        "Something feels *different?*",
        "Your saved veterinary contacts stay free.",
      ),
      S.card(
        "Need help now?",
        h(
          "div",
          S.caption("Contact your vet or an emergency veterinary clinic."),
          S.row(
            c,
            "Your saved contacts",
            "Free · direct contact access",
            "phone",
            () => S.go(c, "contacts"),
          ),
        ),
        "danger",
      ),
      S.list(
        S.row(
          c,
          "What are you seeing?",
          "Free · organise what to tell your vet",
          "heart",
          () => S.go(c, "symptoms"),
        ),
        S.row(c, "Find a nearby vet", "Premium · map search", "map-pin", () =>
          S.go(c, "nearby-vets"),
        ),
        S.row(
          c,
          "Check a possible exposure",
          "Premium · Soft Paws AI",
          "search",
          () => S.go(c, "toxicity"),
        ),
        S.row(
          c,
          "Safety topics for " + S.name(c),
          "Premium · educational only",
          "shield-check",
          () => S.go(c, "safety-topics"),
        ),
      ),
    );
  });
  S.define("symptoms", "safety", "What are you seeing?", (c) => {
    const { scroll, body } = S.frame(c, { back: "safety" });
    scroll.append(
      S.head(
        "What are you *seeing?*",
        "Choose what you want to tell your vet.",
      ),
      S.picks(
        c,
        [
          ["Eating or drinking differently", "utensils"],
          ["Litter habits changed", "archive"],
          ["Movement or breathing concern", "activity"],
          ["A change in behaviour", "heart"],
          ["Possible poisoning or exposure", "shield-check"],
        ],
        "symptom",
        { multi: true },
      ),
      S.caption(
        "This list does not assess urgency or diagnose. If you are worried, contact a vet.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Show saved contacts", () => S.go(c, "contacts")),
    );
  });
  S.define("contacts", "safety", "Your people, close by", (c) => {
    const { scroll, body } = S.frame(c, { back: "safety" });
    scroll.append(
      S.head("Your people, *close by.*", "Direct contact access stays free."),
      c.answers.vet
        ? S.card(
            c.answers.vet.name,
            h(
              "div",
              h("p", c.answers.vet.phone),
              S.btn(c, "Call saved contact", () =>
                S.toast(c, "Prototype only. No call was placed."),
              ),
            ),
          )
        : S.card(
            "No contacts saved yet",
            "Add your regular vet and an emergency clinic. They stay available offline.",
          ),
      S.row(
        c,
        "Animal-service contacts",
        "Choose a region for verified listings",
        "map-pin",
        () => S.go(c, "region"),
      ),
      S.caption("No universal veterinary phone number is assumed."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Save a contact", () => S.go(c, "contact-form")),
    );
  });
  S.define("contact-form", "safety", "Keep a number close", (c) => {
    const { scroll, body } = S.frame(c, { back: "contacts" });
    scroll.append(
      S.head("Keep a number *close.*", "Use contact details you have checked."),
    );
    const n = S.field(c, "Vet or clinic name"),
      p = S.field(c, "Phone number", "", "tel");
    scroll.append(n.el, p.el, S.field(c, "Address or note", "", "textarea").el);
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Save contact", () => {
        if (!n.input.value.trim() || !p.input.value.trim()) {
          err.textContent = "Add the contact name and phone number.";
          return;
        }
        c.answers.vet = { name: n.input.value, phone: p.input.value };
        S.go(c, "contacts");
      }),
    );
  });
  S.define("region", "safety", "Start with your region", (c) => {
    const { scroll, body } = S.frame(c, { back: "contacts" });
    scroll.append(
      S.head(
        "Start with *your region.*",
        "Animal-service contacts vary by country.",
      ),
      S.field(c, "Country or region", "", "text", "region").el,
      S.card(
        "Verified numbers only",
        "A contact is shown only when its country, purpose and source have been checked.",
      ),
      S.caption(
        "Prototype · no national number is supplied. Your own saved contacts remain available offline.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Back to saved contacts", () => S.go(c, "contacts")),
    );
  });
  S.define("nearby-vets", "safety", "A vet near your place", (c) => {
    const { scroll, body } = S.frame(c, { back: "safety" });
    scroll.append(
      S.head(
        "A vet near *your place.*",
        "Premium · location is always optional.",
      ),
      S.field(c, "City, area or postcode", "", "text", "place").el,
      h(
        "div.sp-map",
        S.icon("map-pin", 36),
        h("small", "Illustrative map · no live clinic results"),
      ),
      S.row(c, "Use my location", "Ask only for this search", "map-pin", () =>
        S.go(c, "location-denied"),
      ),
      S.caption(
        "Coverage and opening hours vary. Call a clinic to confirm availability.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "View Premium access", () => S.go(c, "paywall")),
      S.btn(c, "Saved contacts · free", () => S.go(c, "contacts"), "quiet"),
    );
  });
  S.define("location-denied", "safety", "Your place, typed instead", (c) => {
    const { scroll, body } = S.frame(c, { back: "nearby-vets" });
    scroll.append(
      S.head("Type a place *instead.*", "Location access was not granted."),
      S.field(
        c,
        "City, area or postcode",
        c.answers.place || "",
        "text",
        "place",
      ).el,
      S.card(
        "You can still search",
        "Use manual entry for map-based search. Direct saved contacts remain free and work offline.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Continue with this place", () => S.go(c, "nearby-vets")),
      S.btn(c, "Saved contacts", () => S.go(c, "contacts"), "quiet"),
    );
  });
  S.define("toxicity", "safety", "Keep exposure details together", (c) => {
    const { scroll, body } = S.frame(c, { back: "safety" });
    scroll.append(
      S.head(
        "A possible *exposure?*",
        "Keep details ready for a veterinary professional.",
      ),
      S.field(c, "Plant, product or substance").el,
      S.field(c, "What happened, and when?", "", "textarea").el,
      S.card(
        "For urgent concerns",
        "Use your saved vet or emergency clinic contact. An AI lookup is educational and cannot confirm that an exposure is safe.",
        "danger",
      ),
      S.caption("AI lookup is Premium and requires separate cloud consent."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Saved contacts · free", () => S.go(c, "contacts")),
      S.btn(c, "Explore AI lookup", () => S.go(c, "ai-entry"), "secondary"),
    );
  });
  S.define("safety-topics", "safety", "Read with your cat in mind", (c) => {
    const { scroll, body } = S.frame(c, { back: "safety" });
    scroll.append(
      S.head(
        "Read with *" + S.name(c) + " in mind.*",
        "Premium · educational topic suggestions",
      ),
      S.list(
        S.row(
          c,
          "Plants & household products",
          "Bring exact product names to your vet",
          "shield-check",
        ),
        S.row(
          c,
          "Food & medication storage",
          "Keep veterinary instructions close",
          "archive",
        ),
        S.row(
          c,
          "Indoor & outdoor routines",
          "Based on your selected lifestyle",
          "house",
        ),
      ),
      S.caption(
        "Topics are proposed screen content. No personalised safety assessment has run.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "View Premium access", () => S.go(c, "paywall")),
    );
  });
  S.seq("safety", [
    "safety",
    "symptoms",
    "contacts",
    "contact-form",
    "nearby-vets",
    "location-denied",
    "toxicity",
  ]);
})();
