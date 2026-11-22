var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: !0 });
import { html, LitElement } from "lit";
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
function schemeOf(cfg) {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  return scheme === "dark" ? "sp-dark" : scheme === "light" ? "sp-light" : "sp-auto";
}
__name(schemeOf, "schemeOf");
const AR = "٠١٢٣٤٥٦٧٨٩", NUM = /[+-]?[\d٠-٩]+(?:[.,٫٬][\d٠-٩]+)*/;
function parse(text) {
  const match = text.match(NUM);
  if (!match || match.index === void 0) return null;
  const raw = match[0], arabic = /[٠-٩]/.test(raw), latin = raw.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d))), decimalMark = /[.٫](\d+)$/.exec(latin), decimals = decimalMark && decimalMark[1].length < 3 ? decimalMark[1].length : 0, grouped = /[,٬]/.test(latin) || !decimals && /[.٫]\d{3}/.test(latin), clean = decimals ? latin.replace(/[,٬]/g, "").replace(/[٫]/, ".") : latin.replace(/[.,٫٬]/g, ""), value = Number(clean);
  return !Number.isFinite(value) || value === 0 ? null : { before: text.slice(0, match.index), after: text.slice(match.index + raw.length), value, decimals, arabic, grouped };
}
__name(parse, "parse");
function format(n, p) {
  let out = p.decimals ? n.toFixed(p.decimals) : String(Math.round(n));
  return p.grouped && (out = out.replace(/\B(?=(\d{3})+(?!\d))/g, p.arabic ? "٬" : ",")), p.arabic && (out = out.replace(/\d/g, (d) => AR[Number(d)]).replace(".", "٫")), p.before + out + p.after;
}
__name(format, "format");
const done = /* @__PURE__ */ new WeakSet();
function countUp(root, selector, duration = 1400) {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches, nodes = Array.from(root.querySelectorAll(selector)).filter((el) => !done.has(el));
  if (reduced || !nodes.length || !("IntersectionObserver" in window)) return () => {
  };
  const frames = /* @__PURE__ */ new Set(), io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      io.unobserve(el);
      const final = el.dataset.countFinal || el.textContent || "", parsed = parse(final);
      if (!parsed) return;
      el.dataset.countFinal = final, done.add(el);
      const start = performance.now(), tick = /* @__PURE__ */ __name((now) => {
        const k = Math.min(1, (now - start) / duration), eased = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? format(parsed.value * eased, parsed) : final, k < 1 && frames.add(requestAnimationFrame(tick));
      }, "tick");
      el.textContent = format(0, parsed), frames.add(requestAnimationFrame(tick));
    });
  }, { threshold: 0.4 });
  return nodes.forEach((el) => io.observe(el)), () => {
    io.disconnect(), frames.forEach((id) => cancelAnimationFrame(id));
  };
}
__name(countUp, "countUp");
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
.sp-stats { display: grid; gap: 10px; }
@container (min-width: 760px) { .sp-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.sp-stat { background: #121500; color: #f4f6ef; padding: 22px 18px 16px; transform: skewX(-7deg); }
.sp-stat b, .sp-stat span { display: block; transform: skewX(7deg); }
.sp-stat b { color: var(--volt); font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1; }
.sp-stat span { margin-top: 8px; font-size: .88rem; }
`, _StatStrip = class _StatStrip extends LitElement {
  constructor() {
    super(...arguments), this.stop = () => {
    }, this.stopCount = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-stat-strip", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), this.stopCount(), super.disconnectedCallback();
  }
  updated() {
    const cfg = getConfig(this.config);
    (cfg.count_up === void 0 || cfg.count_up === "" || flag(cfg.count_up)) && (this.stopCount(), this.stopCount = countUp(this, ".sp-stat b"));
  }
  render() {
    const cfg = getConfig(this.config), title = localizedString(cfg.title), items = getCollectionItems(cfg.items, "items").map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) })).filter((item) => item.value);
    return html`<section id="sp-stats" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "stats"}>
      <div class="sp-wrap">
        <div class="sp-head">${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : ""}${title ? html`<h2 class="sp-h2">${title}</h2>` : ""}</div>
        ${items.length ? html`<div class="sp-stats">${items.map((item) => html`<article class="sp-stat"><b .textContent=${item.value}></b><span>${item.label}</span></article>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
};
__name(_StatStrip, "StatStrip");
let StatStrip = _StatStrip;
__decorateClass([
  property({ type: Object })
], StatStrip.prototype, "config");
typeof StatStrip < "u" && StatStrip.registerSallaComponent("salla-volt-stats");
export {
  StatStrip as default
};
