var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result) __defProp(target, key, result);
  return result;
};

// src/components/volt-bar/index.ts
import { html as html3, LitElement, nothing as nothing3 } from "lit";
import { property, state } from "lit/decorators.js";

// src/utils/config.ts
function getConfig(raw) {
  if (!raw) return {};
  if (raw.component && typeof raw.component === "object") return raw.component;
  return raw;
}
__name(getConfig, "getConfig");
function getLocale() {
  const lang = window.Salla?.lang?.getLocale?.() || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function isRtl() {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}
__name(isRtl, "isRtl");
function localizedString(value) {
  if (value === null || value === void 0 || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value;
    const text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text === "string" ? text : "";
  }
  return String(value);
}
__name(localizedString, "localizedString");
function t(strings) {
  return getLocale() === "ar" ? strings.ar : strings.en;
}
__name(t, "t");
function unwrapValue(value) {
  if (Array.isArray(value)) return unwrapValue(value[0]?.value ?? value[0] ?? "");
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value ?? "";
}
__name(unwrapValue, "unwrapValue");
function linkHref(value) {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return linkHref(value[0]);
  if (typeof value === "object") {
    const obj = value;
    if (obj.url) return linkHref(obj.url);
    if ("value" in obj) return linkHref(obj.value);
    if (obj.href) return linkHref(obj.href);
  }
  return "";
}
__name(linkHref, "linkHref");
function flag(value) {
  const raw = unwrapValue(value);
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const text = raw.trim().toLowerCase();
    return text === "true" || text === "1" || text === "on" || text === "yes";
  }
  return false;
}
__name(flag, "flag");
function getCollectionItems(items, prefix) {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== "object") return {};
    const normalized = {};
    for (const [key, val] of Object.entries(item)) {
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    }
    return normalized;
  });
}
__name(getCollectionItems, "getCollectionItems");
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  window.addEventListener("language-changed", update);
  return () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");

