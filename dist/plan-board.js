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
function digits(n, pad = !1) {
  const raw = pad ? String(Math.max(0, Math.floor(n))).padStart(2, "0") : String(Math.round(n));
  return getLocale() !== "ar" ? raw : raw.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}
__name(digits, "digits");
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
.sp-plan { background: var(--sp-section-bg, var(--paper)); border-block: 1px solid var(--line); }
.sp-sp { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-pane { background: var(--paper); padding: clamp(24px, 3.6vw, 38px); }
.sp-pane.dk { background: var(--page); }
.sp-lab { font-size: .74rem; color: var(--muted); font-weight: 500; letter-spacing: .1em; margin-block-end: 11px; }
.sp-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-block-end: 22px; }
.sp-pill { background: var(--page); border: 1px solid var(--line-2); border-radius: var(--r); padding: 11px 17px; font-family: var(--disp); font-weight: 700; font-size: .92rem; cursor: pointer; color: var(--ink); }
.sp-pill[aria-pressed="true"] { background: var(--volt); border-color: var(--volt); color: #121500; }
.sp-pill:disabled { opacity: .4; cursor: not-allowed; }
.sp-pname { font-family: var(--disp); font-weight: 900; font-size: 1.7rem; letter-spacing: -.01em; }
.sp-pdesc { font-size: .88rem; color: var(--ink-soft); margin-block-start: 9px; min-height: 4.4em; }
.sp-prow { display: flex; align-items: baseline; gap: 12px; margin-block: 20px 6px; flex-wrap: wrap; }
.sp-prow .p { font-family: var(--disp); font-weight: 900; font-size: 2.1rem; color: var(--accent); }
.sp-prow s { color: var(--muted); font-size: .94rem; }
.sp-off { background: var(--hot); color: #fff; font-weight: 700; border-radius: 4px; font-size: .74rem; padding: 5px 11px; }
.sp-split { display: flex; gap: 10px; flex-wrap: wrap; margin-block-start: 22px; }
.sp-split .sp-btn { flex: 1 1 180px; }
.sp-terms { font-size: .78rem; color: var(--muted); margin-block-start: 14px; }
.sp-rng { margin-block-end: 22px; }
.sp-rng .top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-block-end: 8px; }
.sp-rng .top b { font-family: var(--disp); font-weight: 900; font-size: 1.25rem; color: var(--accent); }
.sp-rng input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 999px; background: var(--line-2); outline: none; }
.sp-rng input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--volt); border: 4px solid var(--page); cursor: pointer; }
.sp-res { border: 1px solid var(--line-2); border-radius: var(--r); padding: 20px; background: var(--paper); }
.sp-big { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.sp-big b { font-family: var(--disp); font-weight: 900; font-size: 3.1rem; color: var(--accent); line-height: 1; }
.sp-big span { font-size: .88rem; color: var(--ink-soft); }
.sp-mg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; margin-block-start: 18px; }
.sp-mg div { background: var(--page); padding: 13px 12px; text-align: center; }
.sp-mg b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.2rem; }
.sp-mg span { font-size: .72rem; color: var(--muted); }
.sp-bars { margin-block-start: 20px; display: grid; gap: 13px; }
.sp-br .t { display: flex; justify-content: space-between; font-size: .8rem; color: var(--ink-soft); margin-block-end: 6px; }
.sp-tr { height: 7px; border-radius: 999px; background: var(--line); overflow: hidden; }
.sp-fl { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--volt), var(--ice)); transition: width .7s cubic-bezier(.2,.7,.3,1); }
.sp-stack { margin-block-start: 20px; display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-si { background: var(--paper); padding: 13px 15px; display: flex; align-items: center; gap: 12px; font-size: .87rem; }
.sp-si .mk { width: 24px; height: 24px; border-radius: 4px; background: var(--volt); color: #121500; display: grid; place-items: center; font-weight: 700; font-size: .75rem; flex: 0 0 auto; }
.sp-si b { font-family: var(--disp); font-weight: 700; }
.sp-si span { margin-inline-start: auto; color: var(--muted); font-size: .78rem; }
.sp-note { font-size: .82rem; color: var(--ink-soft); margin-block-start: 16px; border-inline-start: 2px solid var(--volt); padding-inline-start: 13px; }
.sp-buy { position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 50; background: color-mix(in srgb, var(--paper) 97%, transparent); border-top: 1px solid var(--line-2); backdrop-filter: blur(10px); transform: translateY(102%); transition: transform .3s; padding-block-end: env(safe-area-inset-bottom, 0); }
.sp-buy.on { transform: translateY(0); }
.sp-buy .in { display: flex; align-items: center; gap: 14px; padding-block: 12px; }
.sp-buy .nm { font-family: var(--disp); font-weight: 700; font-size: 1.04rem; }
.sp-buy .nm s { display: block; font-size: .74rem; color: var(--muted); text-decoration: none; font-family: var(--body); font-weight: 300; }
.sp-buy .pz { margin-inline-start: auto; font-family: var(--disp); font-weight: 900; font-size: 1.26rem; color: var(--accent); }
@container (min-width: 1020px) { .sp-sp { grid-template-columns: 1fr 1fr; } }
@container (max-width: 560px) { .sp-buy .nm s { display: none; } .sp-mg { grid-template-columns: 1fr; } }
`;
function num(value, fallback) {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}
__name(num, "num");
function linesOf(value) {
  return localizedString(value).split(`
`).map((line) => {
    const [title, detail = ""] = line.split("|").map((part) => part.trim());
    return title ? { title, detail } : null;
  }).filter((row) => !!row);
}
__name(linesOf, "linesOf");
function goalsOf(cfg) {
  return getCollectionItems(cfg.goals, "goals").map((item) => ({
    code: localizedString(item.code) || localizedString(item.label),
    label: localizedString(item.label),
    name: localizedString(item.name) || localizedString(item.label),
    factor: num(localizedString(item.factor), 2),
    meals: num(localizedString(item.meals), 4),
    priceFactor: num(localizedString(item.price_factor), 1),
    foodShare: num(localizedString(item.food_share), 0.55),
    text: localizedString(item.text),
    note: localizedString(item.note),
    bars: localizedString(item.bars).split(",").map((part) => num(part.trim(), 0)).slice(0, 3),
    lines: linesOf(item.lines),
    on: flag(item.on)
  })).filter((item) => item.label);
}
__name(goalsOf, "goalsOf");
function levelsOf(cfg) {
  return getCollectionItems(cfg.levels, "levels").map((item) => ({
    code: localizedString(item.code) || localizedString(item.label),
    label: localizedString(item.label),
    days: num(localizedString(item.days), 4),
    take: num(localizedString(item.take), 4),
    multiplier: num(localizedString(item.multiplier), 1),
    on: flag(item.on)
  })).filter((item) => item.label);
}
__name(levelsOf, "levelsOf");
function flavorsOf(cfg) {
  return getCollectionItems(cfg.flavors, "flavors").map((item) => ({
    label: localizedString(item.label),
    available: item.available == null || item.available === "" ? !0 : flag(item.available),
    on: flag(item.on)
  })).filter((item) => item.label);
}
__name(flavorsOf, "flavorsOf");
const _PlanBoard = class _PlanBoard extends LitElement {
  constructor() {
    super(...arguments), this.goal = "", this.level = "", this.flavor = "", this.weight = 82, this.showBar = !1, this.touched = !1, this.stop = () => {
    }, this.queued = !1;
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-plan-board", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this), onScroll = /* @__PURE__ */ __name(() => {
      this.queued || (this.queued = !0, requestAnimationFrame(() => {
        this.queued = !1;
        const next = this.getBoundingClientRect().top < window.innerHeight * 0.4;
        next !== this.showBar && (this.showBar = next);
      }));
    }, "onScroll");
    window.addEventListener("scroll", onScroll, { passive: !0 }), requestAnimationFrame(onScroll), this.stop = () => {
      stopLocale(), stopReveal(), window.removeEventListener("scroll", onScroll);
    };
  }
  disconnectedCallback() {
    this.stop(), super.disconnectedCallback();
  }
  willUpdate() {
    var _a, _b, _c, _d, _e, _f;
    if (this.touched) return;
    const cfg = getConfig(this.config), goals = goalsOf(cfg), levels = levelsOf(cfg), flavors = flavorsOf(cfg);
    this.goal = ((_a = goals.find((item) => item.on)) == null ? void 0 : _a.code) || ((_b = goals[0]) == null ? void 0 : _b.code) || "", this.level = ((_c = levels.find((item) => item.on)) == null ? void 0 : _c.code) || ((_d = levels[0]) == null ? void 0 : _d.code) || "", this.flavor = ((_e = flavors.find((item) => item.on && item.available)) == null ? void 0 : _e.label) || ((_f = flavors.find((item) => item.available)) == null ? void 0 : _f.label) || "";
    const min = num(cfg.weight_min, 45), max = num(cfg.weight_max, 140);
    this.weight = Math.min(max, Math.max(min, num(cfg.weight_default, 82)));
  }
  pick(kind, value) {
    this.touched = !0, kind === "goal" && (this.goal = value), kind === "level" && (this.level = value), kind === "flavor" && (this.flavor = value);
  }
  render() {
    const cfg = getConfig(this.config), title = localizedString(cfg.title), goals = goalsOf(cfg), levels = levelsOf(cfg), flavors = flavorsOf(cfg), goal = goals.find((item) => item.code === this.goal) || goals[0], level = levels.find((item) => item.code === this.level) || levels[0], id = String(cfg.anchor || "plan");
    if (!goal || !level)
      return html`<section class=${`sp-root sp-sec sp-plan ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)}>${emptyCopy()}</section>`;
    const min = num(cfg.weight_min, 45), max = num(cfg.weight_max, 140), scoop = num(cfg.scoop_grams, 27), creatine = num(cfg.creatine_grams, 5), base = num(cfg.base_price, 265), need = Math.round(this.weight * goal.factor), fromFood = Math.round(need * goal.foodShare), scoops = Math.max(1, Math.round((need - fromFood) / Math.max(1, scoop))), price = Math.round(base * level.multiplier * goal.priceFactor / 5) * 5, old = Math.round(price * 1.25 / 5) * 5, off = old > price ? Math.round((1 - price / old) * 100) : 0, unit = localizedString(cfg.currency) || "ر.س", stack = goal.lines.slice(0, Math.max(1, level.take)), barLabels = [
      localizedString(cfg.bar_1) || "بروتين",
      localizedString(cfg.bar_2) || "كرياتين",
      localizedString(cfg.bar_3) || "كافيين"
    ], secondary = localizedString(cfg.secondary_label), secondaryUrl = linkHref(cfg.secondary_url), money = /* @__PURE__ */ __name((value) => `${digits(value)} ${unit}`, "money");
    return html`<section class=${`sp-root sp-sec sp-plan ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "plan"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="sp-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        <div class="sp-sp sp-rev">
          <div class="sp-pane">
            <p class="sp-lab">${localizedString(cfg.goal_label) || "هدفك الأساسي"}</p>
            <div class="sp-pills" role="group" aria-label=${localizedString(cfg.goal_label) || "goal"}>
              ${goals.map((item) => html`<button type="button" class="sp-pill" aria-pressed=${item.code === goal.code ? "true" : "false"} @click=${() => this.pick("goal", item.code)}>${item.label}</button>`)}
            </div>
            <p class="sp-lab">${localizedString(cfg.level_label) || "مستوى التدريب"}</p>
            <div class="sp-pills" role="group">
              ${levels.map((item) => html`<button type="button" class="sp-pill" aria-pressed=${item.code === level.code ? "true" : "false"} @click=${() => this.pick("level", item.code)}>${item.label}</button>`)}
            </div>
            <div class="sp-rng">
              <div class="top"><span>${localizedString(cfg.weight_label) || "وزنك الحالي"}</span><b>${digits(this.weight)} ${localizedString(cfg.weight_unit) || "كغ"}</b></div>
              <input type="range" min=${String(min)} max=${String(max)} step="1" .value=${String(this.weight)} aria-label=${localizedString(cfg.weight_label) || "weight"} @input=${(event) => {
      this.touched = !0, this.weight = Number(event.target.value);
    }}>
            </div>
            ${flavors.length ? html`<p class="sp-lab">${localizedString(cfg.flavor_label) || "النكهة"}</p>
              <div class="sp-pills" role="group">
                ${flavors.map((item) => html`<button type="button" class="sp-pill" ?disabled=${!item.available} aria-pressed=${item.label === this.flavor ? "true" : "false"} @click=${() => {
      item.available && this.pick("flavor", item.label);
    }}>${item.label}</button>`)}
              </div>` : nothing}
            <h3 class="sp-pname">${goal.name} — ${level.label}</h3>
            ${goal.text ? html`<p class="sp-pdesc">${goal.text}</p>` : nothing}
            <div class="sp-prow">
              <span class="p">${money(price)}</span>
              ${off ? html`<s>${money(old)}</s><span class="sp-off">${localizedString(cfg.off_label) || "خصم"} ${digits(off)}٪</span>` : nothing}
            </div>
            <div class="sp-split">
              ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
              ${secondary && secondaryUrl ? html`<a class="sp-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
            </div>
            ${localizedString(cfg.disclaimer) ? html`<p class="sp-terms">${localizedString(cfg.disclaimer)}</p>` : nothing}
          </div>
          <div class="sp-pane dk">
            <p class="sp-lab">${localizedString(cfg.result_label) || "خطتك المحسوبة"}</p>
            <div class="sp-res" aria-live="polite">
              <div class="sp-big"><b>${digits(need)}</b><span>${localizedString(cfg.protein_label) || "غرام بروتين يومياً"} · ${digits(scoops)} ${localizedString(cfg.scoop_label) || "سكوب"}</span></div>
              <div class="sp-mg">
                <div><b>${digits(goal.meals)}</b><span>${localizedString(cfg.meals_label) || "وجبات باليوم"}</span></div>
                <div><b>${digits(level.days)}</b><span>${localizedString(cfg.days_label) || "أيام تدريب"}</span></div>
                <div><b>${digits(creatine)} ${localizedString(cfg.gram_label) || "غ"}</b><span>${localizedString(cfg.creatine_label) || "كرياتين يومي"}</span></div>
              </div>
              <div class="sp-bars">
                ${barLabels.map((label, index) => html`<div class="sp-br"><div class="t"><span>${label}</span><span>${digits(goal.bars[index] || 0)}٪</span></div><div class="sp-tr"><i class="sp-fl" style=${`width:${goal.bars[index] || 0}%`}></i></div></div>`)}
              </div>
              ${stack.length ? html`<div class="sp-stack">${stack.map((row) => html`<div class="sp-si"><span class="mk" aria-hidden="true">✓</span><b>${row.title}</b>${row.detail ? html`<span>${row.detail}</span>` : nothing}</div>`)}</div>` : nothing}
              ${goal.note ? html`<p class="sp-note">${goal.note}</p>` : nothing}
            </div>
          </div>
        </div>
      </div>
      <div class=${`sp-buy ${this.showBar ? "on" : ""}`} aria-live="polite">
        <div class="sp-wrap in">
          <div class="sp-nm">${goal.name} — ${level.label} <s>${digits(stack.length)} ${localizedString(cfg.items_label) || "أصناف"} · ${this.flavor}</s></div>
          <div class="sp-pz">${money(price)}</div>
          ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
        </div>
      </div>
    </section>`;
  }
};
__name(_PlanBoard, "PlanBoard");
let PlanBoard = _PlanBoard;
__decorateClass([
  property({ type: Object })
], PlanBoard.prototype, "config");
__decorateClass([
  state()
], PlanBoard.prototype, "goal");
__decorateClass([
  state()
], PlanBoard.prototype, "level");
__decorateClass([
  state()
], PlanBoard.prototype, "flavor");
__decorateClass([
  state()
], PlanBoard.prototype, "weight");
__decorateClass([
  state()
], PlanBoard.prototype, "showBar");
typeof PlanBoard < "u" && PlanBoard.registerSallaComponent("salla-plan-board");
export {
  PlanBoard as default
};
