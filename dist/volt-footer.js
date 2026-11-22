var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
import { property, state } from "lit/decorators.js";
function getConfig(raw) {
  return raw ? raw.component && typeof raw.component == "object" ? raw.component : raw : {};
}
__name(getConfig, "getConfig");
function getLocale() {
  var _a, _b, _c;
  const lang = ((_c = (_b = (_a = window.Salla) == null ? void 0 : _a.lang) == null ? void 0 : _b.getLocale) == null ? void 0 : _c.call(_b)) || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}
__name(getLocale, "getLocale");
function isRtl() {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}
__name(isRtl, "isRtl");
function localizedString(value) {
  if (value == null || value === "") return "";
  if (typeof value == "string") return value;
  if (typeof value == "object") {
    const obj = value, text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text == "string" ? text : "";
  }
  return String(value);
}
__name(localizedString, "localizedString");
function t(strings) {
  return getLocale() === "ar" ? strings.ar : strings.en;
}
__name(t, "t");
function unwrapValue(value) {
  var _a;
  return Array.isArray(value) ? unwrapValue(((_a = value[0]) == null ? void 0 : _a.value) ?? value[0] ?? "") : value && typeof value == "object" && "value" in value ? value.value : value ?? "";
}
__name(unwrapValue, "unwrapValue");
function linkHref(value) {
  if (value == null || value === "") return "";
  if (typeof value == "string") return value.trim();
  if (Array.isArray(value)) return linkHref(value[0]);
  if (typeof value == "object") {
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
  if (raw === !0 || raw === 1) return !0;
  if (typeof raw == "string") {
    const text = raw.trim().toLowerCase();
    return text === "true" || text === "1" || text === "on" || text === "yes";
  }
  return !1;
}
__name(flag, "flag");
function getCollectionItems(items, prefix) {
  return Array.isArray(items) ? items.map((item) => {
    if (!item || typeof item != "object") return {};
    const normalized = {};
    for (const [key, val] of Object.entries(item))
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    return normalized;
  }) : [];
}
__name(getCollectionItems, "getCollectionItems");
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  return window.addEventListener("language-changed", update), () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");
const COPIES = 12, ANN_THUMB = {
  tile: { w: 28, h: 28 },
  bean: { w: 28, h: 28 },
  arch: { w: 24, h: 30 },
  slant: { w: 40, h: 26 }
}, lookCss = /* @__PURE__ */ __name((p, look) => {
  const box = ANN_THUMB[look], size = `.${p}-ann__media { width: ${box.w}px; height: ${box.h}px; }`;
  return look === "bean" ? `${size}
.${p}-ann__media { border-radius: 50%; box-shadow: 0 0 0 2px color-mix(in srgb, currentColor 30%, transparent); }
.${p}-ann__item .${p}-ann__text::after { width: .55rem; height: .32rem; border-radius: 50%; transform: rotate(-35deg); box-shadow: inset 1px 0 0 color-mix(in srgb, var(--ann-fill) 70%, transparent); }
.${p}-anns.is-stack > .${p}-ann + .${p}-ann { box-shadow: none; background-image: linear-gradient(90deg, color-mix(in srgb, currentColor 35%, transparent) 50%, transparent 0); background-size: 10px 1px; background-repeat: repeat-x; }` : look === "arch" ? `${size}
.${p}-ann__media { border-radius: 999px 999px 3px 3px; outline: 1px solid color-mix(in srgb, currentColor 45%, transparent); outline-offset: 2px; }
.${p}-ann__label { letter-spacing: .02em; }
.${p}-ann__item .${p}-ann__text::after { width: .38rem; height: .38rem; border-radius: 0; transform: rotate(45deg); opacity: .7; }` : look === "slant" ? `${size}
.${p}-ann__media { border-radius: 0; clip-path: polygon(16% 0, 100% 0, 84% 100%, 0 100%); }
.${p}-ann__label { font-weight: 800; font-style: italic; text-transform: uppercase; letter-spacing: .03em; }
.${p}-ann__item .${p}-ann__text::after { content: "/"; width: auto; height: auto; border-radius: 0; background: none; font-weight: 900; font-style: normal; opacity: .6; }` : `${size}
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
  const paint2 = /* @__PURE__ */ __name((key, variable) => {
    const value = String(cfg[key] || "").trim();
    return value ? `${variable}:${value}` : "";
  }, "paint");
  return [
    paint2("announce_bg", "--ann-bg-light"),
    paint2("announce_ink", "--ann-ink-light"),
    paint2("announce_bg_dark", "--ann-bg-dark"),
    paint2("announce_ink_dark", "--ann-ink-dark")
  ].filter(Boolean).join(";");
}
__name(announceTone, "announceTone");
function marquee(prefix, extraClass, style, body, own = !1, go = "") {
  const rtl = isRtl();
  return html`<div class="${prefix}-ann${rtl ? " is-rtl" : ""}${go === (rtl ? "left" : "right") ? " is-back" : ""}${own ? " is-own" : ""} ${extraClass}" style=${style}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${body}</span></li>`)}
    </ul>
  </div>`;
}
__name(marquee, "marquee");
function announceBar(cfg, prefix, extraClass = "", tone = "") {
  const text = localizedString(cfg.announce).trim();
  return text ? String(unwrapValue(cfg.announce_mode) || "move") !== "still" ? marquee(prefix, extraClass, tone, text) : html`<div class="${prefix}-ann ${prefix}-ann__still ${extraClass}" style=${tone}><span class="${prefix}-ann__text">${text}</span></div>` : nothing;
}
__name(announceBar, "announceBar");
const WA = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>', UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 19V8.8L7.4 12.4 6 11l6-6 6 6-1.4 1.4L13 8.8V19h-2Z"></path></svg>';
function shown(value) {
  return value == null || value === "" ? !0 : flag(value);
}
__name(shown, "shown");
function sideOf(value, fallback) {
  return String(unwrapValue(value) || fallback) === "end" ? "end" : "start";
}
__name(sideOf, "sideOf");
function digitsOf(value) {
  return (typeof value == "string" ? value : localizedString(value)).replace(/\D/g, "");
}
__name(digitsOf, "digitsOf");
function paint(el, bg, ink) {
  el.style.background = String(bg || "").trim(), el.style.color = String(ink || "").trim();
}
__name(paint, "paint");
function place(el, side, raised) {
  el.style.bottom = raised ? "5.6rem" : "1.15rem", el.style.insetInlineStart = side === "start" ? "1.15rem" : "auto", el.style.insetInlineEnd = side === "end" ? "1.15rem" : "auto";
}
__name(place, "place");
function syncDocks(cfg, prefix, nodes, onTop, options = {}) {
  const showWa = shown(cfg.show_whatsapp), showTop = shown(cfg.show_top) && !options.hideTop, waSide = sideOf(cfg.whatsapp_side, "start"), topSide = sideOf(cfg.top_side, "end"), stacked = showWa && showTop && waSide === topSide, digits = digitsOf(cfg.whatsapp_number || "201153958512"), message = localizedString(cfg.whatsapp_message), href = digits ? `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "";
  if (showWa && href) {
    if (!nodes.wa) {
      const link = document.createElement("a");
      link.className = `${prefix}-dock ${prefix}-dock--wa`, link.target = "_blank", link.rel = "noopener noreferrer", link.innerHTML = WA, document.body.appendChild(link), nodes.wa = link;
    }
    nodes.wa.href = href, nodes.wa.setAttribute("aria-label", t({ ar: "واتساب", en: "WhatsApp" })), paint(nodes.wa, cfg.whatsapp_bg, cfg.whatsapp_ink), place(nodes.wa, waSide, stacked), nodes.wa.hidden = !1;
  } else nodes.wa && (nodes.wa.hidden = !0);
  const label = localizedString(cfg.top_label) || t({ ar: "أعلى", en: "Top" });
  if (shown(cfg.show_top)) {
    if (!nodes.top) {
      const button = document.createElement("button");
      button.type = "button", button.className = `${prefix}-dock ${prefix}-dock--top`, button.innerHTML = UP, button.addEventListener("click", onTop), document.body.appendChild(button), nodes.top = button;
    }
    if (nodes.top.setAttribute("aria-label", label), options.topText) {
      let caption = nodes.top.querySelector("span");
      caption || (caption = document.createElement("span"), nodes.top.appendChild(caption)), caption.textContent = label;
    }
    paint(nodes.top, cfg.top_bg, cfg.top_ink), place(nodes.top, topSide, !1), nodes.top.hidden = !showTop;
  } else nodes.top && (nodes.top.hidden = !0);
  return nodes;
}
__name(syncDocks, "syncDocks");
function clearDocks(nodes) {
  var _a, _b;
  (_a = nodes.wa) == null || _a.remove(), (_b = nodes.top) == null || _b.remove(), nodes.wa = null, nodes.top = null;
}
__name(clearDocks, "clearDocks");
function currentTone() {
  return document.documentElement.classList.contains("sp-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "sp-dark" : scheme === "light" ? "sp-light" : "sp-auto";
}
__name(schemeOf, "schemeOf");
function markEditing() {
  var _a, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a2, _b2;
    let on = !0;
    try {
      const salla = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a2 = salla == null ? void 0 : salla.config) == null ? void 0 : _a2.get) == null ? void 0 : _b2.call(_a2, "page.is_landing_page")) !== !0;
    } catch {
      on = !0;
    }
    root.dataset.lpEditing = on ? "1" : "0";
  }, "read");
  if (!root.dataset.lpEditing) {
    read();
    try {
      (_b = (_a = window.Salla) == null ? void 0 : _a.onReady) == null || _b.call(_a, read);
    } catch {
    }
  }
}
__name(markEditing, "markEditing");
function injectStyles(id, css2) {
  markEditing();
  let style = document.getElementById(id);
  style || (style = document.createElement("style"), style.id = id, document.head.appendChild(style)), style.textContent !== css2 && (style.textContent = css2);
}
__name(injectStyles, "injectStyles");
function sectionStyle(cfg) {
  return cfg.bg_color ? `--sp-section-bg:${cfg.bg_color}` : "";
}
__name(sectionStyle, "sectionStyle");
const DARK = "--ink:#f4f7f8; --ink-soft:#a8b3ba; --page:#08090a; --paper:#14171a; --paper-2:#1c2024; --line:#242a2f; --line-2:#333b42; --muted:#717d85; --card:#14171a; --volt:#d4ff3f; --accent:var(--color-primary, #d4ff3f); --volt-ink:#121500; --ice:#4fd1ff; --hot:#ff3b47;", LIGHT = "--ink:#14180f; --ink-soft:#3d4636; --page:#f4f6f1; --paper:#ffffff; --paper-2:#eef2e6; --line:#d7dece; --line-2:#c5ceba; --muted:#66705d; --card:#ffffff; --volt:#d4ff3f; --accent:var(--color-primary, #4f6d00); --volt-ink:#121500; --ice:#0b7ea8; --hot:#d21f2b;", baseCss = `
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
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.sp-foot { background: var(--sp-section-bg, var(--page)); color: var(--ink-soft); padding-block: 46px 0; font-size: .85rem; border-top: 1px solid var(--line); }
.sp-fg { display: grid; gap: 26px; padding-block-end: 32px; }
.sp-foot h4 { color: var(--ink); font-family: var(--disp); font-weight: 900; font-size: 1.04rem; margin-block-end: 10px; }
.sp-foot a { display: block; padding-block: 4px; color: var(--ink-soft); }
.sp-foot a:hover { color: var(--accent); }
.sp-about { max-width: 36ch; }
.sp-about p { margin-block-start: 10px; }
.sp-flogo { display: inline-flex; align-items: center; gap: 10px; font-family: var(--disp); font-weight: 900; font-size: 1.35rem; color: var(--ink); }
.sp-flogo img { height: 42px; width: auto; object-fit: contain; }
.sp-fmark { width: 34px; height: 34px; border-radius: var(--r); background: var(--volt); color: #121500; display: grid; place-items: center; transform: skewX(-8deg); }
.sp-pay-size { margin: 16px 0 8px; font-size: .72rem; font-weight: 700; color: var(--muted); }
.sp-pay { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sp-pay img { width: 32px; height: 32px; object-fit: contain; border-radius: .2rem; background: #d4ff3f; }
.sp-social { display: flex; flex-wrap: wrap; gap: 8px; }
.sp-social a { width: 40px; height: 36px; display: grid; place-items: center; color: var(--ink); background: var(--volt); text-decoration: none; transform: skewX(-10deg); }
.sp-social svg { width: 16px; height: 16px; display: block; transform: skewX(10deg); }
.sp-foot-copy { border-top: 1px solid var(--line); padding-block: 18px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; font-size: .77rem; color: var(--muted); }
.sp-totop, .sp-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 16px; border-radius: var(--r); border: 1px solid var(--line-2); background: var(--paper); color: var(--ink); font-family: var(--disp); font-weight: 700; font-size: .82rem; cursor: pointer; }
.sp-foot .sp-totop { margin: 8px auto 22px; }
.sp-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; opacity: 0; pointer-events: none; transform: translateY(10px); }
.sp-top.show { opacity: 1; pointer-events: auto; transform: none; }
.sp-dock { position: fixed; z-index: 80; display: inline-grid; place-items: center; width: 3.4rem; height: 3.3rem; padding: 0; border: 0; border-radius: .15rem; background: #d4ff3f; color: #121500; font-family: var(--font-main, inherit); font-weight: 800; cursor: pointer; text-decoration: none; transform: skewX(-10deg); box-shadow: 0 10px 24px rgb(0 0 0 / 22%); }
.sp-dock[hidden] { display: none; }
.sp-dock svg { width: 1.35rem; height: 1.35rem; display: block; transform: skewX(10deg); }
.sp-dock--wa { background: #121500; color: #d4ff3f; }
@container (min-width: 760px) { .sp-fg { grid-template-columns: 1.3fr 1fr 1fr 1fr; } }
`;
function socialIcon(name) {
  return name === "instagram" ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.2"></circle><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none"></circle></svg>` : name === "snapchat" ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4c2.4 0 4 1.8 4 4.2 0 1.2-.2 2 .4 2.6.3.3.8.4 1.1.6.4.3.3 1-.2 1.2-.8.3-1.3.2-1.7.6-.3.3-.4.8-.2 1.4.2.5-.2.9-.8.9-.7 0-1.1.4-1.6.7-.4.2-.7.2-1 .2s-.6 0-1-.2c-.5-.3-.9-.7-1.6-.7-.6 0-1-.4-.8-.9.2-.6.1-1.1-.2-1.4-.4-.4-.9-.3-1.7-.6-.5-.2-.6-.9-.2-1.2.3-.2.8-.3 1.1-.6.6-.6.4-1.4.4-2.6C8 5.8 9.6 4 12 4Z"></path></svg>` : name === "tiktok" ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6c.6 2.2 2 3.6 4 4v2.2c-1.4 0-2.7-.4-4-1.2v5.2a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .8.1v2.3a2.9 2.9 0 1 0 2 2.8V6H14Z"></path></svg>` : name === "whatsapp" ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>` : name === "youtube" ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="7" width="17" height="11" rx="2.5"></rect><path d="m11 10 4 2.2-4 2.2V10Z" fill="currentColor" stroke="none"></path></svg>` : name === "x" ? html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>` : html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle></svg>`;
}
__name(socialIcon, "socialIcon");
const _PageFooter = class _PageFooter extends LitElement {
  constructor() {
    super(...arguments), this.storeName = "", this.dark = !1, this.raised = !1, this.atFooter = !1, this.stop = () => {
    }, this.floater = null, this.docks = { wa: null, top: null }, this.onScroll = (event) => {
      const target = event == null ? void 0 : event.target, nested = target instanceof Element ? target.scrollTop : 0, next = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested) > 360;
      next !== this.raised && (this.raised = next);
    }, this.toTop = (event) => {
      event.preventDefault();
      const nodes = /* @__PURE__ */ new Set([document.documentElement, document.body]);
      document.scrollingElement && nodes.add(document.scrollingElement);
      let node = this;
      for (; node; )
        nodes.add(node), node = node.parentElement;
      nodes.forEach((el) => {
        try {
          el.scrollTo({ top: 0, behavior: "smooth" });
        } catch {
          el.scrollTop = 0;
        }
      });
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    var _a;
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-announce", announceCss("sp", "slant")), injectStyles("sp-page-footer", css);
    const stopLocale = watchLocale(this), onTone = /* @__PURE__ */ __name(() => {
      this.dark = currentTone() === "dark";
    }, "onTone");
    window.addEventListener("sp-tone", onTone), this.dark = currentTone() === "dark", this.stop = () => {
      stopLocale(), window.removeEventListener("sp-tone", onTone);
    }, document.addEventListener("scroll", this.onScroll, { capture: !0, passive: !0 });
    const api = window.Salla, read = /* @__PURE__ */ __name(() => {
      var _a2;
      this.storeName = ((_a2 = api == null ? void 0 : api.config) == null ? void 0 : _a2.get("store.name")) || "";
    }, "read");
    read(), (_a = api == null ? void 0 : api.onReady) == null || _a.call(api).then(read), this.onScroll();
  }
  disconnectedCallback() {
    var _a, _b;
    this.stop(), document.removeEventListener("scroll", this.onScroll, { capture: !0 }), (_a = this.seen) == null || _a.disconnect(), (_b = this.floater) == null || _b.remove(), this.floater = null, clearDocks(this.docks), super.disconnectedCallback();
  }
  updated() {
    var _a, _b;
    (_a = this.floater) == null || _a.remove(), this.floater = null, this.docks = syncDocks(getConfig(this.config), "sp", this.docks, this.toTop, { hideTop: this.atFooter });
    const button = this.querySelector(".sp-totop");
    if ((_b = this.seen) == null || _b.disconnect(), !button) {
      this.atFooter = !1;
      return;
    }
    this.seen = new IntersectionObserver(([entry]) => {
      this.atFooter = entry.isIntersecting;
    }, { threshold: 0.5 }), this.seen.observe(button);
  }
  shown(value) {
    return value == null || value === "" ? !0 : flag(value);
  }
  syncFloater() {
    var _a;
    const cfg = getConfig(this.config);
    if (!(this.shown(cfg.show_top) && this.raised && !this.atFooter)) {
      (_a = this.floater) == null || _a.classList.remove("show");
      return;
    }
    if (!this.floater) {
      const button = document.createElement("button");
      button.type = "button", button.className = "sp-top", button.addEventListener("click", this.toTop), document.body.appendChild(button), this.floater = button;
    }
    const label = localizedString(cfg.top_label) || t({ ar: "للأعلى", en: "Back to top" });
    this.floater.setAttribute("aria-label", label), this.floater.textContent = label, this.floater.classList.add("show");
  }
  render() {
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || this.storeName, badge = localizedString(cfg.badge) || "ق", showTop = this.shown(cfg.show_top), topLabel = localizedString(cfg.top_label) || t({ ar: "للأعلى", en: "Back to top" }), columns = [1, 2].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems(cfg[`col${index}`], `col${index}`).map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label)
    })).filter((column) => column.title || column.links.length), socialTitle = localizedString(cfg.col3_title), socials = getCollectionItems(cfg.social, "social").map((item) => ({
      network: String(unwrapValue(item.network) || "instagram"),
      url: linkHref(item.url) || "#",
      label: {
        instagram: t({ ar: "إنستغرام", en: "Instagram" }),
        snapchat: t({ ar: "سناب شات", en: "Snapchat" }),
        tiktok: t({ ar: "تيك توك", en: "TikTok" }),
        whatsapp: t({ ar: "واتساب", en: "WhatsApp" }),
        x: t({ ar: "إكس", en: "X" }),
        youtube: t({ ar: "يوتيوب", en: "YouTube" })
      }[String(unwrapValue(item.network) || "instagram")] || t({ ar: "تواصل", en: "Social" })
    })).filter((item) => item.url), pays = getCollectionItems(cfg.payments, "payments").map((item) => ({ image: String(item.image || ""), label: localizedString(item.label) })).filter((item) => item.image || item.label), logo = this.dark && cfg.logo_dark || cfg.logo;
    return html`${announceBar(cfg, "sp", `sp-root ${schemeOf(cfg)}`, announceTone(cfg))}
    <footer class=${`sp-root sp-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="sp-wrap">
        <div class="sp-fg">
          <div class="sp-about">
            <a href="#" class="sp-flogo">${logo ? html`<img src=${logo} alt=${brand} />` : html`<span class="sp-fmark">${badge}</span>${brand}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="sp-pay">${pays.map((pay) => pay.image ? html`<img src=${pay.image} alt=${pay.label} width="32" height="32" title=${pay.label} />` : nothing)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h4>${column.title}</h4>` : nothing}
            <div>${column.links.map((link) => html`<a href=${link.url}>${link.label}</a>`)}</div>
          </div>`)}
          ${socialTitle || socials.length ? html`<div>
            ${socialTitle ? html`<h4>${socialTitle}</h4>` : nothing}
            <div class="sp-social">${socials.map((item) => html`<a href=${item.url} aria-label=${item.label} target="_blank" rel="noopener noreferrer">${socialIcon(item.network)}</a>`)}</div>
          </div>` : nothing}
        </div>
        ${showTop ? html`<button type="button" class="sp-totop" @click=${this.toTop}>${topLabel}</button>` : nothing}
        <div class="sp-foot-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
};
__name(_PageFooter, "PageFooter");
let PageFooter = _PageFooter;
__decorateClass([
  property({ type: Object })
], PageFooter.prototype, "config");
__decorateClass([
  state()
], PageFooter.prototype, "storeName");
__decorateClass([
  state()
], PageFooter.prototype, "dark");
__decorateClass([
  state()
], PageFooter.prototype, "raised");
__decorateClass([
  state()
], PageFooter.prototype, "atFooter");
typeof PageFooter < "u" && PageFooter.registerSallaComponent("salla-volt-footer");
export {
  PageFooter as default
};