// src/utils/announce.ts
import { html, nothing } from "lit";
var COPIES = 12;
var ROTATE_MS = 4200;
var ANN_THUMB = {
  tile: { w: 28, h: 28 },
  bean: { w: 28, h: 28 },
  arch: { w: 24, h: 30 },
  slant: { w: 40, h: 26 }
};
var lookCss = /* @__PURE__ */ __name((p, look) => {
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
}, "lookCss");
function announceCss(prefix, look = "tile") {
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
__name(announceCss, "announceCss");
function announceTone(cfg) {
  const paint = /* @__PURE__ */ __name((key, variable) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  }, "paint");
  return [
    paint("announce_bg", "--ann-bg-light"),
    paint("announce_ink", "--ann-ink-light"),
    paint("announce_bg_dark", "--ann-bg-dark"),
    paint("announce_ink_dark", "--ann-ink-dark")
  ].filter(Boolean).join(";");
}
__name(announceTone, "announceTone");
function marquee(prefix, extraClass, style, body, own = false, go = "") {
  const rtl = isRtl();
  const back = go === (rtl ? "left" : "right");
  return html`<div class="${prefix}-ann${rtl ? " is-rtl" : ""}${back ? " is-back" : ""}${own ? " is-own" : ""} ${extraClass}" style=${style}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${body}</span></li>`)}
    </ul>
  </div>`;
}
__name(marquee, "marquee");
function readStrips(cfg) {
  if (!Array.isArray(cfg.bars)) {
    const text = localizedString(cfg.announce).trim();
    if (!text) return [];
    return [{ text, media: "none", icon: "", image: "", link: "", still: String(unwrapValue(cfg.announce_mode) || "move") === "still", go: "", bg: "", ink: "" }];
  }
  return getCollectionItems(cfg.bars, "bars").map((row) => {
    const kind = String(unwrapValue(row.media) || "none");
    const motion = String(unwrapValue(row.motion) || "right");
    return {
      text: localizedString(row.text).trim(),
      media: kind === "icon" || kind === "image" ? kind : "none",
      icon: String(unwrapValue(row.icon) || "").trim(),
      image: String(unwrapValue(row.image) || "").trim(),
      link: linkHref(row.link),
      still: motion === "still",
      go: motion === "left" || motion === "right" ? motion : "",
      bg: String(row.bg || "").trim(),
      ink: String(row.ink || "").trim()
    };
  }).filter((row) => row.text);
}
__name(readStrips, "readStrips");
function stripBody(prefix, look, row) {
  const box = ANN_THUMB[look];
  let media = nothing;
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
__name(stripBody, "stripBody");
function announceStrips(cfg, prefix, look, extraClass = "", tone = "") {
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
  return html`<div class="${prefix}-anns ${rotate ? "is-rotate" : "is-stack"}" style=${tone} data-ann-rotate=${rotate ? String(rows.length) : "0"} role="region" aria-label=${isRtl() ? "\u0625\u0639\u0644\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062A\u062C\u0631" : "Store announcements"}>${strips}</div>`;
}
__name(announceStrips, "announceStrips");
var timers = /* @__PURE__ */ new WeakMap();
function rotateStrips(root, prefix) {
  root.querySelectorAll(`.${prefix}-anns`).forEach((group) => {
    const count = Number(group.dataset.annRotate || 0);
    const running = timers.get(group);
    if (running && running.count === count) return;
    if (running) window.clearInterval(running.id);
    timers.delete(group);
    if (count < 2) return;
    let index = 0;
    if (!group.dataset.annHold) {
      group.dataset.annHold = "0";
      const hold = /* @__PURE__ */ __name((on) => () => {
        group.dataset.annHold = on ? "1" : "0";
      }, "hold");
      group.addEventListener("mouseenter", hold(true));
      group.addEventListener("mouseleave", hold(false));
      group.addEventListener("focusin", hold(true));
      group.addEventListener("focusout", hold(false));
    }
    const id = window.setInterval(() => {
      if (group.dataset.annHold === "1" || document.hidden) return;
      const items = [...group.children];
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
__name(rotateStrips, "rotateStrips");
function stopStrips(root, prefix) {
  root.querySelectorAll(`.${prefix}-anns`).forEach((group) => {
    const running = timers.get(group);
    if (running) window.clearInterval(running.id);
    timers.delete(group);
  });
}
__name(stopStrips, "stopStrips");

// src/utils/landing.ts
import { html as html2, nothing as nothing2 } from "lit";
var TONE_KEY = "sp-landing-tone";
function applyTone(mode) {
  document.documentElement.classList.remove("sp-mode-light", "sp-mode-dark");
  document.documentElement.classList.add(mode === "dark" ? "sp-mode-dark" : "sp-mode-light");
  try {
    localStorage.setItem(TONE_KEY, mode);
  } catch {
  }
  window.dispatchEvent(new CustomEvent("sp-tone"));
}
__name(applyTone, "applyTone");
function currentTone() {
  return document.documentElement.classList.contains("sp-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
function savedTone() {
  try {
    const saved = localStorage.getItem(TONE_KEY);
    return saved === "dark" || saved === "light" ? saved : "";
  } catch {
    return "";
  }
}
__name(savedTone, "savedTone");
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  if (scheme === "dark") return "sp-dark";
  if (scheme === "light") return "sp-light";
  return "sp-auto";
}
__name(schemeOf, "schemeOf");

// src/utils/styles.ts
function markEditing() {
  const root = document.documentElement;
  const read = /* @__PURE__ */ __name(() => {
    let on = true;
    try {
      const salla = window.Salla;
      on = window.self !== window.top || salla?.config?.get?.("page.is_landing_page") !== true;
    } catch {
      on = true;
    }
    root.dataset.lpEditing = on ? "1" : "0";
  }, "read");
  if (root.dataset.lpEditing) return;
  read();
  try {
    window.Salla?.onReady?.(read);
  } catch {
  }
}
__name(markEditing, "markEditing");
function injectStyles(id, css2) {
  markEditing();
  let style = document.getElementById(id);
  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }
  if (style.textContent !== css2) style.textContent = css2;
}
__name(injectStyles, "injectStyles");
function injectFonts() {
}
__name(injectFonts, "injectFonts");
function sectionStyle(cfg) {
  return cfg.bg_color ? `--sp-section-bg:${cfg.bg_color}` : "";
}
__name(sectionStyle, "sectionStyle");
function watchReveal(host) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) {
    host.querySelectorAll(".sp-rev").forEach((el) => el.classList.add("in"));
    return () => {
    };
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  const scan = /* @__PURE__ */ __name(() => host.querySelectorAll(".sp-rev:not(.in)").forEach((el) => io.observe(el)), "scan");
  const mo = new MutationObserver(scan);
  mo.observe(host, { childList: true, subtree: true });
  scan();
  return () => {
    io.disconnect();
    mo.disconnect();
  };
}
__name(watchReveal, "watchReveal");
var DARK = `--ink:#f4f7f8; --ink-soft:#a8b3ba; --page:#08090a; --paper:#14171a; --paper-2:#1c2024; --line:#242a2f; --line-2:#333b42; --muted:#717d85; --card:#14171a; --volt:#d4ff3f; --accent:var(--color-primary, #d4ff3f); --volt-ink:#121500; --ice:#4fd1ff; --hot:#ff3b47;`;
var LIGHT = `--ink:#14180f; --ink-soft:#3d4636; --page:#f4f6f1; --paper:#ffffff; --paper-2:#eef2e6; --line:#d7dece; --line-2:#c5ceba; --muted:#66705d; --card:#ffffff; --volt:#d4ff3f; --accent:var(--color-primary, #4f6d00); --volt-ink:#121500; --ice:#0b7ea8; --hot:#d21f2b;`;
var baseCss = `
html[data-lp-editing="0"] .sp-empty, html[data-lp-editing="0"] .sp-hint { display: none !important; }
.sp-host { display: block; width: 100%; min-width: 0; container-type: inline-size; }
body:has(.sp-host) { background: #08090a; }
html.sp-mode-light body:has(.sp-host) { background: #f4f6f1; }
.component-card:has(> .sp-host:not(:empty)) { min-height: 0; }
.sp-root {
  ${DARK}
  --max:1280px; --pad:1rem; --r:8px;
  --disp:inherit; --body:inherit;
  --diag:repeating-linear-gradient(135deg,rgba(212,255,63,.16) 0 10px,transparent 10px 20px);
  display: block; box-sizing: border-box; color: var(--ink);
  font-family: var(--font-main, inherit); font-weight: 400; line-height: 1.85;
  -webkit-font-smoothing: antialiased;
}
html.sp-mode-light .sp-root.sp-auto, .sp-root.sp-light { ${LIGHT} }
html.sp-mode-dark .sp-root.sp-auto, .sp-root.sp-dark { ${DARK} }
.sp-root *, .sp-root *::before, .sp-root *::after { box-sizing: border-box; }
.sp-root img { max-width: 100%; display: block; }
.sp-root a { color: inherit; text-decoration: none; }
.sp-root h1, .sp-root h2, .sp-root h3, .sp-root h4, .sp-root p, .sp-root ul { margin: 0; }
.sp-root button, .sp-root a, .sp-root input { font: inherit; color: inherit; }
.sp-root a.sp-btn, .sp-root button.sp-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: .5rem;
  min-height: 3rem; padding: .75rem 1.75rem; border-radius: var(--r); border: 0; cursor: pointer;
  font: inherit; font-weight: 700; font-size: 1rem; line-height: 1.2; text-decoration: none;
  background: var(--color-primary, var(--volt)); color: var(--color-primary-reverse, var(--volt-ink));
  transition: transform .16s, opacity .2s;
}
.sp-root a.sp-btn:hover, .sp-root button.sp-btn:hover { transform: translateY(-1px); opacity: .92; background: var(--color-primary, var(--volt)); color: var(--color-primary-reverse, var(--volt-ink)); }
.sp-root a.sp-btn.ghost, .sp-root button.sp-btn.ghost { background: transparent; color: var(--ink); box-shadow: inset 0 0 0 1.5px var(--line-2); }
.sp-root a.sp-btn.ghost:hover, .sp-root button.sp-btn.ghost:hover { box-shadow: inset 0 0 0 1.5px var(--volt); color: var(--accent); background: transparent; }
.sp-root :focus-visible { outline: 3px solid var(--volt); outline-offset: 2px; }
.sp-wrap { width: 100%; max-width: var(--max); margin-inline: auto; padding-inline: var(--pad); }
.sp-sec { padding-block: 2.5rem; }
.sp-head { margin-block-end: 1.75rem; display: flex; flex-direction: column; align-items: center; text-align: center; gap: .5rem; }
.sp-no { font-weight: 700; font-size: .9rem; color: var(--accent); letter-spacing: .14em; }
.sp-h2 { font-weight: 700; font-size: 1.75rem; line-height: 1.3; margin: 0; }
.sp-lead { color: var(--ink-soft); font-size: 1rem; line-height: 1.7; max-width: 46ch; margin-inline: auto; }
@container (min-width: 768px) {
  .sp-sec { padding-block: 3.5rem; }
  .sp-h2 { font-size: 2.25rem; }
}
.sp-rev { opacity: 0; transform: translateY(22px); transition: opacity .6s ease, transform .6s ease; }
.sp-rev.in { opacity: 1; transform: none; }
.sp-empty { padding: 1.2rem; border: 1px dashed var(--line-2); color: var(--muted); text-align: center; border-radius: var(--r); }
@media (prefers-reduced-motion: reduce) {
  .sp-rev { opacity: 1; transform: none; transition: none; }
  .sp-root * { animation: none !important; }
}
`;

