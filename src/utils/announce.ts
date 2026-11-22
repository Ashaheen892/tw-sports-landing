import { html, nothing } from "lit";
import { getCollectionItems, isRtl, linkHref, localizedString, unwrapValue } from "./config.js";

const COPIES = 12;
const ROTATE_MS = 4200;

/**
 * Each page draws its header strips in its own shape:
 * tile = rounded square + dot (saji), bean = circle + bean mark (coffee),
 * arch = portrait arch + diamond (nasaq), slant = slanted card + slash (sports).
 */
export type AnnLook = "tile" | "bean" | "arch" | "slant";

/** Thumbnail box per look, in CSS pixels. The suggested upload is four times this box, for sharp phones. */
export const ANN_THUMB: Record<AnnLook, { w: number; h: number }> = {
  tile: { w: 28, h: 28 },
  bean: { w: 28, h: 28 },
  arch: { w: 24, h: 30 },
  slant: { w: 40, h: 26 },
};

const lookCss = (p: string, look: AnnLook) => {
  const box = ANN_THUMB[look];
  const size = `.${p}-ann__media { width: ${box.w}px; height: ${box.h}px; }`;
  if (look === "bean") return `${size}
.${p}-ann__media { border-radius: 50%; box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 30%, transparent); }
.${p}-ann__item .${p}-ann__text::after { width: .55rem; height: .32rem; border-radius: 50%; transform: rotate(-35deg); box-shadow: inset 1px 0 0 color-mix(in srgb, var(--ann-fill) 70%, transparent); }
.${p}-anns.is-stack > .${p}-ann + .${p}-ann { box-shadow: none; background-image: linear-gradient(90deg, color-mix(in srgb, currentColor 35%, transparent) 50%, transparent 0); background-size: 10px 1px; background-repeat: repeat-x; }`;
  if (look === "arch") return `${size}
.${p}-ann__media { border-radius: 999px 999px 3px 3px; outline: 1px solid color-mix(in srgb, currentColor 45%, transparent); outline-offset: 2px; }
.${p}-ann__label { letter-spacing: .02em; }
.${p}-ann__item .${p}-ann__text::after { width: .38rem; height: .38rem; border-radius: 0; transform: rotate(45deg); opacity: .7; }`;
  if (look === "slant") return `${size}
.${p}-ann__media { border-radius: 0; clip-path: polygon(16% 0, 100% 0, 84% 100%, 0 100%); }
.${p}-ann__label { font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: .03em; }
.${p}-ann__item .${p}-ann__text::after { content: "/"; width: auto; height: auto; border-radius: 0; background: none; font-weight: 900; font-style: normal; opacity: .6; }`;
  return `${size}
.${p}-ann__media { border-radius: 7px; }`;
};

