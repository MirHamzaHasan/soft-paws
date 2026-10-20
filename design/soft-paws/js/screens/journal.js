(() => {
  const S = SP,
    { h } = S;
  S.define("home", "home", "Miso’s kind of day", (c) => {
    const { scroll } = S.frame(c, { tab: "Today" });
    scroll.append(
      h(
        "section.sp-greeting",
        h("p.sp-kicker", "A LITTLE CLOSER, EVERY DAY"),
        h("h1", S.name(c) + "’s\nkind of\nday."),
        S.caption("The small things count."),
        S.cat(c),
      ),
      S.row(
        c,
        S.name(c),
        "Your cat · " + (c.answers.life || "Indoor"),
        "heart",
        () => S.go(c, "cat-switcher"),
      ),
      S.section(c, "A quick check-in", "See all", () => S.go(c, "log-chooser")),
    );
    const q = h("div.sp-quick");
    [
      ["Meal", "utensils", "log-meal"],
      ["Litter", "archive", "log-litter"],
      ["Play", "sparkles", "log-play"],
      ["Note", "notebook-pen", "log-note"],
    ].forEach(([l, i, id]) => {
      const b = h("button", { type: "button", ...S.tone(i) }, S.icon(i), l);
      F.press(c, b, { onTap: () => S.go(c, id) });
      q.append(b);
    });
    scroll.append(
      q,
      S.section(c, "Today’s little things", "Journal", () =>
        S.go(c, "timeline"),
      ),
      S.caption("Example day · 20 October 2026"),
      S.events(c, [...(c.answers.records || []), ...S.exampleEvents]),
      S.card(
        "Something on your mind?",
        h(
          "div",
          S.caption("Ask about your cat or reach your saved vet."),
          S.row(
            c,
            "Ask about " + S.name(c),
            "Soft Paws AI · Premium",
            "message-square-text",
            () => S.go(c, "ai-entry"),
          ),
          S.row(
            c,
            "What are you seeing?",
            "Saved veterinary contacts · free",
            "phone",
            () => S.go(c, "symptoms"),
          ),
        ),
        "lilac",
      ),
      S.row(c, "Care coming up", "Your chosen reminders", "calendar", () =>
        S.go(c, "calendar"),
      ),
    );
  });
  S.define("log-chooser", "journal", "What did you notice?", (c) => {
    const { scroll } = S.frame(c, { back: "home" });
    scroll.append(
      S.head(
        "What did you *notice?*",
        "Keep one thing about " + S.name(c) + "’s day.",
      ),
    );
    [
      ["Meal", "utensils", "log-meal"],
      ["Water", "droplet", "log-water"],
      ["Litter", "archive", "log-litter"],
      ["Play & movement", "sparkles", "log-play"],
      ["Sleep", "moon", "log-sleep"],
      ["Mood & behaviour", "heart", "log-mood"],
      ["Grooming", "scissors", "log-groom"],
      ["Weight", "activity", "log-weight"],
      ["A little note", "notebook-pen", "log-note"],
    ].forEach(([l, i, id]) =>
      scroll.append(S.row(c, l, "", i, () => S.go(c, id))),
    );
  });
  const forms = [
    [
      "meal",
      "A meal, remembered.",
      "How much did they eat?",
      "Amount offered (g)",
      ["All eaten", "Mostly eaten", "Some eaten", "Not eaten"],
      "utensils",
    ],
    [
      "water",
      "A water check.",
      "What did you observe?",
      "Measured amount (ml), if known",
      ["Drinking observed", "Water refreshed", "Amount measured", "Not sure"],
      "droplet",
    ],
    [
      "litter",
      "A little litter check.",
      "Record what you saw.",
      "Number of visits observed",
      ["Urine observed", "Stool observed", "Both observed", "Nothing observed"],
      "archive",
    ],
    [
      "play",
      "A moment of play.",
      "Their pace, their choice.",
      "Minutes",
      ["Interested", "A little interested", "Not interested", "Rested instead"],
      "sparkles",
    ],
    [
      "sleep",
      "A quiet stretch.",
      "Record an observed rest.",
      "Minutes observed",
      ["Asleep", "Resting", "Restless", "Not sure"],
      "moon",
    ],
    [
      "mood",
      "How did they seem?",
      "An observation, in your words.",
      "Context (optional)",
      ["Settled", "Playful", "Hiding", "Different than usual"],
      "heart",
    ],
    [
      "groom",
      "A little freshen-up.",
      "Keep track of your care.",
      "Minutes (optional)",
      ["Brushed", "Nails checked", "Coat checked", "Other care"],
      "scissors",
    ],
    [
      "weight",
      "A measured moment.",
      "Use a known measurement.",
      "Weight (kg)",
      ["Home scale", "Veterinary scale", "Other scale"],
      "activity",
    ],
    [
      "note",
      "One thing to remember.",
      "Small details can matter later.",
      "Title",
      ["Everyday note", "Vet note", "Something different"],
      "notebook-pen",
    ],
  ];
  forms.forEach(([id, title, sub, label, picks, icon]) =>
    S.define("log-" + id, "journal", title, (c) => {
      const { body, scroll } = S.frame(c, { back: "log-chooser" });
      scroll.append(S.head(title, sub, S.name(c) + " · TODAY"));
      const value = S.field(
        c,
        label,
        c.answers.draft?.id === id
          ? c.answers.draft.value
          : id === "weight"
            ? c.answers.weight || ""
            : "",
        ["mood", "note"].includes(id) ? "text" : "number",
      );
      if (value.input.type === "number") {
        value.input.min = "0";
        value.input.step = id === "weight" ? ".1" : "1";
      }
      const key = "log-" + id;
      scroll.append(
        value.el,
        S.picks(
          c,
          picks.map((x) => [x, icon]),
          key,
          { multi: id === "litter" },
        ),
      );
      const notes = S.field(
        c,
        id === "note" ? "Your note" : "Anything else?",
        c.answers.draft?.id === id ? c.answers.draft.notes : "",
        "textarea",
      );
      scroll.append(
        notes.el,
        S.row(
          c,
          "Add a private photo",
          "Optional · native picker in the app",
          "camera",
          () => S.go(c, "photo-picker"),
        ),
        S.caption("Observation time · 20 Oct 2026, 09:41"),
      );
      const error = h("p.sp-formerror", { role: "alert" });
      scroll.append(error);
      S.actions(
        c,
        body,
        S.btn(c, "Keep this " + (id === "note" ? "note" : "check-in"), () => {
          if (
            !c.answers[key] ||
            (Array.isArray(c.answers[key]) && !c.answers[key].length)
          ) {
            error.textContent = "Choose what you observed.";
            return;
          }
          if (
            value.input.type === "number" &&
            value.input.value &&
            Number(value.input.value) <= 0
          ) {
            error.textContent = "Use a number above zero, or leave it blank.";
            return;
          }
          if (id === "weight" && !value.input.value) {
            error.textContent = "Add a measured weight.";
            return;
          }
          if (
            id === "note" &&
            !value.input.value.trim() &&
            !notes.input.value.trim()
          ) {
            error.textContent = "Add a title or a note.";
            return;
          }
          const choice = Array.isArray(c.answers[key])
            ? c.answers[key].join(" · ")
            : c.answers[key];
          c.answers.records = [
            [
              "09:41",
              id === "note"
                ? value.input.value || "A little note"
                : title.replace(".", ""),
              [choice, value.input.value, notes.input.value]
                .filter(Boolean)
                .join(" · "),
              icon,
            ],
            ...(c.answers.records || []),
          ];
          c.answers.lastRecord = {
            title: id === "note" ? value.input.value || "A little note" : title,
            choice,
            amount: value.input.value,
            notes: notes.input.value,
            icon,
          };
          S.go(c, "saved");
        }),
        S.btn(
          c,
          "Keep as draft",
          () => {
            c.answers.draft = {
              id,
              value: value.input.value,
              notes: notes.input.value,
            };
            S.toast(c, "Example draft kept for this preview session.");
          },
          "quiet",
        ),
      );
    }),
  );
  S.define("saved", "journal", "A small thing, safely kept", (c) => {
    const { scroll, body } = S.frame(c, { back: "home" });
    scroll.classList.add("sp-center");
    const cat = S.cat(c, "hero");
    scroll.append(
      S.head(
        "A small thing, *kept.*",
        "One more detail in " + S.name(c) + "’s day.",
      ),
      cat,
      S.card(
        c.answers.lastRecord?.title || "Breakfast, mostly eaten",
        c.answers.lastRecord?.notes || "Today · 09:41 · Example record",
      ),
      S.caption("Prototype save · in memory for this preview."),
    );
    c.at(700, () => cat.motion.act("saved"));
    S.actions(
      c,
      body,
      S.btn(c, "Back to today", () => S.go(c, "home")),
      S.btn(c, "View record", () => S.go(c, "record"), "quiet"),
    );
  });
  S.define("timeline", "journal", "The little things, in order", (c) => {
    const { scroll } = S.frame(c, { tab: "Journal" });
    scroll.append(
      S.head("The little things, *in order.*", S.name(c) + "’s journal"),
      S.week(c, (d) => {
        const holder = scroll.querySelector(".sp-timelineevents");
        holder.replaceChildren(
          S.caption("Example day · " + d + " October 2026"),
          S.events(
            c,
            d === 20
              ? [...(c.answers.records || []), ...S.exampleEvents]
              : [
                  [
                    "10:15",
                    "A quiet afternoon",
                    "Resting by the window · sample record",
                    "moon",
                  ],
                ],
          ),
        );
      }),
    );
    const chips = h("div.sp-chiprow"),
      holder = h("div.sp-timelineevents");
    ["All", "Meals", "Litter", "Play", "Notes"].forEach((l, i) => {
      const b = h(
        "button.sp-chip" + (!i ? ".on" : ""),
        { type: "button", "aria-pressed": String(!i) },
        l,
      );
      c.on(b, "click", () => {
        chips.querySelectorAll("button").forEach((x) => {
          x.classList.remove("on");
          x.setAttribute("aria-pressed", "false");
        });
        b.classList.add("on");
        b.setAttribute("aria-pressed", "true");
        const source = [...(c.answers.records || []), ...S.exampleEvents],
          filtered =
            l === "All"
              ? source
              : source.filter(
                  (x) =>
                    x[3] ===
                    {
                      Meals: "utensils",
                      Litter: "archive",
                      Play: "sparkles",
                      Notes: "notebook-pen",
                    }[l],
                );
        holder.replaceChildren(
          S.caption("Example day · 20 October 2026"),
          filtered.length
            ? S.events(c, filtered)
            : S.card(
                "No " + l.toLowerCase() + " here yet",
                "A recorded observation will appear here.",
              ),
        );
      });
      chips.append(b);
    });
    holder.append(
      S.caption("Example day · 20 October 2026"),
      S.events(c, [...(c.answers.records || []), ...S.exampleEvents]),
    );
    scroll.append(
      chips,
      holder,
      S.btn(c, "Add a check-in", () => S.go(c, "log-chooser")),
    );
  });
  S.define("record", "journal", "A record with its context", (c) => {
    const { scroll, body } = S.frame(c, { back: "timeline" }),
      r = c.answers.lastRecord;
    scroll.append(
      S.head(
        r?.title || "Breakfast, *mostly eaten.*",
        S.name(c) + " · 20 October 2026",
      ),
      S.card(
        "What you recorded",
        h(
          "div",
          S.row(
            c,
            "Observation",
            r?.choice || "Mostly eaten",
            r?.icon || "utensils",
          ),
          S.row(
            c,
            "Recorded amount",
            r
              ? r.amount || "Not measured"
              : "65 g offered · not measured intake",
            "activity",
          ),
          S.row(c, "Time", "08:10 · local time", "clock"),
        ),
      ),
      S.section(c, "Your note"),
      h(
        "p",
        r?.notes || "Finished a little later, then settled by the window.",
      ),
      S.caption(
        "A caregiver observation. This does not establish a health condition.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Edit record", () => S.go(c, "record-edit")),
      S.btn(c, "Delete record", () => S.go(c, "delete-record"), "quiet"),
    );
  });
  S.define("record-edit", "journal", "Edit a remembered moment", (c) => {
    const { scroll, body } = S.frame(c, { back: "record" });
    scroll.append(
      S.head("Keep the *context right.*", "Changes belong to this record."),
    );
    const f = S.field(
        c,
        "Title",
        c.answers.lastRecord?.title || "Breakfast, mostly eaten",
      ),
      n = S.field(
        c,
        "Your note",
        c.answers.lastRecord?.notes || "Finished a little later.",
        "textarea",
      );
    scroll.append(f.el, n.el);
    S.actions(
      c,
      body,
      S.btn(c, "Save changes", () => {
        c.answers.lastRecord = {
          ...c.answers.lastRecord,
          title: f.input.value,
          notes: n.input.value,
        };
        S.go(c, "record");
      }),
      S.btn(c, "Discard changes", () => S.go(c, "record"), "quiet"),
    );
  });
  S.define("delete-record", "journal", "Delete this record?", (c) => {
    const { scroll, body } = S.frame(c, { back: "record" });
    scroll.append(
      S.head("Delete this *record?*", "This action needs a deliberate choice."),
      S.card(
        "This record only",
        "Other cats, records and drafts stay where they are.",
        "danger",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Keep record", () => S.go(c, "record")),
      S.btn(
        c,
        "Delete example record",
        () => {
          c.answers.records = (c.answers.records || []).slice(1);
          c.answers.lastRecord = null;
          S.go(c, "timeline");
        },
        "secondary",
      ),
    );
  });
  S.seq("home", [
    "home",
    "log-chooser",
    "log-meal",
    "saved",
    "timeline",
    "record",
  ]);
  S.seq("journal", [
    "log-chooser",
    "log-litter",
    "log-play",
    "saved",
    "timeline",
    "record",
    "record-edit",
  ]);
})();
