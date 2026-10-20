(() => {
  const S = SP,
    { h } = S;
  S.define("welcome", "opening", "A little closer, every day", (c) => {
    const { body, scroll } = S.frame(c);
    scroll.classList.add("sp-center");
    const head = S.head(
        "The little things, kept.",
        "A daily journal for life with your cat.",
      ),
      cat = S.cat(c, "hero"),
      record = h("div.sp-opening-record");
    head
      .querySelector("h1")
      .replaceChildren(F.rich("The little things, *kept.*"));
    scroll.append(head, cat, record);
    const beats = [
      ["The little things, *kept.*", "A daily journal for life with your cat."],
      ["A bowl. A nap. *A note.*", "The details are easy to forget."],
      ["One small *check-in.*", "Tap the record to keep this moment."],
      [
        "Their week, *in view.*",
        "Find the exact observation when you need it.",
      ],
      [
        "A little closer, *every day.*",
        "Start with your cat. Keep the rest simple.",
      ],
    ];
    let i = 0;
    const b = S.btn(c, "Next", () => {
      if (i < 4) {
        i++;
        draw();
      } else S.go(c, "cat-name");
    });
    const draw = () => {
      head.querySelector("h1").replaceChildren(F.rich(beats[i][0]));
      head.querySelector("p").textContent = beats[i][1];
      record.replaceChildren();
      if (i === 2)
        record.append(
          S.btn(
            c,
            "Keep a breakfast note",
            () => {
              c.answers.practice = true;
              cat.motion.act("saved");
              S.toast(c, "Example note kept. Your journal starts after setup.");
              i++;
              draw();
            },
            "secondary",
          ),
        );
      if (i === 3)
        record.append(
          S.card(
            "Breakfast, mostly eaten",
            h(
              "div.sp-meta",
              S.icon("utensils", 18),
              "Today · 08:10 · Example record",
            ),
          ),
        );
      b.textContent = i === 4 ? "Meet your cat" : "Next";
    };
    draw();
    S.actions(
      c,
      body,
      b,
      S.btn(c, "Skip intro", () => S.go(c, "cat-name"), "quiet"),
    );
  });
  S.seq("opening", ["welcome"]);
  S.define("cat-name", "setup", "Who is your little shadow?", (c) => {
    const { body, scroll } = S.frame(c, { back: "welcome", progress: 0.08 });
    scroll.append(
      S.head(
        "Who is your *little shadow?*",
        "Start with a name. Details can wait.",
      ),
      S.cat(c, "hero"),
    );
    const f = S.field(c, "Cat’s name", c.answers.name, "text", "name");
    scroll.append(f.el);
    const error = h("p.sp-formerror", { role: "alert" });
    scroll.append(error);
    S.actions(
      c,
      body,
      S.btn(c, "Meet " + S.name(c), () => {
        if (!f.input.value.trim()) {
          error.textContent = "Give your cat a name.";
          f.input.focus();
          return;
        }
        c.answers.name = f.input.value.trim();
        S.go(c, "cat-life");
      }),
      S.btn(
        c,
        "Start with name only",
        () => {
          if (f.input.value.trim()) S.go(c, "home");
          else {
            error.textContent = "Give your cat a name.";
            f.input.focus();
          }
        },
        "quiet",
      ),
    );
  });
  S.define("cat-life", "setup", "A homebody or an explorer?", (c) => {
    const { scroll, body } = S.frame(c, { back: "cat-name", progress: 0.2 });
    scroll.append(
      S.head(
        "Where does " + S.name(c) + " *spend the day?*",
        "This shapes the care shortcuts.",
      ),
      S.cat(c, "small"),
      S.picks(
        c,
        [
          ["Indoor", "house"],
          ["Outdoor", "trees"],
          ["A bit of both", "sun"],
          ["Not sure yet", "circle-question-mark"],
        ],
        "life",
        { tiles: true, to: "cat-age" },
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Skip", () => S.go(c, "cat-age"), "quiet"),
    );
  });
  S.define("cat-age", "setup", "Tiny paws or old soul?", (c) => {
    const { body, scroll } = S.frame(c, { back: "cat-life", progress: 0.32 });
    scroll.append(
      S.head("How old is *" + S.name(c) + "?*", "An estimate is fine."),
      S.cat(c, "small"),
      S.picks(
        c,
        [
          ["Kitten · under 1", "sparkles"],
          ["Adult · 1–6 years", "heart"],
          ["Mature · 7–10 years", "sun"],
          ["Senior · 11+ years", "moon"],
          ["I’m not sure", "circle-question-mark"],
        ],
        "age",
        { to: "cat-details" },
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Skip", () => S.go(c, "cat-details"), "quiet"),
    );
  });
  S.define("cat-details", "setup", "A few familiar details", (c) => {
    const { body, scroll } = S.frame(c, { back: "cat-age", progress: 0.44 });
    scroll.append(
      S.head(
        "A few *familiar details.*",
        "Optional now. Editable in their profile.",
      ),
    );
    const breed = S.field(c, "Breed or mix", c.answers.breed, "text", "breed"),
      birth = S.field(c, "Birthday, if known", "", "date", "birthday");
    scroll.append(
      breed.el,
      birth.el,
      S.section(c, "Sex & neuter status"),
      S.picks(
        c,
        [
          ["Female", "heart"],
          ["Male", "heart"],
          ["Unknown", "circle-question-mark"],
        ],
        "sex",
        { tiles: true },
      ),
      S.picks(
        c,
        [
          ["Spayed / neutered", "check"],
          ["Not neutered", "circle"],
          ["Not sure", "circle-question-mark"],
        ],
        "neutered",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Continue", () => S.go(c, "cat-weight")),
    );
  });
  S.define("cat-weight", "setup", "One useful starting point", (c) => {
    const { body, scroll } = S.frame(c, {
      back: "cat-details",
      progress: 0.56,
    });
    scroll.append(
      S.head("A starting *weight.*", "Only record a measurement you know."),
      S.cat(c, "small"),
    );
    const f = S.field(c, "Weight in kg", c.answers.weight, "number", "weight");
    f.input.step = ".1";
    f.input.min = ".1";
    scroll.append(
      f.el,
      S.caption("No target weight is inferred from this number."),
    );
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Continue", () => {
        if (f.input.value && !(Number(f.input.value) > 0)) {
          err.textContent = "Enter a weight above zero, or skip.";
          return;
        }
        S.go(c, "cat-needs");
      }),
      S.btn(
        c,
        "I don’t know yet",
        () => {
          c.answers.weight = "";
          S.go(c, "cat-needs");
        },
        "quiet",
      ),
    );
  });
  S.define("cat-needs", "setup", "Anything we should keep in view?", (c) => {
    const { body, scroll } = S.frame(c, { back: "cat-weight", progress: 0.68 });
    scroll.append(
      S.head("Anything to *keep in view?*", "Your notes, in your own words."),
      S.field(c, "Food, allergies or care notes", "", "textarea", "careNotes")
        .el,
      S.card(
        "Your vet’s instructions",
        "Keep prescribed care here. Soft Paws does not diagnose or recommend treatment.",
        "soft",
      ),
      S.caption("You can leave this blank."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Continue", () => S.go(c, "cat-goals")),
    );
  });
  S.define("cat-goals", "setup", "What would help you most?", (c) => {
    const { body, scroll } = S.frame(c, { back: "cat-needs", progress: 0.78 });
    scroll.append(
      S.head("What would *help most?*", "Pick the things you want close by."),
      S.picks(
        c,
        [
          ["Everyday care", "notebook-pen", "Meals, litter, play and notes"],
          ["Vet prep", "heart", "Find the facts before a visit"],
          ["Little memories", "image", "Photos and the stories behind them"],
          ["Reminders", "calendar", "Only when you choose them"],
        ],
        "goals",
        { multi: true },
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Make a place for " + S.name(c), () =>
        S.go(c, "reminder-setup"),
      ),
    );
  });
  S.define("reminder-setup", "setup", "A nudge when you choose", (c) => {
    const { body, scroll } = S.frame(c, { back: "cat-goals", progress: 0.9 });
    scroll.append(
      S.head(
        "A nudge, *if you want.*",
        "Your journal works without notifications.",
      ),
      S.cat(c, "small"),
    );
    const sw = h("span.sp-switch", { "aria-hidden": "true" }),
      r = S.row(
        c,
        "Care reminders",
        "Off until you choose a time",
        "bell",
        () => {
          c.answers.reminders = !c.answers.reminders;
          sw.classList.toggle("on", c.answers.reminders);
          S.toast(
            c,
            c.answers.reminders
              ? "Preview only. The native app will ask through its system prompt."
              : "Reminders stay off.",
          );
        },
        sw,
      );
    r.setAttribute("role", "switch");
    r.setAttribute("aria-checked", "false");
    c.on(r, "click", () =>
      r.setAttribute("aria-checked", String(!!c.answers.reminders)),
    );
    scroll.append(
      S.list(r),
      S.caption(
        "In the app, enabling reminders opens the platform permission request. Denial never blocks a save.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Continue", () => S.go(c, "plan-reveal")),
    );
  });
  S.define("plan-reveal", "setup", "A place for Miso’s days", (c) => {
    const { body, scroll } = S.frame(c, { back: "reminder-setup" });
    scroll.append(
      S.head(
        "A place for *" + S.name(c) + "’s days.*",
        "Your first cat’s journal stays free.",
      ),
      S.cat(c),
      S.card(
        "Keep it close",
        h(
          "div",
          S.row(
            c,
            "Meals, litter & little notes",
            "Saved on this device",
            "notebook-pen",
          ),
          S.row(
            c,
            "Your selected focus",
            (c.answers.goals || []).join(" · ") || "Everyday care",
            "heart",
          ),
          S.row(
            c,
            "Care reminders",
            c.answers.reminders
              ? "Chosen by you · permission still needed"
              : "Off for now",
            "bell",
          ),
        ),
        "soft",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Open the journal", () => S.go(c, "home")),
      S.btn(c, "Explore Premium", () => S.go(c, "paywall"), "quiet"),
    );
  });
  S.seq("setup", [
    "cat-name",
    "cat-life",
    "cat-age",
    "cat-details",
    "cat-weight",
    "cat-needs",
    "cat-goals",
    "reminder-setup",
    "plan-reveal",
  ]);
})();