/** Full-width announcement strips. Empty merchant colors fall through to the store primary. */
export function announceCss(prefix: string, look: AnnLook = "tile"): string {
  const p = prefix;
  return `
.${p}-ann.${p}-ann {
  --ann-fill: var(--ann-bg-light, var(--ann-bg, var(--color-primary)));
  --ann-text: var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff)));
  overflow: hidden;
  padding-block: 5px;
  border: 0;
  font-family: var(--font-main, inherit);
  background: var(--ann-fill);
  color: var(--ann-text);
}
html.${p}-mode-dark .${p}-ann.${p}-auto, .${p}-ann.${p}-dark {
  --ann-fill: var(--ann-bg-dark, var(--ann-bg-light, var(--ann-bg, var(--color-primary))));
  --ann-text: var(--ann-ink-dark, var(--ann-ink-light, var(--ann-ink, var(--color-primary-reverse, #fff))));
}
.${p}-ann__still {
  display: flex;
  justify-content: center;
  padding: 5px 1.5rem;
  text-align: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
}
.${p}-ann__list {
  display: flex;
  align-items: center;
  margin: 0;
  padding: 5px 0;
  list-style: none;
  white-space: nowrap;
}
.${p}-ann__item {
  flex: none;
  display: flex;
  align-items: center;
  font-size: 15px;
  font-weight: 500;
  line-height: 26px;
  animation: ${p}-ann-ltr var(--ann-speed, 18s) linear infinite;
}
.${p}-ann.is-rtl .${p}-ann__item { animation-name: ${p}-ann-rtl; }
.${p}-ann.is-back .${p}-ann__item { animation-name: ${p}-ann-ltr-back; }
.${p}-ann.is-rtl.is-back .${p}-ann__item { animation-name: ${p}-ann-rtl-back; }
.${p}-ann__list:hover .${p}-ann__item { animation-play-state: paused; }
.${p}-ann__text {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  padding-inline: 1.5rem;
}
.${p}-ann__item .${p}-ann__text::after {
  content: "";
  width: .35rem;
  height: .35rem;
  margin-inline-start: .9rem;
  border-radius: 50%;
  background: currentColor;
  opacity: .55;
  flex: none;
}
.${p}-ann__still .${p}-ann__text { padding-inline: 0; }
.${p}-ann__link { display: inline-flex; align-items: center; gap: .6rem; color: inherit; text-decoration: none; }
.${p}-ann__link:hover .${p}-ann__label { text-decoration: underline; text-underline-offset: 3px; }
.${p}-ann__link:focus-visible { outline: 2px solid currentColor; outline-offset: 2px; }
.${p}-ann__media {
  flex: none;
  display: inline-grid;
  place-items: center;
  overflow: hidden;
  background: color-mix(in srgb, currentColor 16%, transparent);
}
.${p}-ann__media img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${p}-ann__media i { font-size: 15px; line-height: 1; }
.${p}-ann__media.is-hint {
  width: auto;
  padding-inline: .45rem;
  border: 1px dashed currentColor;
  background: color-mix(in srgb, currentColor 10%, transparent);
  clip-path: none;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  direction: ltr;
}
.${p}-anns { display: grid; }
.${p}-anns.is-stack > .${p}-ann + .${p}-ann { box-shadow: inset 0 1px 0 color-mix(in srgb, currentColor 18%, transparent); }
.${p}-anns.is-stack > .${p}-ann:nth-child(even):not(.is-own) { background-color: color-mix(in srgb, var(--ann-fill) 84%, #000); }
.${p}-anns.is-rotate > .${p}-ann { grid-area: 1 / 1; opacity: 0; visibility: hidden; transition: opacity .45s ease, visibility 0s linear .45s; }
.${p}-anns.is-rotate > .${p}-ann.is-on { opacity: 1; visibility: visible; transition: opacity .45s ease; }
@keyframes ${p}-ann-ltr { to { transform: translateX(-100%); } }
@keyframes ${p}-ann-rtl { to { transform: translateX(100%); } }
@keyframes ${p}-ann-ltr-back { from { transform: translateX(-100%); } to { transform: translateX(0); } }
@keyframes ${p}-ann-rtl-back { from { transform: translateX(100%); } to { transform: translateX(0); } }
@media (prefers-reduced-motion: reduce) {
  .${p}-ann .${p}-ann__item { animation: none !important; }
  .${p}-ann__item[aria-hidden="true"] { display: none; }
  .${p}-ann__list { justify-content: center; }
  .${p}-ann__item .${p}-ann__text::after { display: none; }
  .${p}-anns.is-rotate > .${p}-ann { transition: none; }
}
${lookCss(p, look)}
`;
}

/** The merchant's own strip colors, used by the footer strip and as the header default. */
export function announceTone(cfg: Record<string, any>): string {
  const paint = (key: string, variable: string) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  };
  return [
    paint("announce_bg", "--ann-bg-light"),
    paint("announce_ink", "--ann-ink-light"),
    paint("announce_bg_dark", "--ann-bg-dark"),
    paint("announce_ink_dark", "--ann-ink-dark"),
  ].filter(Boolean).join(";");
}

/**
 * `go` is where the words travel on screen. The copies are laid out in the page direction,
 * so travelling against it starts one copy early and slides back to zero, leaving no gap.
 */
