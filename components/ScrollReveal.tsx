'use client';

// ScrollReveal — a tiny, zero-dependency "AOS-like" reveal-on-scroll engine.
//
// Why not the `aos` npm package: AOS ships ~14KB and drives its animations off
// throttled SCROLL listeners, which adds cost to every scroll frame. This does
// the same visual effect with an IntersectionObserver (near-zero scroll cost),
// GPU-only transforms/opacity, and no dependency.
//
// Contract (matches the site's performance philosophy):
//  • Content is ALWAYS visible without JS — the pre-animation hidden state in
//    globals.css is gated behind `html.aos-on`, which is only added here once JS
//    runs. So SEO crawlers / no-JS users see everything.
//  • Respects prefers-reduced-motion (never hides content for those users).
//  • Re-scans on route change (App Router keeps this mounted across navigations).
//  • Each element is revealed once, then unobserved — no lingering work.
//
// Usage: put `data-aos="fade-up"` (or fade, fade-down, fade-left, fade-right,
// zoom-in) on any BELOW-the-fold element. Optional `data-aos-delay="100"` (ms).
// Do NOT tag the hero / first paint — keep LCP instant and flash-free.

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !('IntersectionObserver' in window)) {
      // Motion-sensitive or ancient browser → never hide anything.
      root.classList.remove('aos-on');
      return;
    }

    root.classList.add('aos-on');

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).classList.add('aos-in');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    // Wait one frame so freshly-rendered route content is in the DOM.
    const raf = window.requestAnimationFrame(() => {
      // Auto-tag every major content block on EVERY page — no per-page edits.
      // We start at the page root (#main-content) and take its top-level blocks;
      // if the page nests everything in a single wrapper we descend into it so we
      // tag real content blocks, not one giant node. Safety rails:
      //   • Skip anything already visible on load (hero / above-fold) → never
      //     hide painted content, never touch the LCP, never flash.
      //   • Respect explicit data-aos="…" tags (skip already-tagged nodes).
      //   • Only tag sizeable block elements (skip scripts / tiny / hidden nodes).
      const fold = window.innerHeight * 0.9;
      const vh = window.innerHeight || 800;
      const root =
        document.getElementById('main-content') || document.querySelector('main');
      const SKIP = /^(SCRIPT|STYLE|LINK|NOSCRIPT|TEMPLATE|HEADER|FOOTER|NAV|SVG|PATH)$/;

      // Collect the real content BLOCKS of whatever page is mounted, regardless
      // of its shape. Pages differ: some list several top-level sections, others
      // (the loan pages) nest everything inside one big <div>. So we descend into
      // any very-tall structural wrapper (> 1.5 screens) to reach the blocks
      // inside it, and collect normal-sized blocks as units. Explicit data-aos
      // tags are respected (we don't descend past or re-tag them).
      const targets: HTMLElement[] = [];
      const collect = (parent: Element, depth: number) => {
        if (targets.length > 60) return;
        Array.prototype.forEach.call(
          Array.prototype.slice.call(parent.children),
          (el: Element) => {
            const node = el as HTMLElement;
            if (SKIP.test(node.tagName) || node.hasAttribute('data-aos')) return;
            const rect = node.getBoundingClientRect();
            if (rect.height < 24) return; // decorative / empty
            if (rect.height > vh * 1.5 && depth < 3 && node.children.length > 0) {
              collect(node, depth + 1); // structural wrapper → go deeper
              return;
            }
            targets.push(node);
          },
        );
      };
      if (root) collect(root, 0);

      // Tag only the below-the-fold blocks — above-fold content stays visible
      // (no flash, LCP untouched). Then observe everything tagged.
      Array.prototype.forEach.call(targets, (node: HTMLElement) => {
        if (node.getBoundingClientRect().top < fold) return;
        node.setAttribute('data-aos', 'fade-up');
      });

      const els = document.querySelectorAll('[data-aos]:not(.aos-in)');
      Array.prototype.forEach.call(els, (el: Element) => {
        const delay = (el as HTMLElement).dataset.aosDelay;
        if (delay) (el as HTMLElement).style.transitionDelay = `${delay}ms`;
        io.observe(el);
      });
    });

    return () => {
      window.cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
