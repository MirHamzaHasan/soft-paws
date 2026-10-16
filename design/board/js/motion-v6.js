/* 2026-10-15 · Motion v6: every screen arrives with its own choreography. Board-only proposal.
 * Loaded after every screen file. barklog.js and motion.tokens.js stay the approved native source;
 * these numbers live here until the owner Picks them. Transform, opacity, blur and clip only.
 *
 * One pass per screen, in this order:
 *   1. the heading: a folio unfolds from its top edge, its mark turns in, the words come into focus
 *   2. one wave of at most five blocks (the rest arrive with the fifth), 60 ms apart
 *   3. inside each block, the part's own move: lists cascade, digits rise, bars grow, photos open
 *      with an iris, statuses gesture by meaning (a bell rings, a check draws, retry turns once)
 *   4. one signature per screen where the screen has a live fact (a timer, a progress, a press demo)
 *   5. life: the dog blinks now and then. Nothing loops except the blink; nothing bounces but what
 *      the person touched (presses keep the approved Firm spring).
 * Screens with their own choreography (opening, Home, Timeline, Insights, day line) keep it; v6 only
 * adds parts that are not already moving. Reduce Motion: nothing moves, every screen is its final frame.
 */
(() => {
  'use strict';
  const F = window.F, B = window.B, h = F.h;
  const V = window.BARK_V6 = {
    unfoldMs: 640, markMs: 680,
    wave: { max: 5, stagger: 60, ms: 480, distance: 10, curve: 'decel' },
    rows: { max: 5, stagger: 45, ms: 420, distance: 8 },
    chips: { max: 5, stagger: 32, ms: 380, distance: 6 },
    iconMs: 560, reelMs: 440, irisMs: 720, barMs: 900,
    blink: { first: 1400, every: [4200, 6400], ms: 170 },
  };
  /** Screens that must stay as they are: this one demonstrates the reduced-motion final state. */
  const STILL = new Set(['reduced-motion-state']);
  /** Parts that run their own choreography elsewhere; v6 never animates inside them. */
  const OWNED = '.dl-track,.v3-open,.v3-week,.v3-bars,.v3-care-grid,.v3-recent,.v3-day,.coach-tip,.bl-toast,.v4-sheet-back,.bl-dialog';

  const wrapIcon = F.icon;
  F.icon = (name, o) => { const svg = wrapIcon(name, o); svg.dataset.icon = name; return svg; };

  // ------------------------------------------------------------------ primitives

  const busy = el => !el || el.getAnimations().length > 0;
  const owned = el => !!el.closest(OWNED);
  const carried = (ctx, el) => ctx.via === 'carry' && (el.matches('[data-shared]') || !!el.querySelector('[data-shared]'));
  /** Raw keyframes for clip-path and multi-step gestures that F.move's poses cannot express. */
  const play = (ctx, el, frames, o = {}) => {
    if (!el || F.reduced()) return null;
    return ctx.track(el.animate(frames, {
      duration: (o.ms || 400) * F.k(), delay: (o.delay || 0) * F.k(),
      easing: o.easing || F.css(o.curve || 'emph'), fill: o.fill || 'backwards',
    }));
  };
  const rise = (ctx, el, delay, o = {}) => F.move(el, { y: o.distance ?? V.wave.distance, o: 0, blur: o.blur || 0 }, { y: 0, o: 1, blur: 0 },
    { duration: o.ms ?? V.wave.ms, delay, curve: o.curve || V.wave.curve, fill: 'backwards', ctx });
  /** At most `max` steps; everything after the last step arrives with it. */
  const cascade = (ctx, els, start, T) => els.forEach((el, i) => rise(ctx, el, start + Math.min(i, T.max - 1) * T.stagger, T));
  const radius = el => getComputedStyle(el).borderTopLeftRadius || '0px';
  /** The resting rotation a stylesheet gives an element, so a move lands on it instead of snapping. */
  const restTurn = el => { const t = getComputedStyle(el).transform; if (!t || t === 'none') return 0; const m = new DOMMatrix(t); return Math.atan2(m.b, m.a) * 180 / Math.PI; };
  /** When the block holding `el` arrived, so its inner move starts just after it. */
  const at = el => { for (let n = el; n; n = n.parentElement) if (n._v6 !== undefined) return n._v6; return 0; };

  // ------------------------------------------------------------------ 1 · the heading

  const splitWords = h1 => {
    const words = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const parts = n.textContent.split(/(\s+)/);
        const frag = document.createDocumentFragment();
        parts.forEach(p => { if (!p) return; if (/^\s+$/.test(p)) frag.append(p); else { const w = h('span.v6-w', p); words.push(w); frag.append(w); } });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(h1);
    return words;
  };

  /** Arriving inside a push, carry, step or layer: the transition is the motion, content follows it. */
  const quick = ctx => !!ctx.via && ctx.via !== 'cut';
  const QUICK = { max: 5, stagger: 36, ms: 360, distance: 6, curve: 'decel' };

  const heading = (ctx, hd) => {
    if (quick(ctx)) {
      const title = hd.querySelector('h1'), mark = hd.querySelector('.v4-folio-mark');
      if (title && !carried(ctx, title)) F.titleIn(ctx, title, { delay: 40, duration: 420, distance: 6, blur: 4 });
      if (mark && !carried(ctx, hd)) F.move(mark, { s: 0.7, r: restTurn(mark) - 12, o: 0 }, { s: 1, r: restTurn(mark), o: 1 }, { duration: 560, delay: 120, curve: 'emph', fill: 'backwards', ctx });
      return 60;
    }
    const title = hd.querySelector('h1'), sub = hd.querySelector(':scope > .bl-sub'), eyebrow = hd.querySelector('.v4-eyebrow'), mark = hd.querySelector('.v4-folio-mark');
    let t = 0;
    if (hd.classList.contains('v4-folio') && !carried(ctx, hd)) {
      const r = radius(hd);
      play(ctx, hd, [{ clipPath: `inset(0 0 74% 0 round ${r})`, opacity: 0 }, { clipPath: `inset(0 0 40% 0 round ${r})`, opacity: 1, offset: 0.35 }, { clipPath: `inset(0 0 0% 0 round ${r})`, opacity: 1 }], { ms: V.unfoldMs });
      if (mark) F.move(mark, { s: 1.5, r: restTurn(mark) - 26, o: 0 }, { s: 1, r: restTurn(mark), o: 1 }, { duration: V.markMs, delay: 150, curve: 'emph', fill: 'backwards', ctx });
      if (eyebrow) rise(ctx, eyebrow, 70, { distance: 6, ms: 420 });
      t = 110;
    }
    if (title && !carried(ctx, title)) {
      if (hd.classList.contains('is-display') && title.textContent.length < 48) {
        const words = splitWords(title);
        words.forEach((w, i) => F.move(w, { y: 14, o: 0, blur: 6 }, { y: 0, o: 1, blur: 0 }, { duration: 560, delay: t + Math.min(i, 4) * 70, curve: 'strong', fill: 'backwards', ctx }));
      } else F.titleIn(ctx, title, { delay: t, duration: 520, distance: 10 });
    }
    if (sub) rise(ctx, sub, t + 100, { ms: 460 });
    return t + 100;
  };

  // ------------------------------------------------------------------ 3 · parts

  /** A gesture that says what the icon means. Played once, after its block has arrived. */
  const GESTURES = {
    ring: ['bell', 'alarm-clock', 'phone', 'bell-ring'],
    draw: ['check', 'circle-check', 'circle-check-big', 'shield-check', 'badge-check'],
    turn: ['refresh-cw', 'rotate-ccw', 'loader'],
    shake: ['x', 'circle-x', 'triangle-alert', 'circle-alert', 'octagon-alert'],
    beat: ['heart'],
    nudge: ['send', 'file-down', 'download', 'share', 'share-2', 'arrow-right', 'printer'],
    lift: ['image', 'camera', 'smartphone', 'settings', 'settings-2'],
  };
  const gestureOf = name => Object.keys(GESTURES).find(k => GESTURES[k].includes(name));
  const gesture = (ctx, svg, delay) => {
    if (!svg || busy(svg)) return;
    svg.classList.add('v6-gesture');
    switch (gestureOf(svg.dataset.icon)) {
      case 'ring': return play(ctx, svg, [0, 16, -12, 8, -4, 0].map(r => ({ transform: `rotate(${r}deg)` })), { ms: 880, delay, easing: 'ease-out', fill: 'none' });
      case 'draw':
        F.move(svg, { s: 0.7, o: 0 }, { s: 1, o: 1 }, { duration: 420, delay, curve: 'emph', fill: 'backwards', ctx });
        return play(ctx, svg, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { ms: 560, delay: delay + 60, curve: 'emph' });
      case 'turn': return F.move(svg, { r: -300, o: 0.4 }, { r: 0, o: 1 }, { duration: 820, delay, curve: 'emph', fill: 'backwards', ctx });
      case 'shake':
        F.move(svg, { s: 0.6, o: 0 }, { s: 1, o: 1 }, { duration: 360, delay, curve: 'strong', fill: 'backwards', ctx });
        return play(ctx, svg, [0, -4, 4, -2.5, 1.5, 0].map(x => ({ transform: `translateX(${x}px)` })), { ms: 460, delay: delay + 340, easing: 'ease-out', fill: 'none' });
      case 'beat': return play(ctx, svg, [1, 1.16, 1, 1.1, 1].map(s => ({ transform: `scale(${s})` })), { ms: 900, delay, easing: 'ease-in-out', fill: 'none' });
      case 'nudge': return play(ctx, svg, [{ transform: 'translate(-6px, 4px)', opacity: 0 }, { transform: 'translate(2px, -1px)', opacity: 1, offset: 0.6 }, { transform: 'none', opacity: 1 }], { ms: 640, delay, curve: 'emph' });
      case 'lift': return F.move(svg, { y: 10, s: 0.8, o: 0 }, { y: 0, s: 1, o: 1 }, { duration: 620, delay, curve: 'emph', fill: 'backwards', ctx });
      default: return F.move(svg, { s: 0.7, r: -10, o: 0 }, { s: 1, r: 0, o: 1 }, { duration: V.iconMs, delay, curve: 'emph', fill: 'backwards', ctx });
    }
  };

  /** Each digit rises in its own clipped slot; no false intermediate amount is shown. */
  const reel = (ctx, el, delay) => {
    const text = el.textContent;
    if (!/\d/.test(text) || busy(el) || el.querySelector('*') || F.reduced()) return;
    el.setAttribute('aria-label', text);
    // Clock times are facts that flow, never reels: their digits stay put.
    const still = new Set();
    for (const m of text.matchAll(/\d{1,2}:\d{2}/g)) for (let i = m.index; i < m.index + m[0].length; i++) still.add(i);
    let n = 0;
    const kids = [...text].map((ch, i) => {
      if (!/\d/.test(ch) || still.has(i)) return h('span.v6-reel-ch', { 'aria-hidden': 'true' }, ch);
      n++;
      const col = h('span.v6-reel-col', h('span', ch));
      // The hidden digit keeps the line's baseline and width; the clipped digit rises over it.
      return h('span.v6-reel', { 'aria-hidden': 'true' }, h('span.v6-reel-hold', ch), col);
    });
    if (!n) { el.removeAttribute('aria-label'); return; }
    el.replaceChildren(...kids);
    const cols = [...el.querySelectorAll('.v6-reel-col')];
    let left = cols.length;
    cols.forEach(col => {
      const a = play(ctx, col, [{ transform: 'translateY(105%)' }, { transform: 'translateY(0)' }], { ms: V.reelMs, delay, curve: 'emph', fill: 'both' });
      const done = () => { if (--left === 0 && !ctx.dead) { el.textContent = text; el.removeAttribute('aria-label'); } };
      a ? a.finished.then(done, done) : done();
    });
  };

  const photo = (ctx, fig, delay) => {
    if (busy(fig) || carried(ctx, fig)) return;
    play(ctx, fig, [{ clipPath: `circle(0% at 50% 58%)` }, { clipPath: `circle(78% at 50% 58%)` }], { ms: V.irisMs, delay, curve: 'emph' });
    [['.bl-photo-sun', 22, 0], ['.bl-photo-hill.is-back', 10, 30], ['.bl-photo-hill.is-front', 18, 60], ['.bl-photo-dog', 26, 90]].forEach(([sel, y, d]) => {
      const part = fig.querySelector(sel);
      if (part) F.move(part, { y, s: sel === '.bl-photo-dog' ? 0.92 : 1 }, { y: 0, s: 1 }, { duration: 820, delay: delay + d, curve: 'emph', fill: 'backwards', ctx });
    });
    const cap = fig.querySelector('figcaption');
    if (cap) rise(ctx, cap, delay + 260, { distance: 6, ms: 400 });
  };

  const progress = (ctx, fill, delay, from = 0) => {
    if (busy(fill)) return;
    fill.style.transformOrigin = 'left center';
    F.move(fill, { sx: from, sy: 1 }, { sx: 1, sy: 1 }, { duration: V.barMs, delay, curve: 'emph', fill: 'backwards', ctx });
  };

  const parts = (ctx, scope) => {
    const q = sel => [...scope.querySelectorAll(sel)].filter(el => !owned(el));
    // Lists: rows cascade, each icon turns in just after its row.
    q('.bl-menu').forEach(menu => {
      const rows = [...menu.children].filter(r => !busy(r) && !carried(ctx, r)), t = at(menu) + 70;
      cascade(ctx, rows, t, V.rows);
      rows.forEach((r, i) => { const icon = r.querySelector('.bl-menu-icon'); if (icon && !busy(icon)) F.move(icon, { s: 0.6, r: -12, o: 0 }, { s: 1, r: 0, o: 1 }, { duration: V.iconMs, delay: t + Math.min(i, 4) * V.rows.stagger + 90, curve: 'emph', fill: 'backwards', ctx }); });
    });
    // Event rows not owned by Home/Timeline choreography.
    const rowGroups = new Map();
    q('.bl-row').forEach(r => { if (busy(r) || carried(ctx, r)) return; const k = r.parentElement; rowGroups.set(k, [...(rowGroups.get(k) || []), r]); });
    rowGroups.forEach((rows, parent) => {
      const t = at(parent) + 70;
      cascade(ctx, rows, t, V.rows);
      rows.forEach((r, i) => { const icon = r.querySelector('.bl-event-icon'); if (icon && !busy(icon) && !icon.dataset.shared) F.move(icon, { s: 0.6, o: 0 }, { s: 1, o: 1 }, { duration: V.iconMs, delay: t + Math.min(i, 4) * V.rows.stagger + 80, curve: 'emph', fill: 'backwards', ctx }); });
    });
    // Choice chips and option rows: a quick sweep in reading order.
    const chipGroups = new Map();
    q('.bl-chip,.v4-choice,.guide-option,.guide-breed,.guide-ready-values > span,.v4-record-tags > span,.guide-facts > *').forEach(c => { if (busy(c) || carried(ctx, c)) return; const k = c.parentElement; chipGroups.set(k, [...(chipGroups.get(k) || []), c]); });
    chipGroups.forEach((chips, parent) => cascade(ctx, chips, at(parent) + 60, chips[0].matches('.guide-option,.guide-breed') ? V.rows : V.chips));
    // Editor: the hero unfolds like a folio, sections follow, the save bar rises last.
    q('.v4-editor-hero').forEach(hero => {
      if (busy(hero) || carried(ctx, hero)) return;
      const r = radius(hero);
      play(ctx, hero, [{ clipPath: `inset(0 0 70% 0 round ${r})`, opacity: 0 }, { clipPath: `inset(0 0 0% 0 round ${r})`, opacity: 1 }], { ms: V.unfoldMs, delay: at(hero) });
      const mark = hero.querySelector('.v4-log-mark');
      if (mark && !busy(mark) && !mark.dataset.shared) F.move(mark, { s: 0.55, r: -16, o: 0 }, { s: 1, r: 0, o: 1 }, { duration: V.markMs, delay: at(hero) + 140, curve: 'emph', fill: 'backwards', ctx });
    });
    q('.v4-editor-form').forEach(form => cascade(ctx, [...form.children].filter(s => s.matches('.v4-editor-section,.v4-context,.bl-tight,section') && !busy(s)), at(form) + 160, V.wave));
    q('.v4-editor-footer').forEach(foot => { if (!busy(foot)) rise(ctx, foot, 380, { distance: 18, ms: 520, curve: 'emph' }); });
    // Statuses and handoffs gesture by meaning.
    q('.bl-status').forEach(s => gesture(ctx, s.querySelector(':scope > svg.ic'), at(s) + 220));
    q('.bl-handoff-icon').forEach(i => { if (!busy(i)) F.move(i, { y: 14, s: 0.86, o: 0 }, { y: 0, s: 1, o: 1 }, { duration: 620, delay: at(i) + 120, curve: 'emph', fill: 'backwards', ctx }); gesture(ctx, i.querySelector('svg'), at(i) + 420); });
    q('.bl-empty > svg,.bl-empty .ic').forEach(i => gesture(ctx, i, at(i) + 200));
    // Numbers roll; charts and progress grow from where they start.
    q('.bl-total,.v3-count-n,.bl-chart-value').forEach(n => reel(ctx, n, at(n) + 40));
    q('.bl-chart-bar').forEach((bar, i) => { if (!busy(bar)) F.move(bar, { sy: 0.06, o: 0.35 }, { sy: 1, o: 1 }, { duration: 700, delay: at(bar) + 120 + Math.min(i, 4) * 70, curve: 'emph', fill: 'backwards', ctx }); });
    q('.bl-progress > span').forEach(fill => progress(ctx, fill, at(fill) + 160));
    q('.guide-track > i').forEach(fill => {
      const now = parseFloat(fill.style.width) || 0, before = ctx.answers._v6guide ?? Math.max(0, now - 12);
      ctx.answers._v6guide = now;
      if (now > 0 && !busy(fill)) progress(ctx, fill, 140, F.clamp(before / now, 0, 1));
    });
    // Photos open with an iris; the scene inside settles at different depths.
    q('.bl-photo').forEach((fig, i) => photo(ctx, fig, at(fig) + 80 + Math.min(i, 4) * 90));
    // A week strip reveals left to right as one object; today lands after it.
    q('.bl-calendar-week').forEach(week => {
      if (busy(week)) return;
      play(ctx, week, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { ms: 700, delay: at(week) + 80, curve: 'emph' });
      const today = week.querySelector('[aria-current],[aria-pressed="true"],.is-today,.is-on');
      if (today) F.move(today, { s: 0.8, o: 0.4 }, { s: 1, o: 1 }, { duration: 520, delay: at(week) + 460, curve: 'emph', fill: 'backwards', ctx });
    });
    // Placeholders draw in once. Loading never loops (the screen's own intent).
    q('.bl-skeleton').forEach((s, i) => play(ctx, s, [{ clipPath: 'inset(0 100% 0 0 round 4px)', opacity: 0.4 }, { clipPath: 'inset(0 0% 0 0 round 4px)', opacity: 1 }], { ms: 620, delay: at(s) + 80 + Math.min(i, 4) * 70, curve: 'emph' }));
    // A field that arrives invalid settles once so the eye finds it.
    q('[aria-invalid="true"]').forEach(f => play(ctx, f, [0, -5, 5, -3, 2, 0].map(x => ({ transform: `translateX(${x}px)` })), { ms: 480, delay: 720, easing: 'ease-out', fill: 'none' }));
    // A scrapbook page is placed, not slid.
    q('.v4-scrapbook').forEach(page => { if (!busy(page)) F.move(page, { y: 16, r: -2.4, o: 0 }, { y: 0, r: 0, o: 1 }, { duration: 760, delay: at(page), curve: 'emph', fill: 'backwards', ctx }); });
    q('.guide-note-paper').forEach(p => { if (!busy(p)) F.move(p, { y: 12, r: 1.8, o: 0 }, { y: 0, r: 0, o: 1 }, { duration: 680, delay: at(p) + 120, curve: 'emph', fill: 'backwards', ctx }); });
    q('.bl-report-table tr').forEach((tr, i) => { if (!busy(tr)) rise(ctx, tr, at(tr) + 160 + Math.min(i, 4) * 45, V.rows); });
  };

  // ------------------------------------------------------------------ 5 · life

  const blink = ctx => {
    if (F.reduced()) return;
    const eyes = [...ctx.root.querySelectorAll('.bl-dog-art ellipse[fill="var(--dog-ink)"]')].filter(e => (Number(e.getAttribute('ry')) || Number(e.getAttribute('r'))) < 5 && !owned(e));
    if (!eyes.length) return;
    eyes.forEach(e => e.classList.add('v6-eye'));
    const rnd = F.rand(ctx.screen.id.length * 97 + eyes.length);
    const once = () => {
      if (ctx.dead) return;
      eyes.forEach(e => { if (e.isConnected) play(ctx, e, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0.12)', offset: 0.45 }, { transform: 'scaleY(1)' }], { ms: V.blink.ms, easing: 'ease-in-out', fill: 'none' }); });
      ctx.at(V.blink.every[0] + rnd() * (V.blink.every[1] - V.blink.every[0]), once);
    };
    ctx.at(V.blink.first + rnd() * 600, once);
  };

  // ------------------------------------------------------------------ 4 · signatures

  /** Demonstrate the press without activating it: down, hold, release, with a finger. */
  const demoPress = (ctx, sel, ms = 1100) => ctx.at(ms, () => {
    const el = ctx.root.querySelector(sel);
    if (!el || F.reduced()) return;
    const p = B.rel ? B.rel(el, ctx.root) : F.pos(el, ctx.root);
    F.touch(ctx, ctx.root, p.cx, p.cy, { hold: 160 });
    const r = el.getBoundingClientRect(), ev = { bubbles: true, clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 };
    ctx.at(300, () => el.dispatchEvent(new PointerEvent('pointerdown', ev)));
    ctx.at(560, () => el.dispatchEvent(new PointerEvent('pointerup', ev)));
  });

  const SIGNATURE = {
    'feel-firm': ctx => demoPress(ctx, '.bl-btn'), 'feel-bubbly': ctx => demoPress(ctx, '.bl-btn'), 'feel-lively': ctx => demoPress(ctx, '.bl-btn'),
    'motion-press': ctx => demoPress(ctx, '.bl-btn', 1300),
    // Kit type: the scale is read top to bottom, so it arrives top to bottom.
    'kit-type': ctx => { const card = ctx.root.querySelector('.bl-card'); if (card) cascade(ctx, [...card.children], at(card) + 120, V.rows); },
    // A session in progress: its clock keeps time.
    'training-session': ctx => {
      const sub = ctx.root.querySelector('.bl-heading .bl-sub'), m = sub && sub.textContent.match(/(\d+):(\d\d) elapsed/);
      if (!m) return;
      let s = Number(m[1]) * 60 + Number(m[2]);
      const tick = () => { if (ctx.dead) return; s++; sub.textContent = sub.textContent.replace(/\d+:\d\d elapsed/, `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')} elapsed`); ctx.at(1000, tick); };
      ctx.at(1000, tick);
    },
    // Export: the percentage counts with the bar it describes.
    'export-progress': ctx => {
      const cap = [...ctx.root.querySelectorAll('.bl-caption')].find(c => /\d+%/.test(c.textContent));
      if (!cap) return;
      const rest = cap.textContent.replace(/^\d+%/, '');
      F.count(ctx, cap, 3, 38, { duration: 1200, curve: 'strong', fmt: v => `${Math.round(v)}%${rest}` });
    },
  };

  // ------------------------------------------------------------------ the pass

  const choreograph = (ctx, body) => {
    if (ctx.dead || ctx._v6 || STILL.has(ctx.screen.id)) return;
    ctx._v6 = true;
    if (F.reduced() || ctx.via === 'back' || ctx.via === 'tab') return; // uncovered by Back, or slid in by a tab: the transition is the motion
    const kids = [...body.children];
    const hd = kids.find(k => k.classList.contains('bl-heading'));
    let t = hd ? heading(ctx, hd) : 0;
    hd && (hd._v6 = 0);
    const after = hd ? kids.slice(kids.indexOf(hd) + 1) : kids.filter(k => !k.matches('.bl-brand,.bl-back,.guide-nav,.v4-editor-top'));
    const blocks = after.filter(k => !k.hasAttribute('data-still') && !carried(ctx, k) && !k.hidden && !busy(k));
    const W = quick(ctx) ? QUICK : V.wave;
    blocks.forEach((el, i) => { el._v6 = t + Math.min(i, W.max - 1) * W.stagger; rise(ctx, el, el._v6, W); });
    parts(ctx, ctx.root);
    ctx.root.classList.remove('v6-pending');
  };

  /** Screens whose own build already moves (opening, day line, Home): parts only where still. */
  const accompany = ctx => {
    if (ctx.dead || ctx._v6 || STILL.has(ctx.screen.id)) return;
    ctx._v6 = true;
    if (!F.reduced() && ctx.via !== 'back' && ctx.via !== 'tab') parts(ctx, ctx.root);
  };

  /** Called inside build: hold the blocks hidden from the first paint until their pass begins. */
  B.choreograph = (ctx, body) => {
    if (!F.reduced() && !STILL.has(ctx.screen.id) && ctx.via !== 'back' && ctx.via !== 'tab') {
      ctx.root.classList.add('v6-pending');
      ctx.at(1600, () => ctx.root.classList.remove('v6-pending'));
    }
    return document.fonts.ready.then(() => choreograph(ctx, body));
  };

  // Every screen, including those that never call B.enter, gets the pass after it is built.
  F.SCREENS.forEach(screen => {
    if (screen.seq || screen._v6) return;
    screen._v6 = true;
    const build = screen.build;
    screen.build = ctx => {
      F.v6 = { ctx }; // QA: F.v6.ctx.restart() replays the solo screen with warm fonts
      build(ctx);
      document.fonts.ready.then(() => requestAnimationFrame(() => {
        if (ctx.dead) return;
        if (!ctx._v6) {
          const moving = document.getAnimations().some(a => a.effect && a.effect.target && ctx.root.contains(a.effect.target) && a.playState !== 'finished');
          const body = ctx.root.querySelector('.bl-stack');
          moving || !body ? accompany(ctx) : choreograph(ctx, body);
        }
        if (!STILL.has(screen.id)) { blink(ctx); SIGNATURE[screen.id]?.(ctx); }
      }));
    };
  });
})();
