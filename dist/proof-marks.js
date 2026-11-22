var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
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
function emptyCopy() {
  return html`<p class="sp-empty">${t({ ar: "أضف عناصر هذا القسم من الإعدادات", en: "Add this section's items in the settings" })}</p>`;
}
__name(emptyCopy, "emptyCopy");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.sp-brands { display: flex; flex-wrap: wrap; gap: 10px; }
.sp-brand { display: inline-flex; align-items: center; gap: 8px; min-height: 3rem; padding: 0 14px; border: 2px solid var(--volt); color: inherit; text-decoration: none; font-weight: 800; transform: skewX(-8deg); }
.sp-brand span, .sp-brand img { transform: skewX(8deg); }
.sp-brand img { height: 22px; width: auto; max-width: 64px; object-fit: contain; }
.sp-brand small { display: block; font-weight: 500; font-size: .75rem; }
`, _BrandRow = class _BrandRow extends LitElement {
  constructor() {
    super(...arguments), this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-brand-row", css), this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  render() {
    const cfg = getConfig(this.config), title = localizedString(cfg.title), items = getCollectionItems(cfg.items, "items").map((item) => ({ name: localizedString(item.name), note: localizedString(item.note), image: String(item.image || "").trim(), url: String(item.url || "").trim() })).filter((item) => item.name), inner = /* @__PURE__ */ __name((item) => html`${item.image ? html`<img src=${item.image} alt="" />` : nothing}<span><b>${item.name}</b>${item.note ? html`<small>${item.note}</small>` : nothing}</span>`, "inner");
    return html`<section id="sp-brands" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "brands"}>
      <div class="sp-wrap">
        <div class="sp-head">${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}</div>
        ${items.length ? html`<div class="sp-brands">${items.map((item) => item.url ? html`<a class="sp-brand" href=${item.url}>${inner(item)}</a>` : html`<span class="sp-brand">${inner(item)}</span>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
};
__name(_BrandRow, "BrandRow");
let BrandRow = _BrandRow;
__decorateClass([
  property({ type: Object })
], BrandRow.prototype, "config");
typeof BrandRow < "u" && BrandRow.registerSallaComponent("salla-proof-marks");
export {
  BrandRow as default
};
