import { html, nothing } from "lit";
import { isRtl, localizedString, unwrapValue } from "./config.js";

const COPIES = 12;

/** Full-width announcement bar. `move` slides the sentence; `still` centers it. */
export function announceCss(prefix: string): string {
  return `
.${prefix}-ann.${prefix}-ann { overflow: hidden; border: 0; font-family: var(--font-main, inherit); background: var(--ann-bg, var(--color-primary, #1a1d21)); color: var(--ann-ink, var(--color-primary-reverse, #fff)); }
.${prefix}-ann__still { padding: .55rem 1rem; text-align: center; font-size: .92rem; font-weight: 700; line-height: 1.55; }
.${prefix}-ann__list { display: flex; margin: 0; padding: .5rem 0; list-style: none; white-space: nowrap; }
.${prefix}-ann__item { flex: none; display: flex; align-items: center; font-size: .92rem; font-weight: 700; line-height: 1.5; animation: ${prefix}-ann-ltr var(--ann-speed, 12s) linear infinite; }
.${prefix}-ann.is-rtl .${prefix}-ann__item { animation-name: ${prefix}-ann-rtl; }
.${prefix}-ann__list:hover .${prefix}-ann__item { animation-play-state: paused; }
.${prefix}-ann__text { padding-inline: 1rem; }
@keyframes ${prefix}-ann-ltr { to { transform: translateX(-100%); } }
@keyframes ${prefix}-ann-rtl { to { transform: translateX(100%); } }
@media (prefers-reduced-motion: reduce) {
  .${prefix}-ann__item { animation: none; }
  .${prefix}-ann__item[aria-hidden="true"] { display: none; }
  .${prefix}-ann__list { justify-content: center; }
}
`;
}

export function announceBar(cfg: Record<string, any>, prefix: string, extraClass = "", tone = "") {
  const text = localizedString(cfg.announce).trim();
  if (!text) return nothing;
  const moving = String(unwrapValue(cfg.announce_mode) || "move") !== "still";
  if (!moving) {
    return html`<div class="${prefix}-ann ${prefix}-ann__still ${extraClass}" style=${tone}>${text}</div>`;
  }
  const rtl = isRtl() ? " is-rtl" : "";
  return html`<div class="${prefix}-ann${rtl} ${extraClass}" style=${tone}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${text}</span></li>`)}
    </ul>
  </div>`;
}
