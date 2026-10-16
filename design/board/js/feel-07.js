/* 2026-10-15 · Feel 07: touch and continuity for Design 06. Board-only proposal, loaded last.
 * Ungenerated interaction-feel, bubbly-motion and continuity:
 *   Touch   round stickers squish under the finger and keep their volume; button glyphs nudge with
 *           the action and spring home; a chip that becomes picked
 *           lands with one small overshoot; a picked option's check pops once. These play on the CSS
 *           `scale` property, so they compose with the Firm press (which owns `transform`).
 *   Batons  a feature row's sticker flies up and becomes the feature's folio sticker (carry);
 *           switching tabs keeps the bar still while the ball pill travels and the page slides one
 *           tab's width of intent; Back slides back the way you came instead of dissolving.
 * Springs only on what the finger touched. Reduce Motion: no squish, no pop, transitions land at once.
 */
(() => {
  'use strict';
  const F = window.F, B = window.B;
  const SQUISH = { inMs: 90, wide: 1.06, tall: 0.92, release: { response: 0.34, damping: 0.6 } };
  const LAND = { response: 0.38, damping: 0.62 };        // bubbly: a chip or a check landing
  const FOLLOW = 36;                                      // ms the glyph trails its sticker

  /** A sampled SwiftUI spring on the `scale` property (x y), so it never fights a transform. */
  const springScale = (ctx, el, from, to, spring, delay = 0) => {
    if (!el || F.reduced()) return null;
    const sc = F.springCurve(spring.response, spring.damping);
    const frames = sc.values.map(v => ({ scale: `${(from[0] + (to[0] - from[0]) * v).toFixed(4)} ${(from[1] + (to[1] - from[1]) * v).toFixed(4)}` }));
    return ctx.track(el.animate(frames, { duration: sc.duration * F.k(), delay: delay * F.k(), easing: 'linear', fill: 'backwards' }));
  };
  const curveScale = (ctx, el, from, to, ms) => {
    if (!el || F.reduced()) return null;
    return ctx.track(el.animate([{ scale: from.join(' ') }, { scale: to.join(' ') }], { duration: ms * F.k(), easing: F.css('strong'), fill: 'forwards' }));
  };
  const nowScale = el => { const s = getComputedStyle(el).scale; if (!s || s === 'none') return [1, 1]; const p = s.split(' ').map(Number); return [p[0], p[1] ?? p[0]]; };

  // ------------------------------------------------------------------ touch: squish, land, pop

  const STICKER = '.v3-care-icon, .v4-log-mark, .bl-event-icon, .bl-menu-icon, .v3-dog-chip-paw, .bl-avatar, .v3-care-add';
  const touch = ctx => {
    let held = null;
    let heldGlyph = null;
    const glyphMotion = new WeakMap();
    const glyphPose = el => {
      const css = getComputedStyle(el);
      return { x: parseFloat(css.translate) || 0, s: parseFloat(css.scale) || 1 };
    };
    const moveGlyph = (el, from, to, duration, spring = false) => {
      glyphMotion.get(el)?.cancel();
      if (!el.isConnected || F.reduced()) return;
      const values = spring ? F.springCurve(.30, .86).values : [0, 1];
      const frames = values.map(v => ({ translate: `${(from.x + (to.x - from.x) * v).toFixed(2)}px 0px`, scale: (from.s + (to.s - from.s) * v).toFixed(4) }));
      const animation = ctx.track(el.animate(frames, { duration: (spring ? F.springCurve(.30, .86).duration : duration) * F.k(), easing: spring ? 'linear' : F.css('strong'), fill: 'forwards' }));
      glyphMotion.set(el, animation);
    };
    const release = () => {
      if (held) {
        const { el, glyph } = held; held = null;
        el.getAnimations().forEach(a => a.effect?.getKeyframes?.()[0]?.scale !== undefined && a.cancel());
        springScale(ctx, el, [SQUISH.wide, SQUISH.tall], [1, 1], SQUISH.release);
        if (glyph) springScale(ctx, glyph, [0.94, 1.04], [1, 1], SQUISH.release, FOLLOW);
      }
      if (heldGlyph) {
        const { el } = heldGlyph; heldGlyph = null;
        const from = glyphPose(el);
        moveGlyph(el, from, { x: 0, s: 1 }, 0, true);
      }
    };
    ctx.on(ctx.root, 'pointerdown', e => {
      const control = e.target.closest('button,[role="button"]');
      if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true' || !ctx.root.contains(control) || F.reduced()) return;
      const el = control.matches(STICKER) ? control : control.querySelector(STICKER);
      if (el) {
        held = { el, glyph: el.querySelector('svg') };
        curveScale(ctx, el, nowScale(el), [SQUISH.wide, SQUISH.tall], SQUISH.inMs);
      }
      if (control.matches('.bl-btn,.bl-link,.bl-icon-btn')) {
        const glyph = control.querySelector('svg.ic');
        if (glyph) {
          const name = glyph.dataset.icon;
          const x = name === 'arrow-left' ? -3 : ['arrow-right', 'chevron-right', 'plus', 'send', 'download', 'file-down'].includes(name) ? 3 : 0;
          heldGlyph = { el: glyph };
          moveGlyph(glyph, glyphPose(glyph), { x, s: .9 }, 90);
        }
      }
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(ev => ctx.on(ctx.root, ev, release));
    ctx.on(ctx.root, 'pointerout', e => {
      const control = e.target.closest('button,[role="button"]');
      if (control && !control.contains(e.relatedTarget)) release();
    });

    // A pick lands: the control's own handler runs first, then we read what it became.
    ctx.on(ctx.root, 'click', e => {
      const picked = e.target.closest('[aria-pressed]');
      if (!picked || F.reduced()) return;
      requestAnimationFrame(() => {
        if (ctx.dead || !picked.isConnected || picked.getAttribute('aria-pressed') !== 'true') return;
        if (picked.matches('.bl-chip')) {
          springScale(ctx, picked, [0.9, 0.9], [1, 1], LAND);
          const tick = picked.querySelector('svg');
          if (tick) springScale(ctx, tick, [0.5, 0.5], [1, 1], LAND, FOLLOW);
        } else {
          const check = picked.querySelector('.guide-option-check, .v4-choice-check');
          if (check && !check.getAnimations().length) springScale(ctx, check, [0.5, 0.5], [1, 1], LAND);
        }
      });
    });
  };

  // ------------------------------------------------------------------ batons between screens

  let pendingTab = null;
  const tabOrder = ['Home', 'Timeline', 'Insights', 'Profile'];
  const go = B.go;
  /** A tap may name how the next screen arrives; the screen's own default stays otherwise. */
  B.go = (ctx, to, via) => { const next = via || ctx._nextVia; ctx._nextVia = null; return go(ctx, to, next); };

  const tabs = B.tabs;
  B.tabs = (ctx, selected) => {
    const from = ctx.answers.__tab;
    const nav = tabs(ctx, selected);
    const buttons = [...nav.querySelectorAll('.bl-tab')];
    const current = buttons.findIndex(b => b.getAttribute('aria-current') === 'page');
    // The glyph colours change where the ball is, not before it gets there.
    if (ctx.mode === 'flow' && typeof from === 'number' && from !== current && buttons[from] && !F.reduced()) {
      const css = getComputedStyle(ctx.root), on = css.getPropertyValue('--ball-ink').trim(), off = css.getPropertyValue('--tab-ink').trim();
      const ms = F.springCurve(0.42, 0.78).duration * F.k();
      ctx.track(buttons[current].animate([{ color: off }, { color: off, offset: 0.3 }, { color: on, offset: 0.55 }, { color: on }], { duration: ms, fill: 'backwards' }));
      ctx.track(buttons[from].animate([{ color: on }, { color: on, offset: 0.1 }, { color: off, offset: 0.35 }, { color: off }], { duration: ms }));
    }
    buttons.forEach((b, i) => ctx.on(b, 'click', () => {
      if (i === current) return;
      pendingTab = { dir: i > current ? 1 : -1, at: performance.now() };
      ctx._nextVia = 'tab';
    }, { capture: true }));
    return nav;
  };

  /** Rows that open a feature hand their sticker to the feature's folio. */
  const ENTRY = new Set(['profile-hub', 'health-records', 'safety-home', 'training-catalog']);
  const listRow = B.listRow;
  B.listRow = (ctx, o) => {
    const el = listRow(ctx, o);
    if (o.onTap && ENTRY.has(ctx.screen.id)) ctx.on(el, 'click', () => {
      ctx.root.querySelectorAll('[data-shared="feature-mark"]').forEach(x => x.removeAttribute('data-shared'));
      const icon = el.querySelector('.bl-menu-icon');
      if (icon && !el.dataset.shared) { icon.dataset.shared = 'feature-mark'; ctx._nextVia = 'carry'; }
    }, { capture: true });
    return el;
  };
  const enter = B.enter;
  B.enter = (ctx, body) => {
    const r = enter(ctx, body);
    if (ctx.via === 'carry') { const mark = body.querySelector('.v4-folio-mark'); if (mark) mark.dataset.shared = 'feature-mark'; }
    return r;
  };

  /** Tab to tab: same ground, the bar never moves (its pill travels on its own spring). */
  const tabMove = (o, dir) => {
    const { oldCtx, mount, onMounted } = o, oldPh = oldCtx.root;
    const finish = () => { oldCtx.dispose(); oldPh.remove(); };
    if (F.reduced()) { onMounted(mount({ via: 'tab' })); finish(); return; }
    const n = mount({ via: 'tab' });
    oldPh.querySelector(':scope > .bl-tabs')?.style.setProperty('visibility', 'hidden');
    n.root.style.background = 'transparent';
    const was = oldPh.querySelector(':scope > .bl-scroll'), now = n.root.querySelector(':scope > .bl-scroll');
    F.move(was, { x: 0, o: 1 }, { x: -20 * dir, o: 0 }, { duration: 120, curve: 'exit', fill: 'forwards' });
    // Overlap: the next page starts while the last is still leaving, so no frame is empty.
    F.move(now, { x: 40 * dir, o: 0 }, { x: 0, o: 1 }, { duration: 440, delay: 90, curve: 'emph', fill: 'backwards' });
    onMounted(n);
    setTimeout(() => { if (!n.dead) n.root.style.background = ''; finish(); }, 300 * F.k());
  };

  /** Back is a pop: the top page slides off to the right (leaving is faster than arriving) and
   *  uncovers the page beneath, which was already there and so does not arrive again. */
  const backMove = o => {
    const { oldCtx, mount, onMounted } = o, oldPh = oldCtx.root;
    const finish = () => { oldCtx.dispose(); oldPh.remove(); };
    const n = mount({ via: 'back' });
    if (F.reduced()) { onMounted(n); finish(); return; }
    const width = oldPh.offsetWidth || 390;
    oldPh.style.zIndex = '5'; oldPh.style.background = 'transparent';
    oldPh.querySelectorAll(':scope > .ph-status,:scope > .ph-island,:scope > .ph-home').forEach(el => el.style.visibility = 'hidden');
    oldPh.querySelectorAll(':scope > .bl-scroll,:scope > .bl-tabs').forEach(el => { el.style.background = 'var(--ground)'; F.move(el, { x: 0 }, { x: width }, { duration: 320, curve: 'exit', fill: 'forwards' }); });
    n.root.querySelectorAll(':scope > .bl-scroll,:scope > .bl-tabs').forEach(el => F.move(el, { x: -width * 0.28, o: 0.7 }, { x: 0, o: 1 }, { duration: 420, curve: 'emph', fill: 'backwards' }));
    onMounted(n);
    setTimeout(finish, 330 * F.k());
  };

  const transit = F.transit;
  F.transit = (kind, o) => {
    const tab = pendingTab && performance.now() - pendingTab.at < 900 ? pendingTab : null;
    pendingTab = null;
    if (tab && o.oldCtx) return tabMove(o, tab.dir);
    if (kind === 'dissolve' && o.dir < 0 && o.oldCtx) return backMove(o);   // Back retraces the way in
    return transit(kind, o);
  };

  // ------------------------------------------------------------------ every screen gets touch

  F.SCREENS.forEach(screen => {
    if (screen.seq || screen._feel) return;
    screen._feel = true;
    const build = screen.build;
    screen.build = ctx => { build(ctx); touch(ctx); };
  });
})();
