var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { nothing, html, LitElement } from "lit";
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
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  var _a, _b;
  return ((_b = (_a = salla()) == null ? void 0 : _a.config) == null ? void 0 : _b.get("theme.settings")) || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  var _a, _b;
  return ((_b = (_a = salla()) == null ? void 0 : _a.config) == null ? void 0 : _b.get("page.is_landing_page")) === !0;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  var _a;
  const value = landingSettings().page_for_product;
  return typeof value == "boolean" || value == null ? value === !1 ? "promotion" : "product" : typeof value == "string" ? value === "promotion" ? "promotion" : "product" : Array.isArray(value) && ((_a = value[0]) == null ? void 0 : _a.value) === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  var _a, _b;
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = (_b = (_a = landingSettings().product) == null ? void 0 : _a.value) == null ? void 0 : _b[0];
  return id ? String(id) : null;
}
__name(landingProductId, "landingProductId");
function mainButton() {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}
__name(mainButton, "mainButton");
function openCheckout() {
  const checkout = document.querySelector(".s-block--fast-checkout"), layout = checkout == null ? void 0 : checkout.getAttribute("data-layout");
  if (window.innerWidth < 1024 || layout === "side-drawer" || !checkout) {
    window.dispatchEvent(new CustomEvent("open-checkout-drawer"));
    return;
  }
  checkout.scrollIntoView({ behavior: "smooth", block: "center" });
}
__name(openCheckout, "openCheckout");
function renderCta(labelValue, fallbackUrl = "", tone = "solid") {
  const label = localizedString(labelValue).trim();
  if (!label) return nothing;
  const cls = tone === "ghost" ? "sp-btn ghost" : tone === "light" ? "sp-btn light" : "sp-btn", productPage = !!landingProductId(), demo = !isLandingPage();
  if (productPage || demo && !fallbackUrl)
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  return href ? html`<a class=${cls} href=${href}>${label}</a>` : html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
}
__name(renderCta, "renderCta");
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
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.sp-hero { position: relative; overflow: hidden; padding-block: clamp(34px, 6vw, 78px); background: var(--sp-section-bg, var(--page)); }
.sp-hero::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at 60% 20%, #000, transparent 72%); -webkit-mask-image: radial-gradient(ellipse at 60% 20%, #000, transparent 72%); pointer-events: none; }
.sp-hero-g { display: grid; gap: clamp(26px, 5vw, 50px); align-items: center; position: relative; z-index: 1; }
.sp-kicker { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--line-2); border-radius: 999px; padding: 6px 15px; font-size: .76rem; font-weight: 500; color: var(--ink-soft); margin-block-end: 18px; }
.sp-kicker i { width: 7px; height: 7px; border-radius: 50%; background: var(--volt); font-style: normal; }
.sp-hero h1 { font-family: var(--disp); font-weight: 900; font-size: clamp(2.2rem, 6.4vw, 4.2rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-hero h1 em { font-style: normal; color: var(--accent); }
.sp-hero .sp-copy { color: var(--ink-soft); font-size: 1.03rem; max-width: 50ch; margin-block: 18px 26px; }
.sp-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.sp-micro { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); margin-block-start: 30px; border-radius: var(--r); overflow: hidden; }
.sp-micro div { background: var(--paper); padding: 16px 14px; }
.sp-micro b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.5rem; color: var(--accent); line-height: 1.1; }
.sp-micro span { font-size: .75rem; color: var(--muted); }
.sp-scene { position: relative; aspect-ratio: 1/1; border-radius: var(--r); background: radial-gradient(circle at 50% 45%, var(--paper-2), var(--page) 70%); border: 1px solid var(--line); display: grid; place-items: center; overflow: hidden; }
.sp-scene img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sp-ring { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border: 1.5px dashed var(--line-2); border-radius: 50%; animation: sp-spin 26s linear infinite; }
.sp-ring.a { width: 78%; aspect-ratio: 1; }
.sp-ring.b { width: 56%; aspect-ratio: 1; animation-duration: 17s; animation-direction: reverse; border-color: color-mix(in srgb, var(--volt) 45%, transparent); }
@keyframes sp-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.sp-db { position: relative; width: 72%; max-width: 330px; height: 118px; animation: sp-lift 4.6s ease-in-out infinite; }
@keyframes sp-lift { 0%, 100% { transform: translateY(8px) rotate(-6deg); } 50% { transform: translateY(-10px) rotate(-6deg); } }
.sp-bar { position: absolute; top: 50%; inset-inline: 17%; height: 15px; transform: translateY(-50%); border-radius: 4px; background: linear-gradient(180deg, #c9d2d8, #6d777e 55%, #434c52); }
.sp-pl { position: absolute; inset-block: 0; width: 17%; border-radius: 7px; background: linear-gradient(145deg, #2c3338, #171b1e); border: 1px solid var(--line-2); box-shadow: inset 0 0 0 7px rgba(212,255,63,.12); }
.sp-pl.a { inset-inline-start: 0; }
.sp-pl.b { inset-inline-end: 0; }
.sp-pl::after { content: ""; position: absolute; inset: 22% 28%; border-radius: 4px; background: var(--volt); }
.sp-stat { position: absolute; background: color-mix(in srgb, var(--paper) 92%, transparent); border: 1px solid var(--line-2); border-radius: var(--r); padding: 11px 15px; font-size: .78rem; z-index: 2; }
.sp-stat b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.3rem; color: var(--accent); line-height: 1.1; }
.sp-stat.s1 { inset-block-start: 22px; inset-inline-start: 22px; }
.sp-stat.s2 { inset-block-end: 22px; inset-inline-end: 22px; }
@container (min-width: 1000px) { .sp-hero-g { grid-template-columns: 1.06fr .94fr; } }
@container (max-width: 640px) { .sp-micro { grid-template-columns: 1fr; } }
`, _VoltHero = class _VoltHero extends LitElement {
  constructor() {
    super(...arguments), this.stop = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-volt-hero", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  render() {
    const cfg = getConfig(this.config), before = localizedString(cfg.title_before), accent = localizedString(cfg.title_accent), after = localizedString(cfg.title_after), title = [before, accent, after].filter(Boolean).join(" "), stats = getCollectionItems(cfg.stats, "stats").map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) })).filter((item) => item.value), secondary = localizedString(cfg.secondary_label), secondaryUrl = linkHref(cfg.secondary_url), photo = String(cfg.scene_image || ""), chipA = localizedString(cfg.chip_a_value), chipB = localizedString(cfg.chip_b_value);
    return html`<section class=${`sp-root sp-hero ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "hero"}>
      <div class="sp-wrap sp-hero-g">
        <div class="sp-rev">
          ${localizedString(cfg.kicker) ? html`<span class="sp-kicker"><i></i>${localizedString(cfg.kicker)}</span>` : nothing}
          ${title ? html`<h1>${before} ${accent ? html`<em>${accent}</em>` : nothing} ${after}</h1>` : nothing}
          ${localizedString(cfg.text) ? html`<p class="sp-copy">${localizedString(cfg.text)}</p>` : nothing}
          <div class="sp-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${secondary && secondaryUrl ? html`<a class="sp-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
          </div>
          ${stats.length ? html`<div class="sp-micro">${stats.map((item) => html`<div><b>${item.value}</b><span>${item.label}</span></div>`)}</div>` : nothing}
        </div>
        <div class="sp-rev">
          <div class="sp-scene">
            ${photo ? html`<img src=${photo} alt="" />` : html`
              <span class="sp-ring a" aria-hidden="true"></span>
              <span class="sp-ring b" aria-hidden="true"></span>
              <div class="sp-db" aria-hidden="true"><span class="sp-pl a"></span><span class="sp-bar"></span><span class="sp-pl b"></span></div>
            `}
            ${chipA ? html`<div class="sp-stat s1"><b>${chipA}</b>${localizedString(cfg.chip_a_label)}</div>` : nothing}
            ${chipB ? html`<div class="sp-stat s2"><b>${chipB}</b>${localizedString(cfg.chip_b_label)}</div>` : nothing}
          </div>
        </div>
      </div>
    </section>`;
  }
};
__name(_VoltHero, "VoltHero");
let VoltHero = _VoltHero;
__decorateClass([
  property({ type: Object })
], VoltHero.prototype, "config");
typeof VoltHero < "u" && VoltHero.registerSallaComponent("salla-volt-hero");
export {
  VoltHero as default
};
