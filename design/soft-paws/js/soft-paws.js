/* Soft Paws board state is synthetic and in memory. No native data or services. */
(() => {
  "use strict";
  const F = window.F,
    h = F.h,
    S = (window.SP = { h, F });
  const params = new URLSearchParams(location.search),
    scale = Number(params.get("textScale") || 1);
  document.documentElement.style.setProperty(
    "--text-scale",
    Math.max(1, Math.min(1.6, scale)),
  );
  if (params.has("reducedMotion"))
    F.setReduced(params.get("reducedMotion") === "true");
  F.T.press = { scale: 0.97, depth: 1, inMs: 90, response: 0.3, damping: 0.86 };
  const phone = (params.get("phone") || "390x844").match(
    /^(375|390|430)x(667|844|932)$/,
  );
  F.PHONE = {
    w: phone ? Number(phone[1]) : 390,
    h: phone ? Number(phone[2]) : 844,
  };
  document.documentElement.style.setProperty("--phone-w", F.PHONE.w + "px");
  document.documentElement.style.setProperty("--phone-h", F.PHONE.h + "px");
  S.name = (c) => c.answers.name || "your cat";
  S.go = (c, to) => {
    if (c.mode === "flow") c.next({ to });
    else {
      history.replaceState(null, "", "#play-" + to);
      F.board.openPlayer(to);
    }
  };
  S.icon = (n, size = 21) => F.icon(n, { size });
  S.tone = (icon) => ({ "data-tone": SP_COLOR_ROLES.icons[icon] || "mint" });
  S.caption = (text, cls = "") =>
    h("p.sp-caption" + (cls ? "." + cls : ""), text);
  S.btn = (c, label, action, kind = "") => {
    const b = h(
      "button.sp-btn" + (kind ? "." + kind : ""),
      { type: "button" },
      label,
    );
    F.press(c, b, {
      scale: 0.97,
      onTap: () => {
        if (b.getAttribute("aria-disabled") !== "true") action?.();
      },
    });
    return b;
  };
  S.link = (c, label, action) => {
    const b = h("button.sp-link", { type: "button" }, label);
    c.on(b, "click", action);
    return b;
  };
  S.iconbtn = (c, icon, label, action) => {
    const b = h(
      "button.sp-iconbtn",
      { type: "button", "aria-label": label },
      S.icon(icon),
    );
    c.on(b, "click", action);
    return b;
  };
  S.head = (title, sub, kicker) =>
    h(
      "header.sp-head",
      kicker ? h("p.sp-kicker", kicker) : null,
      h("h1", F.rich(title)),
      sub ? h("p", sub) : null,
    );
  S.card = (title, body, cls = "") =>
    h(
      "section.sp-card" + (cls ? "." + cls : ""),
      ["butter", "lilac", "mint", "rose", "sky", "peach", "periwinkle"].includes(cls) ? { "data-tone": cls } : {},
      title ? h("h2", title) : null,
      typeof body === "string" ? h("p", body) : body,
    );
  S.section = (c, title, label, action) =>
    h(
      "div.sp-section",
      h("h2", title),
      label ? S.link(c, label, action) : null,
    );
  S.row = (c, title, sub, icon, action, tail) => {
    const e = h(
      action ? "button.sp-row" : "div.sp-row",
      action ? { type: "button" } : {},
      icon ? h("span.sp-mark", S.tone(icon), S.icon(icon)) : null,
      h("span.sp-copy", h("strong", title), sub ? h("small", sub) : null),
      tail || (action ? S.icon("chevron-right", 17) : null),
    );
    if (action) c.on(e, "click", action);
    return e;
  };
  S.list = (...rows) => h("div.sp-list", rows);
  S.actions = (c, body, ...items) => {
    const a = h("div.sp-actions", items);
    body.append(a);
    return a;
  };
  S.frame = (c, { tab, title = "Soft Paws", back, progress } = {}) => {
    const { body } = F.frame(c, { bodyCls: "sp-body" });
    if (scale > 1) c.root.classList.add("text-large");
    const scroll = h("main.sp-scroll");
    body.append(scroll);
    const top = h(
      "div.sp-top",
      back
        ? S.iconbtn(c, "chevron-left", "Back", () => S.go(c, back))
        : h("span.sp-wordmark", title),
      typeof progress === "number"
        ? h(
            "div.sp-progress",
            h("i", { style: { width: progress * 100 + "%" } }),
          )
        : h(
            "span.sp-kicker",
            tab === "Today"
              ? "TUE, 20 OCT"
              : title === "Soft Paws"
                ? "CAT CARE"
                : "CAT JOURNAL",
          ),
      back
        ? null
        : S.iconbtn(c, "sliders-horizontal", "Settings", () =>
            S.go(c, "settings"),
          ),
    );
    scroll.append(top);
    if (tab) {
      const nav = h("nav.sp-tabs", { "aria-label": "Main navigation" });
      [
        ["Today", "house", "home"],
        ["Journal", "notebook-pen", "timeline"],
        ["Care", "heart", "health"],
        ["Memories", "image", "photos"],
        ["You", "user", "profile"],
      ].forEach(([label, icon, id]) => {
        const b = h(
          "button.sp-tab" + (label === tab ? ".active" : ""),
          { type: "button", "aria-current": label === tab ? "page" : null },
          S.icon(icon, 20),
          h("span", label),
        );
        c.on(b, "click", () => S.go(c, id));
        nav.append(b);
      });
      body.append(nav);
    }
    return { body, scroll };
  };
  S.define = (id, section, name, build, more = {}) =>
    F.def({
      id,
      section,
      name,
      flow: true,
      group: id,
      enter: "step",
      intent:
        "Soft Paws proposal. Synthetic examples; native implementation follows board review. " +
        name,
      build,
      ...more,
    });
  S.seq = (section, ids) =>
    F.def({
      id: "seq-" + section,
      section,
      name: "Play this chapter",
      seq: ids,
      intent: "The section in order, with the same example cat.",
    });
  S.field = (c, label, value = "", type = "text", key) => {
    const id = c.screen.id + "-" + label.replace(/\W/g, "");
    const input = h(type === "textarea" ? "textarea" : "input", {
      id,
      type: type === "textarea" ? null : type,
      autocomplete: "off",
    });
    input.value = value;
    const e = h("div.sp-field", h("label", { for: id }, label), input);
    if (key) c.on(input, "input", () => (c.answers[key] = input.value));
    return { el: e, input };
  };
  S.check = (c, label, key, checked = false, onchange) => {
    const id = c.screen.id + "-" + key,
      input = h("input", { type: "checkbox", id });
    input.checked = checked;
    const e = h("div.sp-checkrow", input, h("label", { for: id }, label));
    c.on(input, "change", () => {
      c.answers[key] = input.checked;
      onchange?.(input.checked);
    });
    return { el: e, input };
  };
  S.toast = (c, text) => {
    c.root.querySelector(".sp-toast")?.remove();
    const e = h("div.sp-toast", { role: "status" }, text);
    c.root.append(e);
    c.at(6000, () => e.remove());
  };
  S.picks = (c, options, key, { multi = false, tiles = false, to } = {}) => {
    const wrap = h(tiles ? "div.sp-grid2" : "div.sp-list");
    const update = () =>
      [...wrap.children].forEach((b) => {
        const on = multi
          ? (c.answers[key] || []).includes(b.dataset.value)
          : c.answers[key] === b.dataset.value;
        b.classList.toggle(tiles ? "on" : "picked", on);
        b.setAttribute("aria-pressed", String(on));
        const check = b.querySelector(".sp-pickcheck");
        check.textContent = on ? "✓" : "";
      });
    options.forEach(([label, icon, sub]) => {
      const b = tiles
        ? h(
            "button.sp-choice",
            { type: "button", ...S.tone(icon) },
            S.icon(icon || "circle"),
            h("strong", label),
            h("span.sp-pickcheck"),
          )
        : S.row(
            c,
            label,
            sub,
            icon || "circle",
            () => {},
            h("span.sp-pickcheck"),
          );
      b.dataset.value = label;
      c.on(b, "click", () => {
        if (multi) {
          const a = c.answers[key] || [];
          c.answers[key] = a.includes(label)
            ? a.filter((x) => x !== label)
            : [...a, label];
        } else c.answers[key] = label;
        update();
        if (!multi && to) c.at(340, () => S.go(c, to));
      });
      wrap.append(b);
    });
    update();
    return wrap;
  };
  S.photo = (tall = false) =>
    h(
      "div.sp-photo" + (tall ? ".tall" : ""),
      h("img", {
        src: "assets/cat/companion.svg",
        alt: "Original tabby illustration used as a sample photo placeholder",
      }),
      h("span", "Illustration · sample photo"),
    );
  S.week = (c, action) => {
    const e = h("div.sp-week");
    ["W 14", "T 15", "F 16", "S 17", "S 18", "M 19", "T 20"].forEach((d, i) => {
      const [day, n] = d.split(" ");
      const b = h(
        "button.sp-day" + (i === 6 ? ".active" : ""),
        {
          type: "button",
          "aria-label": `October ${n}, 2026`,
          "aria-pressed": String(i === 6),
        },
        day,
        h("strong", n),
      );
      c.on(b, "click", () => {
        e.querySelectorAll("button").forEach((x) => {
          x.classList.remove("active");
          x.setAttribute("aria-pressed", "false");
        });
        b.classList.add("active");
        b.setAttribute("aria-pressed", "true");
        action?.(Number(n));
      });
      e.append(b);
    });
    return e;
  };
  S.events = (c, items) => {
    const list = h("div");
    items.forEach(([time, title, sub, icon]) =>
      list.append(
        h(
          "div.sp-event",
          h("time", time),
          h("span.sp-mark", S.tone(icon || "notebook-pen"), S.icon(icon || "notebook-pen", 18)),
          h(
            "button",
            {
              type: "button",
              on: {
                click: () => {
                  c.answers.lastRecord = {
                    title,
                    choice: sub,
                    amount: "",
                    notes: sub,
                    icon,
                  };
                  S.go(c, "record");
                },
              },
            },
            h("strong", title),
            h("p", sub),
          ),
        ),
      ),
    );
    return list;
  };
  S.exampleEvents = [
    ["08:10", "Breakfast, mostly eaten", "Wet food · 65 g offered", "utensils"],
    [
      "08:35",
      "A litter check",
      "Urine observed · no amount measured",
      "archive",
    ],
    ["09:05", "The feather won", "Play · 12 min · interested", "sparkles"],
  ];
  S.bars = (values, labels) =>
    h(
      "div.sp-bars",
      {
        role: "img",
        "aria-label": values.map((v, i) => `${labels[i]}: ${v}`).join(", "),
      },
      values.map((v, i) =>
        h(
          "div.sp-bar",
          h("b", String(v)),
          h("i", { style: { height: Math.max(2, v * 15) + "px" } }),
          labels[i],
        ),
      ),
    );
  let runtime;
  S.cat = (c, cls = "") => {
    const canvas = h("canvas", { "aria-hidden": "true" }),
      e = h(
        "button.sp-cat" + (cls ? "." + cls : ""),
        {
          type: "button",
          "aria-label": "Say hello to the Soft Paws cat",
          "data-rive": "still",
        },
        h("img", {
          src: "assets/cat/companion.svg",
          alt: "",
          "aria-hidden": "true",
        }),
        canvas,
      );
    let p,
      visible = false,
      dead = false,
      ready = false,
      loading = false,
      timer,
      launch,
      paused = false;
    const states = [];
    const allowed = () =>
      !dead &&
      !c.dead &&
      visible &&
      !paused &&
      !document.hidden &&
      !F.reduced();
    const rest = () => {
      clearTimeout(timer);
      clearTimeout(launch);
      p?.pause();
      e.dataset.playing = "false";
    };
    const act = (name = "hello") => {
      if (!ready || !allowed()) return;
      rest();
      e.classList.add("live");
      p.play();
      p.viewModelInstance?.trigger("rest")?.trigger();
      launch = setTimeout(() => {
        if (allowed()) p.viewModelInstance?.trigger(name)?.trigger();
      }, 50);
      e.dataset.playing = "true";
      e.dataset.action = name;
      timer = setTimeout(
        () => {
          p?.viewModelInstance?.trigger("rest")?.trigger();
          launch = setTimeout(() => {
            if (!allowed()) {
              rest();
              return;
            }
            p?.play();
            e.dataset.playing = "true";
            e.dataset.action = "idle";
          }, 230);
        },
        name === "curious" ? 2900 : 2500,
      );
    };
    const sync = async () => {
      e.disabled = F.reduced() || e.dataset.rive === "fallback";
      e.setAttribute(
        "aria-label",
        e.disabled
          ? "Soft Paws cat illustration, still pose"
          : "Say hello to the Soft Paws cat",
      );
      if (!allowed()) {
        rest();
        e.classList.remove("live");
        return;
      }
      if (ready) {
        p.play();
        e.classList.add("live");
        e.dataset.playing = "true";
        return;
      }
      if (loading) return;
      loading = true;
      try {
        runtime ||= (async () => {
          const r = await fetch("assets/vendor/rive.wasm");
          if (!r.ok) throw Error("No Rive WASM");
          rive.RuntimeLoader.setWasmBinary(await r.arrayBuffer());
          rive.RuntimeLoader.setWasmFallbackUrl(null);
        })();
        await runtime;
        if (dead || c.dead) return;
        p = new rive.Rive({
          src: "assets/cat/soft-paws-cat.riv",
          canvas,
          artboard: "Soft Paws Cat",
          stateMachine: "Cat Companion",
          autoBind: true,
          autoplay: false,
          shouldDisableRiveListeners: true,
          onLoad() {
            if (dead) {
              p?.cleanup();
              return;
            }
            ready = true;
            e.dataset.rive = "ready";
            p.resizeDrawingSurfaceToCanvas();
            if (allowed()) act();
          },
          onLoadError() {
            e.dataset.rive = "fallback";
            rest();
            e.classList.remove("live");
          },
        });
      } catch {
        e.dataset.rive = "fallback";
        rest();
        e.classList.remove("live");
      }
    };
    const io = new IntersectionObserver(
      (x) => {
        visible = x[0].isIntersecting;
        sync();
      },
      { threshold: 0.15 },
    );
    io.observe(e);
    const ro = new ResizeObserver(() => {
      if (ready && !dead) p.resizeDrawingSurfaceToCanvas();
    });
    ro.observe(e);
    c.on(e, "click", () => act("curious"));
    c.on(document, "visibilitychange", sync);
    c.on(matchMedia("(prefers-reduced-motion: reduce)"), "change", sync);
    const oldDispose = c.dispose.bind(c),
      oldPause = c.pause.bind(c),
      oldResume = c.resume.bind(c);
    c.pause = () => {
      paused = true;
      rest();
      oldPause();
    };
    c.resume = () => {
      paused = false;
      oldResume();
      sync();
    };
    c.dispose = () => {
      dead = true;
      rest();
      io.disconnect();
      ro.disconnect();
      p?.cleanup();
      p = null;
      oldDispose();
    };
    e.motion = {
      act,
      rest,
      states,
      get ready() {
        return ready;
      },
      get player() {
        return p;
      },
    };
    return e;
  };
})();
