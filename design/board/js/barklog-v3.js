/* 2026-10-15 · v3 "day line" pass. Board-only proposal layered over js/barklog.js.
 * barklog.js stays the approved source read by tools/design_tokens.py; this file only
 * replaces how shared parts look and move on the board. Transform, opacity, blur and clip only. */
(() => {
  'use strict';
  const F = window.F, B = window.B, h = F.h, M = window.BARK_MOTION;
  const V = window.BARK_V3 = {
    flightMs: 640, flightLift: 46,
    land: { response: 0.38, damping: 0.62 },   // a mark landing: bubbly, it is something the person made
    tab: { response: 0.42, damping: 0.78 },    // the tab pill travelling
    revealMs: 760, now: '18:24', from: 6, to: 24,
  };
  const dogName = ctx => (ctx && ctx.answers && ctx.answers.dog) || 'Bruno';
  const mins = t => { const [a, b] = String(t).split(':').map(Number); return a * 60 + (b || 0); };
  const pct = (t, from = V.from, to = V.to) => F.clamp((mins(t) / 60 - from) / (to - from), 0, 1) * 100;
  V.mins = mins; V.pct = pct;

  /** Box of `el` in the phone's own points, measured on screen so scrolling and board scale never matter. */
  B.rel = (el, root) => {
    const r = el.getBoundingClientRect(), R = root.getBoundingClientRect(), k = R.width / (root.offsetWidth || R.width || 1) || 1;
    const x = (r.left - R.left) / k, y = (r.top - R.top) / k, w = r.width / k, hh = r.height / k;
    return { x, y, w, h: hh, cx: x + w / 2, cy: y + hh / 2 };
  };

  B.paint = (el, key) => { ['bg', 'line', 'ink', 'dot'].forEach(part => el.style.setProperty('--event-' + part, `var(--${key}-${part})`)); return el; };
  B.go = (ctx, to, via) => ctx.mode === 'flow' ? ctx.next({ to, via }) : F.board.openPlayer(to);

  // ------------------------------------------------------------------ words

  /** Accent only where a screen asks for it: B.heading('*Bruno’s* day'). No automatic accent word. */
  B.heading = (title, sub, o = {}) => h('div.bl-tight.bl-heading' + (o.display ? '.is-display' : ''),
    h('h1', o.shared ? { 'data-shared': o.shared } : {}, F.rich(title)), sub ? h('p.bl-sub', sub) : null);

  /** The top of a screen: the dog this journal is about, and Safety or the local promise. */
  B.dogChip = (ctx, o = {}) => {
    const name = dogName(ctx);
    const inner = [h('span.v3-dog-chip-paw', B.paw(14)), h('span.v3-dog-chip-name', name), F.icon('chevron-down', { size: 15 })];
    if (!ctx || o.static) return h('span.v3-dog-chip.is-static', ...inner.slice(0, 2));
    return B.press(ctx, h('button.v3-dog-chip', { type: 'button', 'aria-label': `Switch dog. ${name} selected.` }, ...inner), () => B.go(ctx, 'dog-switcher'), 0.86);
  };
  B.brand = (ctx, o = {}) => h('div.bl-brand.v3-top',
    B.dogChip(ctx),
    o.safety && ctx
      ? B.press(ctx, h('button.bl-brand-action', { type: 'button', 'aria-label': 'Open offline Safety Center' }, F.icon('shield', { size: 15 }), 'Safety'), () => B.go(ctx, 'safety-home'), 0.86, true)
      : h('span.bl-local', F.icon('shield-check', { size: 14 }), 'On this device'));

  // ------------------------------------------------------------------ rows: time first, like a journal

  B.row = (ctx, event, clickable = true) => {
    const t = B.type(event.type);
    const icon = B.paint(h('span.bl-event-icon', F.icon(t.icon, { size: 19 })), t.key);
    const el = h(clickable ? 'button.bl-row.v3-row' : 'div.bl-row.v3-row',
      clickable ? { type: 'button', 'aria-label': `${t.label}, ${event.time}. ${event.note}. View record.` } : {},
      h('span.v3-row-time', event.time), icon,
      h('div.bl-row-content', h('div.bl-row-title', t.label), h('p.bl-row-note', event.note)),
      clickable ? F.icon('chevron-right', { size: 16 }) : null);
    el.icon = icon;
    if (!clickable) return el;
    return B.press(ctx, el, () => {
      ctx.answers.record = { ...event };
      ctx.root.querySelectorAll('[data-shared="record-icon"]').forEach(x => x.removeAttribute('data-shared'));
      icon.dataset.shared = 'record-icon';
      B.go(ctx, 'record-detail', 'carry');
    }, 0.86, true);
  };

  // ------------------------------------------------------------------ the day line (the hero)

  /**
   * One day as a line from 06:00 to 24:00. Every record sits at the time it happened; records
   * close together stack upward in lanes. The line is solid up to now and quiet after it.
   * o: {compact, now, highlight (time), label, reveal}
   */
  B.dayLine = (ctx, records = [], o = {}) => {
    const compact = !!o.compact, now = o.now === undefined ? V.now : o.now;
    const lanesMax = compact ? 1 : 3, gap = compact ? 0 : 8.2;
    const lanes = [];
    const marks = h('div.dl-marks');
    const past = h('span.dl-past', { style: { width: (now ? pct(now) : 100) + '%' } });
    const nowDot = now ? h('span.dl-now', { style: { left: pct(now) + '%' } }) : null;
    const track = h('div.dl-track', h('span.dl-rest'), past, marks, nowDot);
    const axis = compact && !o.axis ? null : h('div.dl-axis', { 'aria-hidden': 'true' }, [6, 9, 12, 15, 18, 21, 24].map(hr => h('span', { style: { left: pct(`${hr}:00`) + '%' } }, String(hr % 24).padStart(2, '0'))));
    const el = h('div.dl' + (compact ? '.is-compact' : ''), { role: 'img' }, track, axis);
    const list = [];
    const lane = p => {
      for (let i = 0; i < lanesMax; i++) if (lanes[i] === undefined || p - lanes[i] >= gap) { lanes[i] = p; return i; }
      let best = 0; lanes.forEach((v, i) => { if (v < lanes[best]) best = i; }); lanes[best] = p; return best;
    };
    el.add = (rec, ao = {}) => {
      const t = B.type(rec.type), p = pct(rec.time), l = lane(p);
      const mark = B.paint(h('span.dl-mark', { style: { left: p + '%', '--lane': l } }, compact ? null : F.icon(t.icon, { size: 13, stroke: 2 })), t.key);
      if (o.highlight && rec.time !== o.highlight) mark.classList.add('is-dim');
      if (o.highlight && rec.time === o.highlight) mark.classList.add('is-on');
      if (ao.hidden) mark.style.visibility = 'hidden';
      marks.append(mark); list.push({ rec, mark }); el.describe(); return mark;
    };
    el.remove = (mark) => { const i = list.findIndex(x => x.mark === mark); if (i >= 0) list.splice(i, 1); mark.remove(); el.describe(); };
    el.describe = () => {
      const sorted = list.map(x => x.rec).sort((a, b) => mins(a.time) - mins(b.time));
      const label = o.label || `${dogName(ctx)}’s day`;
      el.setAttribute('aria-label', sorted.length
        ? `${label}: ${sorted.length} ${sorted.length === 1 ? 'care moment' : 'care moments'}. ` + sorted.map(r => `${B.type(r.type).label} at ${r.time}`).join(', ') + '.'
        : `${label}: nothing recorded yet${now ? `. Now is ${now}` : ''}.`);
    };
    [...records].sort((a, b) => mins(a.time) - mins(b.time)).forEach(r => el.add(r));
    el.describe();
    el.marks = () => list.map(x => x.mark);
    el.track = track; el.past = past; el.nowDot = nowDot;
    /** The line draws itself up to now; each mark arrives as the line reaches it. */
    el.reveal = (delay = 0) => {
      if (F.reduced()) return;
      const dur = o.revealMs || (compact ? 760 : V.revealMs);
      F.move(past, { sx: 0 }, { sx: 1 }, { duration: dur, delay, curve: 'emph', ctx, fill: 'backwards' });
      if (nowDot) F.move(nowDot, { s: 0.5, o: 0 }, { s: 1, o: 1 }, { spring: V.land, delay: delay + dur * 0.62, ctx, fill: 'backwards' });
      const ease = F.bezier('emph'), endP = now ? pct(now) : 100;
      // When the drawing line reaches a mark: invert the emphasised curve to find that moment.
      const at = p => { const target = F.clamp(p / Math.max(1, endP), 0, 1); let lo = 0, hi = 1; for (let i = 0; i < 18; i++) { const m = (lo + hi) / 2; if (ease(m) < target) lo = m; else hi = m; } return Math.min(lo * dur, dur * 0.8); };
      list.forEach(({ rec, mark }) => {
        if (compact) F.move(mark, { o: 0, s: 0.4 }, { o: 1, s: 1 }, { duration: 260, delay: delay + at(pct(rec.time)), curve: 'strong', ctx, fill: 'backwards' });
        else F.move(mark, { o: 0, s: 0.5, y: 6 }, { o: 1, s: 1, y: 0 }, { spring: V.land, delay: delay + at(pct(rec.time)), ctx, fill: 'backwards' });
      });
    };
    return el;
  };

  /**
   * The signature move: the care icon leaves the tile it was tapped on and arcs onto the day line
   * at its time, then lands with one small squash. Haptic on landing, not on lift-off.
   */
  B.fly = (ctx, fromEl, toEl, o = {}) => {
    const done = () => { toEl.style.visibility = ''; o.onLand && o.onLand(); };
    if (F.reduced() || !fromEl.isConnected || !toEl.isConnected) { done(); return; }
    const root = ctx.root, a = B.rel(fromEl, root), b = B.rel(toEl, root);
    const ghost = toEl.cloneNode(true);
    ghost.classList.add('dl-ghost'); ghost.style.visibility = 'visible';
    Object.assign(ghost.style, { position: 'absolute', left: b.x + 'px', top: b.y + 'px', width: b.w + 'px', height: b.h + 'px', margin: 0, bottom: 'auto', zIndex: 60 });
    root.append(ghost);
    const k0 = a.w / Math.max(1, b.w), dx = a.cx - b.cx, dy = a.cy - b.cy;
    const lift = o.lift ?? V.flightLift, ease = F.bezier('inout'), N = 28, frames = [];
    // A quadratic arc: start at the tile, rise above the straight path, end on the line.
    const cx = dx / 2, cy = Math.min(dy, 0) - lift;
    for (let i = 0; i <= N; i++) {
      const t = i / N, p = ease(t), q = 1 - p;
      const x = q * q * dx + 2 * q * p * cx, y = q * q * dy + 2 * q * p * cy;
      frames.push({ transform: `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(k0 + (1 - k0) * p).toFixed(4)})`, offset: t });
    }
    const dur = (o.duration || V.flightMs) * F.k();
    const anim = ghost.animate(frames, { duration: dur, delay: (o.delay || 0) * F.k(), easing: 'linear', fill: 'both' });
    ctx.track(anim);
    anim.finished.then(() => {
      ghost.remove(); if (ctx.dead) return;
      toEl.style.visibility = '';
      F.move(toEl, { sx: 1.22, sy: 0.8, y: 2 }, { sx: 1, sy: 1, y: 0 }, { spring: V.land, ctx, fill: 'none' });
      ctx.haptic(o.haptic || 'success');
      o.onLand && o.onLand();
    }, () => ghost.remove());
  };

  // ------------------------------------------------------------------ tabs: one pill that travels

  B.tabs = (ctx, selected) => {
    const items = [['home', 'Home', 'layout-dashboard', 'home'], ['timeline', 'Timeline', 'list', 'timeline'], ['insights', 'Insights', 'chart-no-axes-column-increasing', 'insights-overview'], ['profile', 'Profile', 'user-round', 'profile-hub']];
    const index = Math.max(0, items.findIndex(x => x[0] === selected));
    const pill = h('span.v3-tab-pill', { 'aria-hidden': 'true', style: { '--i': index } });
    const nav = h('nav.bl-tabs.v3-tabs', { 'aria-label': 'Journal tabs' }, pill, items.map(([key, label, icon, target], i) => B.press(ctx,
      h('button.bl-tab', { type: 'button', 'aria-current': selected === key ? 'page' : undefined }, F.icon(icon, { size: 21 }), label),
      () => { if (key !== selected) { ctx.haptic('selection'); ctx.answers.__tab = index; B.go(ctx, target); } }, 0.86, true)));
    const from = ctx.answers.__tab;
    ctx.answers.__tab = index;
    if (ctx.mode === 'flow' && typeof from === 'number' && from !== index && !F.reduced()) {
      // Sample the spring; stretch along the path in proportion to speed, squash once on arrival.
      const sc = F.springCurve(V.tab.response, V.tab.damping), d = (from - index), frames = [];
      sc.values.forEach((v, i) => {
        const prev = sc.values[Math.max(0, i - 1)], speed = Math.abs(v - prev) * Math.abs(d);
        const stretch = Math.min(0.18, speed * 2.6);
        const k = (1 - v) * d;
        frames.push({ transform: `translateX(calc(${(k * 100).toFixed(2)}% + ${(k * 4).toFixed(2)}px)) scale(${(1 + stretch).toFixed(3)}, ${(1 - stretch * 0.4).toFixed(3)})` });
      });
      ctx.track(pill.animate(frames, { duration: sc.duration * F.k(), easing: 'linear', fill: 'backwards' }));
      const icon = nav.querySelector('[aria-current="page"] .ic');
      if (icon) F.move(icon, { s: 0.8 }, { s: 1 }, { spring: V.land, delay: sc.duration * 0.35, ctx, fill: 'backwards' });
    }
    return nav;
  };

  // ------------------------------------------------------------------ feedback

  /** What just happened, for five seconds, one at a time; Undo when it can be undone. */
  B.toast = (ctx, text, o = {}) => {
    ctx.root.querySelector('.bl-toast')?.remove();
    const undo = o.undo ? B.press(ctx, h('button.v3-toast-undo', { type: 'button' }, F.icon('rotate-ccw', { size: 15 }), 'Undo'), () => { leave(); o.undo(); }, 0.94) : null;
    const toast = h('div.bl-toast', { role: 'status', 'aria-live': 'polite' }, h('span.v3-toast-tick', F.icon('check', { size: 15, stroke: 2.4 })), h('span.v3-toast-text', text), undo);
    ctx.root.append(toast);
    let gone = false;
    const leave = () => { if (gone) return; gone = true; const a = F.move(toast, { o: 1, y: 0 }, { o: 0, y: 8 }, { duration: 180, curve: 'exit', ctx, fill: 'forwards' }); a ? a.finished.then(() => toast.remove(), () => {}) : toast.remove(); };
    F.move(toast, { o: 0, y: 14, s: 0.98 }, { o: 1, y: 0, s: 1 }, { duration: 360, curve: 'emph', ctx, fill: 'backwards' });
    F.move(toast.firstChild, { s: 0.5 }, { s: 1 }, { spring: V.land, delay: 120, ctx, fill: 'backwards' });
    ctx.at(o.ms || (o.undo ? 6000 : 5000), leave);
    return toast;
  };

  /** Arrival: the heading comes into focus, then at most four parts rise in one wave. */
  B.enter = (ctx, body) => document.fonts.ready.then(() => {
    if (ctx.dead) return;
    const kids = [...body.children];
    const hi = kids.findIndex(k => k.classList.contains('bl-heading'));
    const carried = el => ctx.via === 'carry' && (el.matches('[data-shared]') || el.querySelector('[data-shared]'));
    if (hi >= 0) {
      const title = kids[hi].querySelector('h1'), sub = kids[hi].querySelector('.bl-sub');
      if (title && !carried(title)) F.titleIn(ctx, title, { duration: 520, distance: 10 });
      if (sub) F.rise(ctx, sub, { delay: 90, duration: 460 });
    }
    const rest = kids.slice(hi + 1).filter(k => !k.hasAttribute('data-still') && !carried(k)).slice(0, 4);
    F.rise(ctx, rest, { duration: M.riseMs + 60, stagger: M.riseStaggerMs, distance: 10, delay: hi >= 0 ? 150 : 0 });
  });

  /**
   * The example week, 8–14 October. One source for Timeline and Insights so every total and
   * sentence on screen can be traced back to these records. Today is B.example.
   */
  const R = (type, time, note) => ({ type, time, note });
  B.week = [
    { day: 'Thu', date: '8 October', records: [R('walk', '18:40', 'Park loop · 31 minutes'), R('meal', '18:10', 'Dry food · 120 g'), R('weight', '09:00', '14.5 kg · home scale'), R('meal', '08:05', 'Breakfast · 120 g'), R('pee', '07:50', 'Usual amount')] },
    { day: 'Fri', date: '9 October', records: [R('meal', '17:55', 'Dry food · 120 g'), R('meal', '08:20', 'Breakfast · 120 g'), R('poop', '07:45', 'Formed')] },
    { day: 'Sat', date: '10 October', records: [R('meal', '18:00', 'Dry food · 120 g'), R('mood', '15:20', 'Playful after visitors'), R('walk', '11:15', 'Long walk · 33 minutes'), R('meal', '08:30', 'Breakfast · 120 g'), R('pee', '07:30', 'Usual amount')] },
    { day: 'Sun', date: '11 October', records: [R('meal', '17:50', 'Dry food · 120 g'), R('pee', '12:40', 'Usual amount'), R('meal', '08:10', 'Breakfast · 120 g')] },
    { day: 'Mon', date: '12 October', records: [R('meal', '18:15', 'Dry food · 120 g'), R('pee', '13:20', 'Usual amount'), R('meal', '08:00', 'Breakfast · 120 g'), R('poop', '07:35', 'Formed')] },
    { day: 'Tue', date: '13 October', records: [R('walk', '18:30', 'Evening loop · 28 minutes'), R('pee', '12:50', 'Usual amount'), R('weight', '09:05', '14.6 kg · home scale'), R('meal', '08:10', 'Breakfast · 120 g'), R('poop', '07:55', 'Formed')] },
    { day: 'Wed', date: '14 October', today: true, records: null },
  ];
  B.weekDays = ctx => B.week.map(d => ({ ...d, records: d.records || (ctx && ctx.answers.records) || B.example }));

  /** A number that counts: tabular, rolls one digit at a time. */
  B.bigCount = (n, unit) => h('div.v3-count', h('strong.v3-count-n', String(n)), h('span.v3-count-unit', unit));
})();
