/* 2026-10-15 · Design 06 "Park day" motion. Board-only proposal, loaded after motion-v6.js.
 * Moves that belong to the new look: the ball-green marker draws under a heading's key word, Home's
 * dog settles in beside the care facts, Timeline's thread draws
 * through its stickers, and the profile ID card's band and portrait settle. Curves only; nothing here
 * springs. Reduce Motion: none of it runs. Pseudo-element moves are transforms with a native twin. */
(() => {
  'use strict';
  const F = window.F;
  const quick = ctx => !!ctx.via && ctx.via !== 'cut';
  const play = (ctx, el, frames, o = {}) => {
    if (!el || F.reduced()) return null;
    return ctx.track(el.animate(frames, {
      duration: (o.ms || 500) * F.k(), delay: (o.delay || 0) * F.k(), easing: o.easing || F.css(o.curve || 'emph'),
      fill: o.fill || 'backwards', pseudoElement: o.pseudo,
    }));
  };

  /** The marker is drawn, left to right, once the words have arrived. */
  const markers = ctx => ctx.root.querySelectorAll('h1 em, .bl-accent-word').forEach(em => {
    if (em.closest('[data-shared]') && ctx.via === 'carry') return;
    play(ctx, em, [{ backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%' }], { ms: 640, delay: quick(ctx) ? 240 : 540, curve: 'emph' });
  });

  /** Home shares the same character pose and part timing as first run. */
  const homeDog = ctx => {
    const day = ctx.root.querySelector('.v3-day');
    const dog = day?.querySelector('.bl-home-dog');
    if (dog) window.B.animateDogCharacter(ctx, dog, {
      carried: ctx.via === 'carry', idle: !day.hasAttribute('aria-busy'), delay: quick(ctx) ? 60 : 140,
    });
  };

  /** Timeline: the thread is drawn downward as each record arrives. */
  const thread = ctx => ctx.root.querySelectorAll('.v3-day-group').forEach((g, gi) =>
    [...g.querySelectorAll('.v3-row')].forEach((r, i) =>
      play(ctx, r, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { ms: 380, delay: 220 + gi * 140 + Math.min(i, 6) * 70, curve: 'strong', pseudo: '::before' })));

  /** Profile: the ID card's band sweeps in and the portrait settles into its frame. */
  const idCard = ctx => {
    const hero = ctx.root.querySelector('.v3-profile-hero');
    if (!hero) return;
    play(ctx, hero, [{ transform: 'scaleX(0)' }, { transform: 'none' }], { ms: 680, delay: 240, pseudo: '::before' });
    const dog = hero.querySelector('.v3-day-dog');
    if (dog && !(ctx.via === 'carry')) play(ctx, dog, [{ transform: 'translateY(26px) scale(.82)', opacity: 0 }, { transform: 'none', opacity: 1 }], { ms: 720, delay: 340 });
  };

  const SIG = { home: homeDog, 'home-coach': homeDog, 'home-empty': homeDog, 'home-loading': homeDog, timeline: thread, 'timeline-filters': thread, 'profile-hub': idCard };
  const STILL = new Set(['reduced-motion-state']);
  F.SCREENS.forEach(screen => {
    if (screen.seq || screen._park) return;
    screen._park = true;
    const build = screen.build;
    screen.build = ctx => {
      build(ctx);
      if (STILL.has(screen.id)) return;
      document.fonts.ready.then(() => requestAnimationFrame(() => { if (ctx.dead || ctx.via === 'back') return; markers(ctx); SIG[screen.id]?.(ctx); }));
    };
  });
})();
