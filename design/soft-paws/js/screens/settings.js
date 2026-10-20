(() => {
  const S = SP,
    { h } = S;
  S.define("profile", "account", "A place for both of you", (c) => {
    const { scroll } = S.frame(c, { tab: "You" });
    scroll.append(
      S.head(
        "A place for *both of you.*",
        "Your cat, preferences and local data.",
      ),
      S.cat(c, "small"),
      S.list(
        S.row(c, S.name(c), "Profile, care notes and routines", "heart", () =>
          S.go(c, "cat-profile"),
        ),
        S.row(c, "Your cats", "Switch profiles or add another", "user", () =>
          S.go(c, "cat-switcher"),
        ),
        S.row(c, "Your account", "Optional for the local journal", "user", () =>
          S.go(c, "sign-in"),
        ),
        S.row(c, "Soft Paws Premium", "Your plan and access", "gem", () =>
          S.go(c, "account-plan"),
        ),
        S.row(
          c,
          "Settings & accessibility",
          "Make the app comfortable",
          "sliders-horizontal",
          () => S.go(c, "settings"),
        ),
        S.row(
          c,
          "Your local data",
          "Export and manage records",
          "archive",
          () => S.go(c, "data-settings"),
        ),
      ),
    );
  });
  S.define("cat-profile", "account", "All the familiar details", (c) => {
    const { scroll, body } = S.frame(c, { back: "profile" });
    scroll.append(
      S.head(
        S.name(c) + "’s *familiar details.*",
        "Everything here can change as you learn.",
      ),
      S.cat(c, "small"),
      h(
        "div.sp-summary",
        ...Object.entries({
          Breed: c.answers.breed || "Not recorded",
          Age: c.answers.age || "Not recorded",
          Lifestyle: c.answers.life || "Not recorded",
          Sex: c.answers.sex || "Not recorded",
          "Neuter status": c.answers.neutered || "Not recorded",
          Weight: c.answers.weight ? c.answers.weight + " kg" : "Not recorded",
        }).map(([k, v]) => h("div", h("small", k), h("strong", v))),
      ),
      S.section(c, "Care notes"),
      h("p", c.answers.careNotes || "No care notes yet."),
      S.caption(
        "Profile details are caregiver records, not a clinical assessment.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Edit profile", () => S.go(c, "profile-edit")),
    );
  });
  S.define("profile-edit", "account", "Keep their profile current", (c) => {
    const { scroll, body } = S.frame(c, { back: "cat-profile" });
    scroll.append(S.head("Still learning *about them.*"));
    const name = S.field(c, "Cat’s name", c.answers.name),
      breed = S.field(c, "Breed or mix", c.answers.breed),
      note = S.field(c, "Care notes", c.answers.careNotes || "", "textarea");
    scroll.append(
      name.el,
      breed.el,
      note.el,
      S.row(
        c,
        "Other profile details",
        "Age, weight, lifestyle and neuter status",
        "heart",
        () => S.go(c, "cat-details"),
      ),
    );
    const err = h("p.sp-formerror", { role: "alert" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Keep changes", () => {
        if (!name.input.value.trim()) {
          err.textContent = "Give your cat a name.";
          return;
        }
        Object.assign(c.answers, {
          name: name.input.value.trim(),
          breed: breed.input.value,
          careNotes: note.input.value,
        });
        S.go(c, "cat-profile");
      }),
    );
  });
  S.define("cat-switcher", "account", "Every cat, their own story", (c) => {
    const { scroll, body } = S.frame(c, { back: "profile" });
    scroll.append(
      S.head(
        "Every cat, *their own story.*",
        "Profiles keep their own records and AI choices.",
      ),
      S.card(
        S.name(c),
        h(
          "div",
          S.cat(c, "small"),
          S.caption("Current cat · first journal stays free"),
        ),
      ),
      S.row(
        c,
        "Add another cat",
        "Premium · the full setup, with independent details",
        "plus",
        () => S.go(c, "add-cat"),
      ),
      S.caption("Existing profiles and records remain accessible."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Back to " + S.name(c), () => S.go(c, "home")),
    );
  });
  S.define("add-cat", "account", "Room for another little shadow", (c) => {
    const { scroll, body } = S.frame(c, { back: "cat-switcher" });
    scroll.append(
      S.head("Another *little shadow?*", "Additional cat creation is Premium."),
      S.cat(c),
      S.card(
        "Their own beginning",
        "The full cat setup starts with blank details. A separate draft is kept until final confirmation.",
      ),
      S.caption(
        "No previous cat’s profile, AI consent or conversation is copied.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "View Premium access", () => S.go(c, "paywall")),
      S.btn(c, "Keep current journal", () => S.go(c, "home"), "quiet"),
    );
  });
  S.define("sign-in", "account", "For the extras, an account", (c) => {
    const { scroll, body } = S.frame(c, { back: "profile" });
    scroll.append(
      S.head(
        "For the extras, *an account.*",
        "Your journal works without signing in.",
      ),
      S.cat(c, "hero"),
      S.caption(
        "An account identifies you for AI and Premium access. It does not sync or back up your journal.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(
        c,
        "Continue with Apple",
        () =>
          S.toast(
            c,
            "Apple sign-in needs Soft Paws’ own native registration. No sign-in was started.",
          ),
        "secondary",
      ),
      S.btn(
        c,
        "Continue with Google",
        () =>
          S.toast(
            c,
            "Google sign-in needs Soft Paws’ own native registration. No sign-in was started.",
          ),
        "secondary",
      ),
      S.btn(
        c,
        "Continue with email",
        () => S.go(c, "email-sign-in"),
        "secondary",
      ),
      S.btn(c, "Keep using the journal", () => S.go(c, "home"), "quiet"),
    );
  });
  S.define("email-sign-in", "account", "Welcome back to Soft Paws", (c) => {
    const { scroll, body } = S.frame(c, { back: "sign-in" });
    scroll.append(
      S.head("Welcome back to *Soft Paws.*", "Email and password sign-in."),
    );
    const e = S.field(c, "Email", "", "email"),
      p = S.field(c, "Password", "", "password");
    e.input.autocomplete = "email";
    p.input.autocomplete = "current-password";
    scroll.append(
      e.el,
      p.el,
      S.link(c, "Forgot password?", () => S.go(c, "password-reset")),
      S.caption("Design preview. Credentials are neither saved nor sent."),
    );
    const err = h("p.sp-formerror", { role: "status" });
    scroll.append(err);
    S.actions(
      c,
      body,
      S.btn(c, "Sign in", () => {
        p.input.value = "";
        err.textContent =
          "Sign-in is unavailable in this board. Use the local journal.";
      }),
      S.btn(c, "Create account", () => S.go(c, "create-account"), "secondary"),
    );
  });
  S.define(
    "create-account",
    "account",
    "Make an account when you need one",
    (c) => {
      const { scroll, body } = S.frame(c, { back: "email-sign-in" });
      scroll.append(
        S.head(
          "An account, *when you need one.*",
          "Local care still needs no account.",
        ),
        S.field(c, "Email", "", "email").el,
        S.field(c, "Password", "", "password").el,
        S.caption(
          "Soft Paws’ terms and privacy documents must be final before real account creation. This design preview submits nothing.",
        ),
      );
      S.actions(
        c,
        body,
        S.btn(
          c,
          "Create account · unavailable",
          () =>
            S.toast(
              c,
              "No account was created. Soft Paws service registration is pending.",
            ),
          "secondary",
        ),
        S.btn(c, "Use the local journal", () => S.go(c, "home"), "quiet"),
      );
    },
  );
  S.define("password-reset", "account", "A way back in", (c) => {
    const { scroll, body } = S.frame(c, { back: "email-sign-in" });
    scroll.append(
      S.head("A way *back in.*", "Use the email for your account."),
      S.field(c, "Email", "", "email").el,
      S.caption("Preview only · no reset email will be sent."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Send reset email · preview", () =>
        S.toast(c, "No email was sent from this design board."),
      ),
      S.btn(c, "Back to sign in", () => S.go(c, "email-sign-in"), "quiet"),
    );
  });
  S.define("paywall", "account", "A little more room for care", (c) => {
    const { scroll, body } = S.frame(c, { back: "home" });
    scroll.classList.add("sp-paywall");
    scroll.append(
      S.head("A little *more care.*", "Your first cat’s journal stays free."),
      S.cat(c, "small"),
      S.caption("PREMIUM · DESIGN PREVIEW"),
      S.caption("Additional cats, AI, nearby vets, PDF & MP4."),
    );
    const plans = h("div");
    [
      ["Weekly", "$2.99", "per week"],
      ["Monthly", "$6.99", "per month"],
      ["Yearly", "$39.99", "per year"],
    ].forEach(([name, price, period]) => {
      const b = h(
        "button.sp-planrow",
        { type: "button", "aria-pressed": "false" },
        h(
          "span",
          name,
          h("small", "Billed " + period.replace("per ", "every ")),
        ),
        h("span.price", price),
        h("span.sp-pickcheck"),
      );
      c.on(b, "click", () => {
        c.answers.plan = name;
        plans.querySelectorAll("button").forEach((x) => {
          const on = x === b;
          x.classList.toggle("on", on);
          x.setAttribute("aria-pressed", String(on));
          x.querySelector(".sp-pickcheck").textContent = on ? "✓" : "";
        });
      });
      plans.append(b);
    });
    scroll.append(
      plans,
      S.caption("USD recurring prices · design preview. No trial is assumed."),
      S.link(c, "Restore purchases", () =>
        S.toast(
          c,
          "Store configuration is not connected. No entitlement was created.",
        ),
      ),
    );
    const buy = S.btn(c, "Purchases unavailable", () => {});
    buy.disabled = true;
    S.actions(
      c,
      body,
      buy,
      S.btn(
        c,
        "Keep using the free journal",
        () => S.go(c, "home"),
        "secondary",
      ),
    );
  });
  S.define("account-plan", "account", "Your plan, plainly", (c) => {
    const { scroll, body } = S.frame(c, { back: "profile" });
    scroll.append(
      S.head(
        "Your plan, *plainly.*",
        "No purchase is connected in this preview.",
      ),
      S.cat(c, "small"),
      S.card(
        "Free journal",
        h(
          "div",
          S.row(
            c,
            "One cat’s everyday care",
            "Logging, timeline, on-screen reports and raw CSV",
            "check",
          ),
          S.row(
            c,
            "Existing records and contacts",
            "Yours to keep using",
            "heart",
          ),
        ),
        "soft",
      ),
      S.row(
        c,
        "Explore Premium",
        "Full recurring prices before any purchase",
        "gem",
        () => S.go(c, "paywall"),
      ),
      S.row(
        c,
        "Manage a store subscription",
        "Only the platform can change store billing",
        "settings",
        () => S.go(c, "manage-subscription"),
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Back to the journal", () => S.go(c, "home")),
    );
  });
  S.define(
    "manage-subscription",
    "account",
    "Your store manages billing",
    (c) => {
      const { scroll, body } = S.frame(c, { back: "account-plan" });
      scroll.append(
        S.head(
          "Your store *manages billing.*",
          "No active subscription is assumed.",
        ),
        S.card(
          "When subscriptions are connected",
          "The app will open Apple’s subscription management or Google Play’s subscription centre. Cancellation happens there.",
        ),
        S.card(
          "Your journal stays",
          "Turning off renewal does not delete cats, records, drafts or saved veterinary contacts.",
        ),
        S.caption("No cancellation, refund or renewal date is fabricated."),
      );
      S.actions(
        c,
        body,
        S.btn(c, "Back to your plan", () => S.go(c, "account-plan")),
      );
    },
  );
  S.define("settings", "account", "Make yourself at home", (c) => {
    const { scroll } = S.frame(c, { back: "profile" });
    scroll.append(
      S.head("Make yourself *at home.*"),
      S.section(c, "Comfort"),
      S.list(
        S.row(
          c,
          "Appearance",
          "Light and dark are available in the board header",
          "sun",
          () => S.toast(c, "Use the board’s Light / Dark theme control."),
        ),
        S.row(c, "Larger text", "130% text preview", "type", () => {
          const u = new URL(location.href);
          u.searchParams.set("textScale", "1.3");
          location.href = u;
        }),
        S.row(
          c,
          "Reduced motion",
          "Use a same-art still and immediate transitions",
          "activity",
          () => {
            const u = new URL(location.href);
            u.searchParams.set("reducedMotion", "true");
            location.href = u;
          },
        ),
        S.row(
          c,
          "Soft interaction sounds",
          "Off until enabled · soft wood at 35%",
          "music",
          () => S.go(c, "sound-settings"),
        ),
      ),
      S.section(c, "Your choices"),
      S.list(
        S.row(
          c,
          "Notifications",
          "Off until requested in context",
          "bell",
          () => S.go(c, "reminder-setup"),
        ),
        S.row(
          c,
          "AI context & consent",
          "Current cat only · change your choice",
          "message-square-text",
          () => S.go(c, "ai-consent"),
        ),
        S.row(
          c,
          "Local data & exports",
          "Care stays on this device",
          "archive",
          () => S.go(c, "data-settings"),
        ),
      ),
    );
  });
  S.define("sound-settings", "account", "A quieter kind of tap", (c) => {
    const { scroll, body } = S.frame(c, { back: "settings" });
    scroll.append(
      S.head(
        "A quieter *kind of tap.*",
        "Soft wood · optional interaction sounds.",
      ),
    );
    const sw = h("span.sp-switch", { "aria-hidden": "true" }),
      r = S.row(
        c,
        "Interaction sounds",
        "Off by default",
        "music",
        () => {
          c.answers.sounds = !c.answers.sounds;
          sw.classList.toggle("on", c.answers.sounds);
          r.setAttribute("aria-checked", String(!!c.answers.sounds));
        },
        sw,
      );
    r.setAttribute("role", "switch");
    r.setAttribute("aria-checked", "false");
    scroll.append(S.list(r));
    const f = S.field(c, "Volume · 35%", "35", "range");
    f.input.min = "0";
    f.input.max = "100";
    c.on(
      f.input,
      "input",
      () =>
        (f.el.querySelector("label").textContent =
          "Volume · " + f.input.value + "%"),
    );
    scroll.append(
      f.el,
      S.card(
        "Quiet where it matters",
        "Typing, scrolling, loading and AI generation stay silent. Saves make a sound only after the local write succeeds.",
      ),
      S.caption(
        "The board does not play audio. Native playback respects silent mode.",
      ),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Back to settings", () => S.go(c, "settings")),
    );
  });
  S.define("data-settings", "account", "Your records, your choice", (c) => {
    const { scroll } = S.frame(c, { back: "profile" });
    scroll.append(
      S.head(
        "Your records, *your choice.*",
        "This device is where the journal lives.",
      ),
      S.card(
        "Local journal",
        "No cloud journal sync, household sharing or automatic photo upload.",
      ),
      S.list(
        S.row(
          c,
          "Export raw CSV",
          "Free · choose the cat and dates",
          "table",
          () => S.go(c, "export-options"),
        ),
        S.row(
          c,
          "Review private photos",
          "Selected local copies",
          "image",
          () => S.go(c, "photos"),
        ),
        S.row(
          c,
          "Delete a cat’s local data",
          "Choose deliberately · permanent in the app",
          "trash",
          () => S.go(c, "delete-cat"),
        ),
        S.row(
          c,
          "Account deletion",
          "Separate from your store subscription",
          "user",
          () => S.go(c, "delete-account"),
        ),
      ),
    );
  });
  S.define("delete-cat", "account", "A deliberate goodbye", (c) => {
    const { scroll, body } = S.frame(c, { back: "data-settings" });
    scroll.append(
      S.head(
        "Delete " + S.name(c) + "’s *local records?*",
        "Export what you want to keep first.",
      ),
      S.card(
        "What this affects",
        "This cat’s profile, care records, conversations and private attachments. Other cats keep their own data.",
        "danger",
      ),
      S.caption("Preview only. This action cannot reach native journals."),
    );
    S.actions(
      c,
      body,
      S.btn(c, "Keep everything", () => S.go(c, "data-settings")),
      S.btn(
        c,
        "Delete sample data only",
        () => {
          c.answers.records = [];
          c.answers.lastRecord = null;
          S.go(c, "empty");
        },
        "secondary",
      ),
    );
  });
  S.define(
    "delete-account",
    "account",
    "An account is separate from care",
    (c) => {
      const { scroll, body } = S.frame(c, { back: "data-settings" });
      scroll.append(
        S.head(
          "Your account and *your care.*",
          "Account deletion needs a separate confirmation.",
        ),
        S.card(
          "Store billing is separate",
          "Deleting an account does not cancel an App Store or Google Play subscription.",
        ),
        S.card(
          "Local records need their own choice",
          "Do not silently delete the journal when an account is removed.",
        ),
        S.caption("No live account exists in this design preview."),
      );
      S.actions(
        c,
        body,
        S.btn(
          c,
          "Manage store subscription",
          () => S.go(c, "manage-subscription"),
          "secondary",
        ),
        S.btn(c, "Back to local data", () => S.go(c, "data-settings")),
      );
    },
  );
  S.define(
    "future-features",
    "account",
    "Some things take a little longer",
    (c) => {
      const { scroll, body } = S.frame(c, { back: "profile" });
      scroll.append(
        S.head(
          "A little *further ahead.*",
          "These Premium ideas are not available.",
        ),
        S.cat(c),
        S.list(
          S.row(
            c,
            "Train your cat",
            "Coming soon · no training programme is available",
            "graduation-cap",
          ),
          S.row(
            c,
            "Pet food scanning & recalls",
            "Coming soon · no monitoring or scanning service",
            "scan-line",
          ),
        ),
        S.caption(
          "These are future concepts, not active services or reasons to buy today.",
        ),
      );
      S.actions(
        c,
        body,
        S.btn(c, "Back to your journal", () => S.go(c, "home")),
      );
    },
  );
  S.seq("account", [
    "profile",
    "cat-profile",
    "cat-switcher",
    "add-cat",
    "sign-in",
    "paywall",
    "account-plan",
    "settings",
    "data-settings",
  ]);
})();
