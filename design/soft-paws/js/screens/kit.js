(() => {
  const S = SP,
    { h } = S;
  S.define("empty", "states", "Every story starts somewhere", (c) => {
    const { scroll, body } = S.frame(c, { tab: "Today" });
    scroll.append(
      S.head(
        "A little *begins here.*",
        "Your first record makes this a journal.",
      ),
      S.cat(c, "hero"),
      S.caption(
        "No entries yet. Meals, litter, play and notes will appear here.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Keep a first check-in", () => S.go(c, "log-chooser")),
    );
  });
  S.define("loading", "states", "Finding your local journal", (c) => {
    const { scroll } = S.frame(c, { tab: "Today" });
    scroll.append(
      S.head("Opening the *journal.*", "Reading local records."),
      h("div.sp-skeleton.hero", { "aria-hidden": "true" }),
      h("div.sp-skeleton", { "aria-hidden": "true" }),
      h("div.sp-skeleton", { "aria-hidden": "true" }),
      h(
        "p.sp-caption",
        { role: "status" },
        "Loading example state · care tools do not wait for AI or network services.",
      ),
    );
  });
  S.define("offline", "states", "Still here without a signal", (c) => {
    const { scroll, body } = S.frame(c, { back: "home" });
    scroll.append(
      S.head("Still here, *without a signal.*", "Your local journal is ready."),
      S.cat(c),
      S.card(
        "What works offline",
        "Care logging, saved records, photos, on-phone reports and direct access to saved contacts.",
        "soft",
      ),
      S.caption(
        "AI and map-based search need a connection. Your typed question can stay as a draft.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Keep a check-in", () => S.go(c, "log-chooser")),
      S.btn(c, "Saved contacts", () => S.go(c, "contacts"), "secondary"),
    );
  });
  S.define("save-failure", "states", "Your note is still here", (c) => {
    const { scroll, body } = S.frame(c, { back: "log-note" });
    scroll.append(
      S.head("Your note is *still here.*", "The local save did not finish."),
      S.card(
        "Draft kept on screen",
        "Do not show a success reaction or play a saved sound until the write commits.",
        "warn",
      ),
      S.field(
        c,
        "Your note",
        "Miso watched the birds after breakfast.",
        "textarea",
      ).el,
    );
    S.actions(
      c,
      body,
      S.btn(c, "Try saving again", () => S.go(c, "saved")),
      S.btn(c, "Return to edit", () => S.go(c, "log-note"), "secondary"),
    );
  });
  S.define("permission-denied", "states", "A photo can wait", (c) => {
    const { scroll, body } = S.frame(c, { back: "log-note" });
    scroll.append(
      S.head("A photo *can wait.*", "Photo access was not granted."),
      S.card(
        "Keep the observation anyway",
        "Save your note without a photo. You can add one later.",
      ),
      S.caption(
        "The app uses the system picker where available. Permission choices never block care logging.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Continue without photo", () => S.go(c, "log-note")),
      S.btn(
        c,
        "Try the system picker",
        () => S.go(c, "photo-picker"),
        "secondary",
      ),
    );
  });
  S.define("missing-photo", "states", "The memory still has its words", (c) => {
    const { scroll, body } = S.frame(c, { back: "photos" });
    scroll.append(
      S.head(
        "The photo *is missing.*",
        "The caption and record are still here.",
      ),
      h("div.sp-iconbig", S.icon("image")),
      S.card(
        "The window supervisor",
        "All afternoon, keeping an eye on the birds.",
      ),
      S.caption("A missing file does not become a different image."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Choose a replacement", () => S.go(c, "photo-picker")),
      S.btn(c, "Keep the caption", () => S.go(c, "photos"), "secondary"),
    );
  });
  S.define("revision-conflict", "states", "A newer version is here", (c) => {
    const { scroll, body } = S.frame(c, { back: "record" });
    scroll.append(
      S.head(
        "A newer version *is here.*",
        "This record changed while you were editing.",
      ),
      S.card(
        "Your draft is still on screen",
        "Review the saved record before applying your edits. Never overwrite it silently.",
        "warn",
      ),
      S.field(
        c,
        "Your draft",
        "Breakfast mostly eaten, a little later.",
        "textarea",
      ).el,
    );
    S.actions(
      c,
      body,
      S.btn(c, "Review saved record", () => S.go(c, "record")),
      S.btn(
        c,
        "Keep editing my draft",
        () => S.go(c, "record-edit"),
        "secondary",
      ),
    );
  });
  S.seq("states", [
    "empty",
    "loading",
    "offline",
    "save-failure",
    "permission-denied",
    "missing-photo",
    "revision-conflict",
  ]);
  S.define(
    "kit-type",
    "foundations",
    "Apricot, colour and readable type",
    (c) => {
      const { scroll } = S.frame(c);
      scroll.append(
        S.head(
          "Soft Paws *belongs to cats.*",
          "A daily care journal, carried by one original tabby.",
        ),
        h("p.sp-kicker", "BRICOLAGE GROTESQUE · 700 / 800"),
        h("div.sp-number", "4.2", h("small", " kg")),
        h(
          "p",
          "Inter · 400 / 500. Reading text has space to breathe, with a minimum 4.5:1 contrast.",
        ),
        S.card(
          "Ground & panel",
          "Warm cream, teal actions and an apricot welcome. Clear borders, with no decorative shadows or gradients.",
        ),
        h(
          "div.sp-grid2",
          S.card("Teal", "Primary action", "soft"),
          S.card("Attention", "Meaning + label", "warn"),
        ),
        S.caption(
          "Cards 24 · rows 16 · tiles 12 · 24 px gutters · controls ≥48 px.",
        ),
        h("div.sp-swatches", [
          ["butter", "Butter", "Meals & daily plans"],
          ["lilac", "Lilac", "Litter & medication"],
          ["mint", "Mint", "Play & care contacts"],
          ["rose", "Rose", "Notes & mood"],
          ["sky", "Sky", "Water & measurements"],
          ["peach", "Apricot", "Cat & memories"],
          ["periwinkle", "Periwinkle", "Sleep & rest"],
        ].map(([tone, name, purpose]) => h("div.sp-swatch", { "data-tone": tone }, h("strong", name), h("small", purpose)))),
      );
    },
    { flow: false },
  );
  S.define(
    "kit-controls",
    "foundations",
    "Controls in their actual states",
    (c) => {
      const { scroll } = S.frame(c);
      scroll.append(
        S.head("A clear *next step.*"),
        S.btn(c, "Keep check-in", () => S.toast(c, "Example action")),
        S.btn(c, "Secondary action", () => {}, "secondary"),
      );
      const disabled = S.btn(c, "Unavailable", () => {});
      disabled.disabled = true;
      scroll.append(
        disabled,
        S.field(c, "Cat’s name", "Miso").el,
        S.picks(
          c,
          [
            ["Indoor", "house"],
            ["Outdoor", "trees"],
          ],
          "life",
        ),
        S.check(c, "Optional reminder", "kitReminder").el,
        S.caption(
          "Selected rows carry a check and aria-pressed. Labels never depend on colour alone.",
        ),
      );
    },
    { flow: false },
  );
  S.define(
    "kit-cat",
    "foundations",
    "An original tabby, in Rive",
    (c) => {
      const { scroll } = S.frame(c);
      const cat = S.cat(c, "hero");
      scroll.append(
        S.head(
          "Meet the *little shadow.*",
          "Original vector cat · real Rive runtime",
        ),
        cat,
        S.btn(c, "Hello", () => cat.motion.act("hello"), "secondary"),
        S.btn(c, "Curious", () => cat.motion.act("curious"), "secondary"),
        S.btn(c, "Saved", () => cat.motion.act("saved"), "secondary"),
        S.caption(
          "Transparent ground. Same-art fallback. No sound, confetti or purchase reactions.",
        ),
      );
    },
    { flow: false },
  );
  S.define(
    "motion-companion",
    "motion",
    "Small reactions, then rest",
    (c) => {
      const { scroll } = S.frame(c);
      const cat = S.cat(c, "hero");
      scroll.append(
        S.head(
          "A blink. *A little hello.*",
          "Bounded reactions, with a quiet rest.",
        ),
        cat,
        S.btn(c, "Greet the cat", () => cat.motion.act("hello")),
        S.btn(
          c,
          "Show saved reaction",
          () => cat.motion.act("saved"),
          "secondary",
        ),
        S.caption(
          "Hello 2.4s · Curious 2.8s · Saved 2.2s. Rest on background, offscreen and reduced motion.",
        ),
      );
    },
    { flow: false },
  );
  S.define(
    "motion-press",
    "motion",
    "Firm, with a soft release",
    (c) => {
      const { scroll } = S.frame(c);
      scroll.append(
        S.head("A press you *can feel.*", "Only the touched control springs."),
        S.cat(c),
        S.btn(c, "Press and release", () =>
          S.toast(c, "0.97 scale · 1 px depth · 90 ms press"),
        ),
        S.card(
          "Content stays calm",
          "Pages use transform and opacity. Larger text scrolls. Reduced motion goes straight to the final state.",
        ),
      );
    },
    { flow: false },
  );
})();
