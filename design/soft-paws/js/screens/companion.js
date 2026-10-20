(() => {
  const S = SP,
    { h } = S;
  S.define("photos", "memories", "Their ordinary, lovely days", (c) => {
    const { scroll } = S.frame(c, { tab: "Memories" });
    scroll.append(
      S.head(
        "Ordinary, *lovely days.*",
        "A private photo journal for " + S.name(c),
      ),
      S.photo(true),
      S.section(c, "The window supervisor", "Open", () =>
        S.go(c, "photo-detail"),
      ),
      S.caption("20 October · illustration standing in for a private photo"),
      S.list(
        S.row(
          c,
          "Add a photo",
          "Native picker · stays on your device",
          "camera",
          () => S.go(c, "photo-picker"),
        ),
        S.row(
          c,
          "October’s Memory Book",
          "Read on this phone for free",
          "notebook-pen",
          () => S.go(c, "memory-book"),
        ),
        S.row(
          c,
          "Make a highlight",
          "Photo editing and preview stay free",
          "play",
          () => S.go(c, "video-editor"),
        ),
        S.row(
          c,
          "Everyday expenses",
          "Keep costs and receipts together",
          "shopping-bag",
          () => S.go(c, "expenses"),
        ),
      ),
    );
  });
  S.define("photo-picker", "memories", "One moment at a time", (c) => {
    const { scroll, body } = S.frame(c, { back: "photos" });
    scroll.append(
      S.head(
        "One moment *at a time.*",
        "Choose only the photos you want to keep.",
      ),
      h("div.sp-iconbig", S.icon("image", 52)),
      S.card(
        "The platform’s own picker",
        "In the app, the native photo picker opens here. This board does not request library access.",
      ),
      S.caption(
        "Selected photos become private local copies. No automatic photo upload.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Use sample illustration", () => {
        c.answers.samplePhoto = true;
        S.go(c, "photo-detail");
      }),
      S.btn(c, "Cancel selection", () => S.go(c, "photos"), "quiet"),
    );
  });
  S.define("photo-detail", "memories", "A moment with its own story", (c) => {
    const { scroll, body } = S.frame(c, { back: "photos" });
    scroll.append(
      S.photo(true),
      S.section(c, "The window supervisor"),
      S.caption("20 October 2026 · " + S.name(c)),
      S.field(
        c,
        "Your caption",
        c.answers.caption || "All afternoon, keeping an eye on the birds.",
        "textarea",
        "caption",
      ).el,
      S.check(c, "Include in this month’s Memory Book", "memoryPhoto", false)
        .el,
      S.caption("Sample illustration · no personal photo was accessed."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Keep caption", () => {
        S.toast(c, "Example caption kept in this preview.");
      }),
      S.btn(c, "Back to photos", () => S.go(c, "photos"), "quiet"),
    );
  });
  S.define("memory-book", "memories", "October, in small moments", (c) => {
    const { scroll, body } = S.frame(c, { back: "photos" });
    scroll.append(
      S.head("October, *in small moments.*", S.name(c) + "’s Memory Book"),
      S.photo(),
      S.card(
        "The window supervisor",
        c.answers.caption || "All afternoon, keeping an eye on the birds.",
      ),
      S.card(
        "Your chosen highlights",
        "Only moments you explicitly select appear here.",
      ),
      S.caption("Mobile reading stays free. Sample illustration and caption."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "PDF, print & sharing", () => S.go(c, "paywall")),
      S.btn(c, "Choose highlights", () => S.go(c, "photo-detail"), "secondary"),
    );
  });
  S.define("video-editor", "memories", "A few moments, together", (c) => {
    const { scroll, body } = S.frame(c, { back: "photos" });
    scroll.append(
      S.head(
        "A few moments, *together.*",
        "Editing and on-phone preview stay free.",
      ),
      S.photo(),
      h(
        "div.sp-chiprow",
        ...["Window watch", "A little play", "Afternoon nap"].map((t) =>
          h("span.sp-tag", t),
        ),
      ),
      S.section(c, "Your highlight"),
      S.field(
        c,
        "Title",
        c.answers.videoTitle || "Miso’s October",
        "text",
        "videoTitle",
      ).el,
      S.row(c, "Clip length", "3 seconds per photo · 9 seconds total", "clock"),
      S.row(c, "Sound", "Off", "music"),
      S.caption("Example storyboard · no encoder has run."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Play preview", () => S.go(c, "video-preview")),
      S.btn(c, "Export MP4 · Premium", () => S.go(c, "paywall"), "secondary"),
    );
  });
  S.define("video-preview", "memories", "A memory in motion", (c) => {
    const { scroll, body } = S.frame(c, { back: "video-editor" });
    scroll.append(
      S.head(
        c.answers.videoTitle || "Miso’s *October.*",
        "Example preview · 3 illustrated moments",
      ),
      S.photo(true),
      S.caption("00:00 / 00:09 · silent example"),
    );
    const b = S.btn(c, "Play example", () => {
      b.textContent = "Playing example";
      let i = 0;
      const labels = ["Window watch", "A little play", "Afternoon nap"];
      const tick = () => {
        if (c.dead) return;
        const label = scroll.querySelector(".sp-photo span");
        label.textContent = labels[i];
        i++;
        if (i < 3) c.at(3000, tick);
        else c.at(3000, () => (b.textContent = "Replay example"));
      };
      tick();
    });
    scroll.append(b);
    S.actions(
      c,
      body,
      S.btn(c, "Back to edit", () => S.go(c, "video-editor")),
      S.btn(c, "Export MP4 · Premium", () => S.go(c, "paywall"), "secondary"),
    );
  });
  S.define("expenses", "memories", "The costs of a little life", (c) => {
    const { scroll, body } = S.frame(c, { back: "photos" });
    scroll.append(
      S.head(
        "The costs of *a little life.*",
        "October 2026 · example expenses",
      ),
      h(
        "div.sp-number",
        "$" + (43.75 + (Number(c.answers.expense?.amount) || 0)).toFixed(2),
        h("small", " USD"),
      ),
      S.caption("Each currency is totalled separately."),
      S.list(
        S.row(c, "Food & treats", "$28.40 · 3 October", "shopping-bag", () =>
          S.go(c, "expense-detail"),
        ),
        S.row(c, "Litter", "$15.35 · 14 October", "archive", () =>
          S.go(c, "expense-detail"),
        ),
        c.answers.expense
          ? S.row(
              c,
              c.answers.expense.title,
              "$" + c.answers.expense.amount + " USD",
              "shopping-bag",
              () => S.go(c, "expense-detail"),
            )
          : null,
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Add an expense", () => S.go(c, "expense-form")),
    );
  });
  S.define("expense-form", "memories", "A cost with its context", (c) => {
    const { scroll, body } = S.frame(c, { back: "expenses" });
    scroll.append(S.head("A cost, *with context.*"));
    const t = S.field(c, "What was it for?"),
      a = S.field(c, "Amount (USD)", "", "number");
    a.input.min = ".01";
    a.input.step = ".01";
    scroll.append(
      t.el,
      a.el,
      S.picks(
        c,
        [
          ["Food & treats", "utensils"],
          ["Litter", "archive"],
          ["Vet & care", "heart"],
          ["Other", "shopping-bag"],
        ],
        "expenseCategory",
      ),
      S.row(c, "Attach receipt", "Optional · local photo", "camera", () =>
        S.go(c, "photo-picker"),
      ),
    );
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Keep expense", () => {
        if (
          !t.input.value.trim() ||
          !/^\d+(\.\d{1,2})?$/.test(a.input.value) ||
          Number(a.input.value) <= 0
        ) {
          err.textContent =
            "Add a title and an amount with up to two decimal places.";
          return;
        }
        c.answers.expense = {
          title: t.input.value,
          amount: Number(a.input.value).toFixed(2),
        };
        S.go(c, "expenses");
      }),
    );
  });
  S.define("expense-detail", "memories", "An expense, kept clearly", (c) => {
    const { scroll, body } = S.frame(c, { back: "expenses" });
    scroll.append(
      S.head(
        c.answers.expense?.title || "Food & *treats.*",
        "For " + S.name(c),
      ),
      h(
        "div.sp-number",
        "$" + (c.answers.expense?.amount || "28.40"),
        h("small", " USD"),
      ),
      S.card(
        "Expense details",
        "3 October 2026 · food and treats · sample record",
      ),
      S.caption("No receipt attached."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Edit expense", () => S.go(c, "expense-form")),
      S.btn(c, "Back to expenses", () => S.go(c, "expenses"), "quiet"),
    );
  });
  S.seq("memories", [
    "photos",
    "photo-picker",
    "photo-detail",
    "memory-book",
    "video-editor",
    "video-preview",
    "expenses",
    "expense-form",
  ]);
  S.define("ai-entry", "ai", "A question about your cat", (c) => {
    const { scroll, body } = S.frame(c, { back: "home" });
    scroll.append(
      S.head("A question about *" + S.name(c) + "?*", "Soft Paws AI · Premium"),
      S.cat(c),
      S.list(
        S.row(
          c,
          "General cat-care education",
          "Answers organised into readable cards",
          "message-square-text",
        ),
        S.row(
          c,
          "Your cat’s recent context",
          "Profile + the past seven calendar days",
          "notebook-pen",
        ),
      ),
      S.caption(
        "An account, explicit cloud consent and configured service are needed. The journal works without them.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "See how context works", () => S.go(c, "ai-consent")),
      S.btn(c, "View Premium", () => S.go(c, "paywall"), "secondary"),
    );
  });
  S.define("ai-consent", "ai", "You choose the context", (c) => {
    const { scroll, body } = S.frame(c, { back: "ai-entry" });
    scroll.append(
      S.head(
        "You choose *the context.*",
        "Before a question goes to Soft Paws AI.",
      ),
      S.card(
        "What is shared",
        h(
          "div",
          S.row(
            c,
            "The current cat’s profile",
            "Name and saved profile details",
            "heart",
          ),
          S.row(
            c,
            "The past seven calendar days",
            "Bounded recent observations and exact counts",
            "calendar",
          ),
        ),
        "soft",
      ),
      S.card(
        "What stays out",
        "Other cats, older journal entries and photos are not automatically included.",
      ),
      S.caption(
        "Consent is specific to this cat and scope. You can turn it off later.",
      ),
    );
    const consent = S.check(
      c,
      "I agree to share this cat’s profile and past seven calendar days with the AI service for my questions.",
      "weeklyConsent",
      false,
      (on) => b.setAttribute("aria-disabled", String(!on)),
    );
    scroll.append(consent.el);
    const b = S.btn(c, "See example chat", () => {
      if (consent.input.checked) S.go(c, "chat");
    });
    b.setAttribute("aria-disabled", "true");
    S.actions(
      c,
      body,
      b,
      S.btn(c, "Keep using the journal", () => S.go(c, "home"), "quiet"),
    );
  });
  S.define("chat", "ai", "Ask about Miso", (c) => {
    const { scroll, body } = S.frame(c, { back: "home" });
    scroll.append(
      S.head(
        "Ask about *" + S.name(c) + ".*",
        "Soft Paws AI · example conversation",
      ),
      S.caption("Profile + 14–20 October · example context"),
      h(
        "div.sp-chatuser",
        "What should I note when Miso leaves some breakfast?",
      ),
      h(
        "article.sp-chatanswer",
        h("div.sp-meta", S.icon("sparkles", 17), "EXAMPLE ANSWER"),
        h("h2", "Keep the observation specific."),
        h(
          "p",
          "Record what you offered, roughly how much was left, and when. Add anything else you noticed in your own words.",
        ),
        h(
          "p",
          "Your saved observations can help you describe the change to your vet. They do not establish a cause.",
        ),
        S.caption("Illustrative copy. No live AI request has been made."),
      ),
      S.card(
        "From the example journal",
        h(
          "div",
          S.row(
            c,
            "Breakfast, mostly eaten",
            "Today · 08:10 · 65 g offered",
            "utensils",
            () => S.go(c, "chat-source"),
          ),
          S.row(
            c,
            "16 meal observations",
            "14–20 October · 7 calendar days",
            "calendar",
            () => S.go(c, "chat-source"),
          ),
        ),
      ),
      S.row(c, "Contact your vet", "Saved contacts · free", "phone", () =>
        S.go(c, "contacts"),
      ),
      S.caption(
        "Future contextual products · unavailable. No live products or links.",
      ),
    );
    const input = h("input", {
        "aria-label": "Question about your cat",
        placeholder: "Ask about " + S.name(c) + "…",
      }),
      send = h(
        "button.send",
        { type: "button", "aria-label": "Send example question" },
        S.icon("arrow-up"),
      );
    c.on(send, "click", () => {
      if (input.value.trim()) {
        c.answers.question = input.value;
        S.go(c, "chat-unavailable");
      }
    });
    body.append(
      h(
        "div.sp-composer",
        S.iconbtn(c, "plus", "Attach a photo", () => S.go(c, "photo-picker")),
        input,
        send,
      ),
    );
  });
  S.define("chat-source", "ai", "Where that detail came from", (c) => {
    const { scroll, body } = S.frame(c, { back: "chat" });
    scroll.append(
      S.head(
        "Where that *detail came from.*",
        "Recorded facts, separate from the answer.",
      ),
      S.card(
        "Breakfast, mostly eaten",
        h(
          "div",
          S.caption(S.name(c) + " · 20 October · 08:10"),
          h("p", "65 g wet food offered. Some food remained."),
          S.caption("Original caregiver observation · example"),
        ),
      ),
      S.card(
        "Scope of the example",
        "Current cat only. Seven calendar days. Exact counts come from saved records, not model guesses.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Open journal record", () => S.go(c, "record")),
    );
  });
  S.define("chat-unavailable", "ai", "Your question can wait here", (c) => {
    const { scroll, body } = S.frame(c, { back: "chat" });
    scroll.append(
      S.head(
        "Your question can *wait here.*",
        "The AI service is not connected in this preview.",
      ),
      S.card(
        "Your question",
        c.answers.question || "What should I note about Miso’s breakfast?",
      ),
      S.caption(
        "No request was sent. Your local journal and saved contacts remain available.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Back to chat", () => S.go(c, "chat")),
      S.btn(c, "Saved contacts · free", () => S.go(c, "contacts"), "secondary"),
    );
  });
  S.seq("ai", [
    "ai-entry",
    "ai-consent",
    "chat",
    "chat-source",
    "chat-unavailable",
  ]);
})();
