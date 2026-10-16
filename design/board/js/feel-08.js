/* 2026-10-15 · Board-only polish: quiet copy arrivals and a finger-led button bubble.
 * Content uses a short curve. Only the touched button gets a soft bubble.
 * Reduced motion keeps the final frame and the normal pressed colour.
 */
(() => {
  'use strict';
  const F = window.F;
  const OWNED = '.dl-track,.v3-open,.v3-week,.v3-bars,.v3-care-grid,.v3-recent,.v3-day,.coach-tip,.bl-toast,.v4-sheet,.bl-dialog';
  const COPY = 'h2,h3,p,.bl-menu-title,.bl-menu-copy > .bl-caption,.bl-row-content strong,.bl-row-content small,.bl-row-content .bl-caption,.v4-log-tile-title';

  const blockOf = (root, el) => {
    for (let n = el; n && n !== root; n = n.parentElement) {
      if (n.parentElement?.classList.contains('bl-stack')) return n;
    }
    return null;
  };

  const copyEntrance = ctx => {
    if (ctx.dead || F.reduced() || ctx.via === 'back' || ctx.via === 'tab') return;
    const stack = ctx.root.querySelector('.bl-stack');
    if (!stack) return;
    const perBlock = new Map();
    let count = 0;
    for (const el of stack.querySelectorAll(COPY)) {
      if (count >= 16) break;
      if (el.closest(OWNED) || el.closest('.bl-heading,.bl-tabs,.bl-btn,.bl-chip,.v4-choice,.guide-option,[hidden]') || !el.textContent.trim()) continue;
      if (el.getAnimations().some(a => a.playState !== 'finished')) continue;
      const block = blockOf(stack, el);
      if (!block || block.hidden) continue;
      const row = el.closest('.bl-menu-row,.bl-row');
      const group = row || block;
      const within = perBlock.get(group) || 0;
      if (within >= (row ? 2 : 3)) continue;
      perBlock.set(group, within + 1);
      count++;
      const rowIndex = row ? [...row.parentElement.children].indexOf(row) : 0;
      const delay = Math.min(460, (block._v6 || 0) + 60 + Math.min(rowIndex, 4) * 36);
      const inline = getComputedStyle(el).display === 'inline';
      const frames = inline
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ opacity: 0, transform: 'translateY(3px)' }, { opacity: 1, transform: 'translateY(0)' }];
      ctx.track(el.animate(frames, {
        duration: 260 * F.k(), delay: delay * F.k(), easing: F.css('decel'), fill: 'backwards',
      }));
    }
  };

  const pressBubble = (ctx, button, clientX, clientY) => {
    if (F.reduced() || button.disabled || button.getAttribute('aria-disabled') === 'true') return;
    const r = button.getBoundingClientRect();
    if (!r.width || !r.height) return;
    const bubble = document.createElement('span');
    bubble.className = 'v8-press-bubble';
    bubble.setAttribute('aria-hidden', 'true');
    const x = Number.isFinite(clientX) ? clientX - r.left : r.width / 2;
    const y = Number.isFinite(clientY) ? clientY - r.top : r.height / 2;
    const size = Math.min(160, Math.max(90, r.height * 2.6));
    bubble.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
    button.append(bubble);
    const animation = ctx.track(bubble.animate([
      { transform: 'translate(-50%, -50%) scale(.08)', opacity: .18 },
      { transform: 'translate(-50%, -50%) scale(1)', opacity: 0 },
    ], { duration: 430 * F.k(), easing: F.css('strong'), fill: 'forwards' }));
    animation.finished.then(() => bubble.remove(), () => bubble.remove());
  };

  const touch = ctx => {
    ctx.on(ctx.root, 'pointerdown', e => {
      const button = e.target.closest('.bl-btn');
      if (button && ctx.root.contains(button)) pressBubble(ctx, button, e.clientX, e.clientY);
    });
    ctx.on(ctx.root, 'keydown', e => {
      if (e.repeat || !['Enter', ' '].includes(e.key)) return;
      const button = e.target.closest('.bl-btn');
      if (button && ctx.root.contains(button)) pressBubble(ctx, button);
    });
  };

  F.SCREENS.forEach(screen => {
    if (screen.seq || screen._feel08) return;
    screen._feel08 = true;
    const build = screen.build;
    screen.build = ctx => {
      build(ctx);
      touch(ctx);
      document.fonts.ready.then(() => requestAnimationFrame(() => copyEntrance(ctx)));
    };
  });
})();
