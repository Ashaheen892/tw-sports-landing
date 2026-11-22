var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { LitElement, nothing, html } from "lit";
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
function watchLocale(host) {
  const update = /* @__PURE__ */ __name(() => host.requestUpdate(), "update");
  return window.addEventListener("language-changed", update), () => window.removeEventListener("language-changed", update);
}
__name(watchLocale, "watchLocale");
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
function watchReveal(host) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches)
    return host.querySelectorAll(".sp-rev").forEach((el) => el.classList.add("in")), () => {
    };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.isIntersecting && (entry.target.classList.add("in"), io.unobserve(entry.target));
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }), scan = /* @__PURE__ */ __name(() => host.querySelectorAll(".sp-rev:not(.in)").forEach((el) => io.observe(el)), "scan"), mo = new MutationObserver(scan);
  return mo.observe(host, { childList: !0, subtree: !0 }), scan(), () => {
    io.disconnect(), mo.disconnect();
  };
}
__name(watchReveal, "watchReveal");
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
function offerEnd(raw) {
  const text = String(unwrapValue(raw) || "").trim();
  if (!text) return 0;
  const day = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]), 23, 59, 59).getTime();
  const local = text.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (local) return new Date(Number(local[1]), Number(local[2]) - 1, Number(local[3]), Number(local[4]), Number(local[5]), 0).getTime();
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}
__name(offerEnd, "offerEnd");
const css = `
.sp-offer { background: var(--volt); color: #121500; background-image: var(--diag); position: relative; overflow: hidden; }
.sp-offer-g { display: grid; gap: 26px; align-items: center; }
.sp-offer h2 { font-family: var(--disp); font-weight: 900; font-size: clamp(1.8rem, 4.2vw, 2.8rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-offer p { margin-block-start: 10px; font-size: .95rem; font-weight: 400; max-width: 46ch; }
.sp-code { display: inline-flex; align-items: center; gap: 10px; margin-block-start: 16px; background: #121500; color: var(--volt); border-radius: var(--r); padding: 10px 18px; font-size: .84rem; transform: skewX(-8deg); }
.sp-code > * { transform: skewX(8deg); }
.sp-code b { font-family: var(--disp); font-weight: 900; letter-spacing: .12em; }
.sp-board { direction: ltr; display: flex; align-items: stretch; justify-content: center; padding: 18px 16px 12px; background: #121500; color: var(--volt); transform: skewX(-8deg); box-shadow: 10px 10px 0 rgb(18 21 0 / 25%); }
.sp-board > * { transform: skewX(8deg); }
.sp-cu { display: grid; justify-items: center; min-width: 3.4rem; }
.sp-cu b { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-weight: 800; font-size: clamp(2.2rem, 6vw, 3.6rem); line-height: 1; font-variant-numeric: tabular-nums; text-shadow: 0 0 18px rgb(212 255 63 / 45%); }
.sp-cu span { margin-top: 6px; font-size: .66rem; letter-spacing: .14em; color: #f4f7f8; opacity: .7; direction: rtl; }
.sp-colon { align-self: start; padding-inline: 4px; font-family: ui-monospace, Menlo, monospace; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1; opacity: .55; animation: sp-blink 1s steps(2) infinite; }
@keyframes sp-blink { 50% { opacity: .12; } }
@media (prefers-reduced-motion: reduce) { .sp-colon { animation: none; } }
@container (min-width: 900px) { .sp-offer-g { grid-template-columns: 1.15fr .85fr; } }
`, _OfferClock = class _OfferClock extends LitElement {
  constructor() {
    super(...arguments), this.left = 0, this.stop = () => {
    }, this.timer = 0, this.end = 0;
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-offer-clock", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.arm(), this.timer = window.setInterval(() => {
      this.left = Math.max(0, this.end - Date.now());
    }, 1e3), this.stop = () => {
      stopLocale(), stopReveal(), window.clearInterval(this.timer);
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  willUpdate(changed) {
    changed.has("config") && this.arm();
  }
  arm() {
    this.end = offerEnd(getConfig(this.config).ends_at), this.left = Math.max(0, this.end - Date.now());
  }
  render() {
    const cfg = getConfig(this.config), title = localizedString(cfg.title), code = localizedString(cfg.code), seconds = Math.floor(this.left / 1e3), parts = [
      [Math.floor(seconds / 86400), t({ ar: "يوم", en: "day" })],
      [Math.floor(seconds % 86400 / 3600), t({ ar: "ساعة", en: "hour" })],
      [Math.floor(seconds % 3600 / 60), t({ ar: "دقيقة", en: "min" })],
      [seconds % 60, t({ ar: "ثانية", en: "sec" })]
    ];
    return html`<section class=${`sp-root sp-sec sp-offer ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "offer"}>
      <div class="sp-wrap sp-offer-g">
        <div class="sp-rev">
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
          ${code ? html`<div class="sp-code"><span>${localizedString(cfg.code_label) || t({ ar: "كود الخصم", en: "Code" })}</span><b>${code}</b></div>` : nothing}
        </div>
        <div class="sp-board sp-rev" role="timer" aria-label=${title || "timer"}>
          ${parts.map(([value, label], index) => html`${index ? html`<i class="sp-colon" aria-hidden="true">:</i>` : nothing}<div class="sp-cu"><b>${String(Math.max(0, Number(value))).padStart(2, "0")}</b><span>${label}</span></div>`)}
        </div>
      </div>
    </section>`;
  }
};
__name(_OfferClock, "OfferClock");
let OfferClock = _OfferClock;
__decorateClass([
  property({ type: Object })
], OfferClock.prototype, "config");
__decorateClass([
  state()
], OfferClock.prototype, "left");
typeof OfferClock < "u" && OfferClock.registerSallaComponent("salla-drop-clock");
export {
  OfferClock as default
};