function marquee(prefix: string, extraClass: string, style: string, body: unknown, own = false, go: "left" | "right" | "" = "") {
  const rtl = isRtl();
  const back = go === (rtl ? "left" : "right");
  return html`<div class="${prefix}-ann${rtl ? " is-rtl" : ""}${back ? " is-back" : ""}${own ? " is-own" : ""} ${extraClass}" style=${style}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${body}</span></li>`)}
    </ul>
  </div>`;
}

/** Single text strip (footer). */
export function announceBar(cfg: Record<string, any>, prefix: string, extraClass = "", tone = "") {
  const text = localizedString(cfg.announce).trim();
  if (!text) return nothing;
  const moving = String(unwrapValue(cfg.announce_mode) || "move") !== "still";
  if (!moving) {
    return html`<div class="${prefix}-ann ${prefix}-ann__still ${extraClass}" style=${tone}><span class="${prefix}-ann__text">${text}</span></div>`;
  }
  return marquee(prefix, extraClass, tone, text);
}

type Strip = {
  text: string;
  media: "none" | "icon" | "image";
  icon: string;
  image: string;
  link: string;
  still: boolean;
  go: "left" | "right" | "";
  bg: string;
  ink: string;
};

/** Header strips from the `bars` list; a header saved before the list existed keeps its one `announce` line. */
export function readStrips(cfg: Record<string, any>): Strip[] {
  if (!Array.isArray(cfg.bars)) {
    const text = localizedString(cfg.announce).trim();
    if (!text) return [];
    return [{ text, media: "none", icon: "", image: "", link: "", still: String(unwrapValue(cfg.announce_mode) || "move") === "still", go: "", bg: "", ink: "" }];
  }
  return getCollectionItems<Record<string, any>>(cfg.bars, "bars")
    .map((row) => {
      const kind = String(unwrapValue(row.media) || "none");
      const motion = String(unwrapValue(row.motion) || "right");
      return {
        text: localizedString(row.text).trim(),
        media: (kind === "icon" || kind === "image" ? kind : "none") as Strip["media"],
        icon: String(unwrapValue(row.icon) || "").trim(),
        image: String(unwrapValue(row.image) || "").trim(),
        link: linkHref(row.link),
        still: motion === "still",
        go: (motion === "left" || motion === "right" ? motion : "") as Strip["go"],
        bg: String(row.bg || "").trim(),
        ink: String(row.ink || "").trim(),
      };
    })
    .filter((row) => row.text);
}

function stripBody(prefix: string, look: AnnLook, row: Strip) {
  const box = ANN_THUMB[look];
  let media: unknown = nothing;
  if (row.media === "icon" && row.icon) {
    media = html`<span class="${prefix}-ann__media is-icon" aria-hidden="true"><i class=${row.icon}></i></span>`;
  } else if (row.media === "image" && row.image) {
    media = html`<span class="${prefix}-ann__media"><img src=${row.image} alt="" width=${box.w * 2} height=${box.h * 2} loading="lazy" decoding="async" /></span>`;
  } else if (row.media === "image") {
    media = html`<span class="${prefix}-ann__media is-hint ${prefix}-hint" aria-hidden="true">${box.w * 4}×${box.h * 4}</span>`;
  }
  const inner = html`${media}<span class="${prefix}-ann__label">${row.text}</span>`;
  return row.link ? html`<a class="${prefix}-ann__link" href=${row.link}>${inner}</a>` : inner;
}

/** Header strips: stacked one under the other, or one strip that changes every few seconds. */
export function announceStrips(cfg: Record<string, any>, prefix: string, look: AnnLook, extraClass = "", tone = "") {
  const rows = readStrips(cfg);
  if (!rows.length) return nothing;
  const rotate = rows.length > 1 && String(unwrapValue(cfg.bars_layout) || "stack") === "rotate";
  const strips = rows.map((row, index) => {
    const own = Boolean(row.bg || row.ink);
    const style = [row.bg ? `--ann-fill:${row.bg}` : "", row.ink ? `--ann-text:${row.ink}` : ""].filter(Boolean).join(";");
    const body = stripBody(prefix, look, row);
    if (row.still || rotate) {
      const on = rotate && index === 0 ? " is-on" : "";
      return html`<div class="${prefix}-ann ${prefix}-ann__still${own ? " is-own" : ""}${on} ${extraClass}" style=${style} aria-hidden=${rotate && index ? "true" : "false"}><span class="${prefix}-ann__text">${body}</span></div>`;
    }
    return marquee(prefix, extraClass, style, body, own, row.go);
  });
  return html`<div class="${prefix}-anns ${rotate ? "is-rotate" : "is-stack"}" style=${tone} data-ann-rotate=${rotate ? String(rows.length) : "0"} role="region" aria-label=${isRtl() ? "إعلانات المتجر" : "Store announcements"}>${strips}</div>`;
}

const timers = new WeakMap<Element, { id: number; count: number }>();

/** Starts or restarts the rotation of every rotating strip group inside `root`. */
export function rotateStrips(root: HTMLElement, prefix: string) {
  root.querySelectorAll<HTMLElement>(`.${prefix}-anns`).forEach((group) => {
    const count = Number(group.dataset.annRotate || 0);
    const running = timers.get(group);
    if (running && running.count === count) return;
    if (running) window.clearInterval(running.id);
    timers.delete(group);
    if (count < 2) return;
    let index = 0;
    if (!group.dataset.annHold) {
      group.dataset.annHold = "0";
      const hold = (on: boolean) => () => { group.dataset.annHold = on ? "1" : "0"; };
      group.addEventListener("mouseenter", hold(true));
      group.addEventListener("mouseleave", hold(false));
      group.addEventListener("focusin", hold(true));
      group.addEventListener("focusout", hold(false));
    }
    const id = window.setInterval(() => {
      if (group.dataset.annHold === "1" || document.hidden) return;
      const items = [...group.children] as HTMLElement[];
      if (!items.length) return;
      index = (index + 1) % items.length;
      items.forEach((item, at) => {
        item.classList.toggle("is-on", at === index);
        item.setAttribute("aria-hidden", at === index ? "false" : "true");
      });
    }, ROTATE_MS);
    timers.set(group, { id, count });
  });
}

export function stopStrips(root: HTMLElement, prefix: string) {
  root.querySelectorAll<HTMLElement>(`.${prefix}-anns`).forEach((group) => {
    const running = timers.get(group);
    if (running) window.clearInterval(running.id);
    timers.delete(group);
  });
}