// src/components/volt-bar/index.ts
var css = `
header.sp-bar { position: relative; background: var(--sp-section-bg, color-mix(in srgb, var(--page) 92%, transparent)); border-bottom: 1px solid var(--line); }
header.sp-bar.is-clear { background: transparent; border-bottom-color: transparent; }
.sp-nav { position: relative; display: flex; align-items: center; justify-content: center; min-height: calc(var(--sp-logo, 52px) + 1.5rem); padding-block: .75rem; }
.sp-nav.is-start { justify-content: flex-start; }
.sp-logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.35rem; line-height: 1; color: inherit; text-decoration: none; }
.sp-logo img { height: var(--sp-logo, 52px); width: auto; max-width: 60vw; object-fit: contain; }
.sp-mark { width: 38px; height: 38px; border-radius: var(--r); background: var(--color-primary, var(--volt)); color: var(--color-primary-reverse, #121500); display: grid; place-items: center; font-weight: 800; }
.sp-text-link { position: absolute; inset-inline-start: 0; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--ink-soft); }
.sp-text-link:hover { color: var(--accent); }
.sp-tone { position: absolute; inset-inline-end: 0; top: 50%; width: 2.5rem; height: 2.5rem; margin-top: -1.25rem; border: 0; border-radius: var(--r); background: transparent; color: inherit; display: grid; place-items: center; cursor: pointer; padding: 0; }
.sp-tone svg { width: 22px; height: 22px; }
@container (max-width: 640px) { .sp-text-link { display: none; } }
`;
var _PageBar = class _PageBar extends LitElement {
  constructor() {
    super(...arguments);
    this.dark = false;
    this.stop = /* @__PURE__ */ __name(() => {
    }, "stop");
    this.pinned = null;
    this.opened = [];
    this.modeKey = "";
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-announce", announceCss("sp", "slant"));
    injectStyles("sp-page-bar", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    const onTone = /* @__PURE__ */ __name(() => {
      this.dark = currentTone() === "dark";
    }, "onTone");
    window.addEventListener("sp-tone", onTone);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.removeEventListener("sp-tone", onTone);
      this.release();
    };
  }
  willUpdate() {
    const cfg = getConfig(this.config);
    const key = `${unwrapValue(cfg.default_mode) || "light"}|${this.showMode(cfg)}`;
    if (key === this.modeKey) return;
    this.modeKey = key;
    applyTone(this.openingMode(cfg));
    this.dark = currentTone() === "dark";
  }
  disconnectedCallback() {
    stopStrips(this, "sp");
    this.stop();
    super.disconnectedCallback();
  }
  updated() {
    rotateStrips(this, "sp");
    this.pin();
  }
  showMode(cfg) {
    if (cfg.show_mode_toggle == null || cfg.show_mode_toggle === "") return true;
    return flag(cfg.show_mode_toggle);
  }
  openingMode(cfg) {
    const base = String(unwrapValue(cfg.default_mode) || "light");
    if (this.showMode(cfg)) {
      const saved = savedTone();
      if (saved) return saved;
    }
    if (base === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return base === "light" ? "light" : "dark";
  }
  place(run) {
    const view = this.ownerDocument.defaultView;
    if (!view) {
      run();
      return;
    }
    const nodes = /* @__PURE__ */ new Set([this.ownerDocument.documentElement, this.ownerDocument.body]);
    if (this.ownerDocument.scrollingElement) nodes.add(this.ownerDocument.scrollingElement);
    let node = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    const marks = [...nodes].map((el) => [el, el.scrollTop]);
    const x = view.scrollX;
    const y = view.scrollY;
    const put = /* @__PURE__ */ __name(() => {
      for (const [el, top] of marks) if (el.scrollTop !== top) el.scrollTop = top;
      if (Math.abs(view.scrollY - y) > 1 || Math.abs(view.scrollX - x) > 1) view.scrollTo(x, y);
    }, "put");
    run();
    put();
    view.requestAnimationFrame(() => {
      put();
      view.requestAnimationFrame(put);
    });
  }
  outerBox() {
    let node = this;
    while (node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement) {
      const parent = node.parentElement;
      const sections = [...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
      if (sections.length > 1) return node;
      node = parent;
    }
    return node;
  }
  pin() {
    const cfg = getConfig(this.config);
    const sticky = cfg.sticky == null || cfg.sticky === "" ? true : flag(cfg.sticky);
    const trans = flag(cfg.transparent);
    const outer = this.outerBox();
    if (this.pinned && this.pinned !== outer) this.release();
    this.pinned = outer;
    outer.style.position = sticky ? "sticky" : trans ? "relative" : "";
    outer.style.top = sticky ? "0" : "";
    outer.style.zIndex = sticky || trans ? "40" : "";
    outer.style.marginBottom = trans ? `-${this.offsetHeight}px` : "";
    this.opened.forEach((el) => {
      el.style.overflow = "";
    });
    this.opened = [];
    if (!sticky) return;
    let node = outer.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const flow = getComputedStyle(node);
      if (flow.overflowY === "auto" || flow.overflowY === "scroll") break;
      if (flow.overflowY === "hidden" || flow.overflowX === "hidden") {
        node.style.overflow = "clip";
        this.opened.push(node);
      }
      node = node.parentElement;
    }
  }
  release() {
    if (this.pinned) {
      this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = this.pinned.style.marginBottom = "";
      this.pinned = null;
    }
    this.opened.forEach((el) => {
      el.style.overflow = "";
    });
    this.opened = [];
  }
  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || window.Salla?.config?.get?.("store.name") || "";
    const badge = localizedString(cfg.badge) || "\u0642";
    const linkLabel = localizedString(cfg.link_label);
    const linkUrl = linkHref(cfg.link_url);
    const logo = this.dark && cfg.logo_dark || cfg.logo;
    const height = Math.min(Math.max(Number(cfg.logo_height) || 52, 28), 120);
    const start = String(unwrapValue(cfg.align) || "center") === "start";
    const clear = flag(cfg.transparent);
    return html3`
      ${announceStrips(cfg, "sp", "slant", `sp-root ${schemeOf(cfg)}`, announceTone(cfg))}
      <header class=${`sp-root sp-bar ${schemeOf(cfg)} ${clear ? "is-clear" : ""}`} style=${`${sectionStyle(cfg)};--sp-logo:${height}px`}>
        <div class="sp-nav sp-wrap ${start ? "is-start" : ""}">
          ${linkLabel && linkUrl ? html3`<a class="sp-text-link" href=${linkUrl}>${linkLabel}</a>` : nothing3}
          <a href=${linkHref(cfg.home_url) || "#"} class="sp-logo" aria-label=${brand}>
            ${logo ? html3`<img src=${logo} alt=${brand} />` : html3`<span class="sp-mark">${badge}</span>${brand}`}
          </a>
          ${this.showMode(cfg) ? html3`<button type="button" class="sp-tone" aria-pressed=${this.dark ? "true" : "false"} aria-label=${this.dark ? t({ ar: "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u0641\u0627\u062A\u062D", en: "Switch to light mode" }) : t({ ar: "\u0627\u0644\u062A\u0628\u062F\u064A\u0644 \u0625\u0644\u0649 \u0627\u0644\u0648\u0636\u0639 \u0627\u0644\u062F\u0627\u0643\u0646", en: "Switch to dark mode" })} @mousedown=${(event) => event.preventDefault()} @click=${() => this.place(() => {
      applyTone(this.dark ? "light" : "dark");
      this.dark = currentTone() === "dark";
    })}>
            ${this.dark ? html3`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" /></g></svg>` : html3`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 2.4a9 9 0 1 0 7.1 13.6A8 8 0 0 1 14.5 2.4z" /></svg>`}
          </button>` : nothing3}
        </div>
      </header>`;
  }
};
__name(_PageBar, "PageBar");
__decorateClass([
  property({ type: Object })
], _PageBar.prototype, "config", 2);
__decorateClass([
  state()
], _PageBar.prototype, "dark", 2);
var PageBar = _PageBar;
export {
  PageBar as default
};
typeof PageBar < "u" && PageBar.registerSallaComponent("salla-volt-bar");
