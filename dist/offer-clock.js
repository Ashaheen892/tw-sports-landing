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
function injectStyles(id, css2) {
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
function digits(n, pad = !1) {
  const raw = pad ? String(Math.max(0, Math.floor(n))).padStart(2, "0") : String(Math.round(n));
  return getLocale() !== "ar" ? raw : raw.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}
__name(digits, "digits");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.sp-offer { background: var(--volt); color: #121500; background-image: var(--diag); position: relative; }
.sp-offer-g { display: grid; gap: 26px; align-items: center; }
.sp-offer h2 { font-family: var(--disp); font-weight: 900; font-size: clamp(1.8rem, 4.2vw, 2.8rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-offer p { margin-block-start: 10px; font-size: .95rem; font-weight: 400; max-width: 46ch; }
.sp-code { display: inline-flex; align-items: center; gap: 10px; margin-block-start: 16px; background: #121500; color: var(--volt); border-radius: var(--r); padding: 10px 18px; font-size: .84rem; }
.sp-code b { font-family: var(--disp); font-weight: 900; letter-spacing: .12em; }
.sp-clock { display: flex; gap: 8px; flex-wrap: wrap; }
.sp-cu { flex: 1 1 70px; background: #121500; color: var(--volt); border-radius: var(--r); padding: 14px 8px; text-align: center; }
.sp-cu b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.9rem; line-height: 1; font-variant-numeric: tabular-nums; }
.sp-cu span { font-size: .68rem; opacity: .75; }
@container (min-width: 900px) { .sp-offer-g { grid-template-columns: 1.2fr .8fr; } }
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
  willUpdate() {
    this.arm();
  }
  arm() {
    const cfg = getConfig(this.config), hours = Math.min(Math.max(Number(cfg.hours) || 57, 1), 240), key = `sp-offer-end-${hours}`;
    let end = 0;
    try {
      end = Number(sessionStorage.getItem(key)) || 0;
    } catch {
      end = 0;
    }
    if (!end || end < Date.now() - 1e3) {
      end = Date.now() + hours * 36e5;
      try {
        sessionStorage.setItem(key, String(end));
      } catch {
      }
    }
    this.end = end, this.left = Math.max(0, end - Date.now());
  }
  render() {
    const cfg = getConfig(this.config), title = localizedString(cfg.title), code = localizedString(cfg.code), seconds = Math.floor(this.left / 1e3), parts = [
      [Math.floor(seconds / 86400), localizedString(cfg.day_label) || "يوم"],
      [Math.floor(seconds % 86400 / 3600), localizedString(cfg.hour_label) || "ساعة"],
      [Math.floor(seconds % 3600 / 60), localizedString(cfg.minute_label) || "دقيقة"],
      [seconds % 60, localizedString(cfg.second_label) || "ثانية"]
    ];
    return html`<section class=${`sp-root sp-sec sp-offer ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "offer"}>
      <div class="sp-wrap sp-offer-g">
        <div class="sp-rev">
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
          ${code ? html`<div class="sp-code"><span>${localizedString(cfg.code_label) || "كود الخصم"}</span><b>${code}</b></div>` : nothing}
        </div>
        <div class="sp-clock sp-rev" role="timer" aria-label=${title || "timer"}>
          ${parts.map(([value, label]) => html`<div class="sp-cu"><b>${digits(Number(value), !0)}</b><span>${label}</span></div>`)}
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
typeof OfferClock < "u" && OfferClock.registerSallaComponent("salla-offer-clock");
export {
  OfferClock as default
};
