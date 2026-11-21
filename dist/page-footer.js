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
const COPIES = 12;
function announceCss(prefix) {
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
__name(announceCss, "announceCss");
function announceBar(cfg, prefix, extraClass = "", tone = "") {
  const text = localizedString(cfg.announce).trim();
  if (!text) return nothing;
  if (!(String(unwrapValue(cfg.announce_mode) || "move") !== "still"))
    return html`<div class="${prefix}-ann ${prefix}-ann__still ${extraClass}" style=${tone}>${text}</div>`;
  const rtl = isRtl() ? " is-rtl" : "";
  return html`<div class="${prefix}-ann${rtl} ${extraClass}" style=${tone}>
    <ul class="${prefix}-ann__list">
      ${Array.from({ length: COPIES }, (_, index) => html`<li class="${prefix}-ann__item" aria-hidden=${index ? "true" : "false"}><span class="${prefix}-ann__text">${text}</span></li>`)}
    </ul>
  </div>`;
}
__name(announceBar, "announceBar");
function currentTone() {
  return document.documentElement.classList.contains("sp-mode-dark") ? "dark" : "light";
}
__name(currentTone, "currentTone");
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
.sp-foot { background: var(--sp-section-bg, var(--page)); color: var(--ink-soft); padding-block: 46px 0; font-size: .85rem; border-top: 1px solid var(--line); }
.sp-fg { display: grid; gap: 26px; padding-block-end: 32px; }
.sp-foot h4 { color: var(--ink); font-family: var(--disp); font-weight: 900; font-size: 1.04rem; margin-block-end: 10px; }
.sp-foot a { display: block; padding-block: 4px; color: var(--ink-soft); }
.sp-foot a:hover { color: var(--accent); }
.sp-about { max-width: 36ch; }
.sp-about p { margin-block-start: 10px; }
.sp-logo { display: inline-flex; align-items: center; gap: 10px; font-family: var(--disp); font-weight: 900; font-size: 1.35rem; color: var(--ink); }
.sp-logo img { height: 42px; width: auto; object-fit: contain; }
.sp-mark { width: 34px; height: 34px; border-radius: var(--r); background: var(--volt); color: #121500; display: grid; place-items: center; transform: skewX(-8deg); }
.sp-pay { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 16px; }
.sp-pay span { border: 1px solid var(--line-2); border-radius: 999px; padding: 6px 12px; font-size: .75rem; color: var(--ink-soft); }
.sp-copy { border-top: 1px solid var(--line); padding-block: 18px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; font-size: .77rem; color: var(--muted); }
.sp-totop, .sp-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 16px; border-radius: var(--r); border: 1px solid var(--line-2); background: var(--paper); color: var(--ink); font-family: var(--disp); font-weight: 700; font-size: .82rem; cursor: pointer; }
.sp-foot .sp-totop { margin: 8px auto 22px; }
.sp-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; opacity: 0; pointer-events: none; transform: translateY(10px); }
.sp-top.show { opacity: 1; pointer-events: auto; transform: none; }
@container (min-width: 760px) { .sp-fg { grid-template-columns: 1.3fr 1fr 1fr 1fr; } }
`, _PageFooter = class _PageFooter extends LitElement {
  constructor() {
    super(...arguments), this.storeName = "", this.dark = !1, this.raised = !1, this.atFooter = !1, this.stop = () => {
    }, this.floater = null, this.onScroll = (event) => {
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
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-announce", announceCss("sp")), injectStyles("sp-page-footer", css);
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
    this.stop(), document.removeEventListener("scroll", this.onScroll, { capture: !0 }), (_a = this.seen) == null || _a.disconnect(), (_b = this.floater) == null || _b.remove(), this.floater = null, super.disconnectedCallback();
  }
  updated() {
    var _a;
    this.syncFloater();
    const button = this.querySelector(".sp-totop");
    if ((_a = this.seen) == null || _a.disconnect(), !button) {
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
    const cfg = getConfig(this.config), brand = localizedString(cfg.brand) || this.storeName || t({ ar: "قوّة", en: "Quwa" }), badge = localizedString(cfg.badge) || "ق", showTop = this.shown(cfg.show_top), topLabel = localizedString(cfg.top_label) || t({ ar: "للأعلى", en: "Back to top" }), columns = [1, 2, 3].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems(cfg[`col${index}`], `col${index}`).map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" })).filter((item) => item.label)
    })).filter((column) => column.title || column.links.length), pays = getCollectionItems(cfg.payments, "payments").map((item) => localizedString(item.label)).filter(Boolean), logo = this.dark && cfg.logo_dark || cfg.logo;
    return html`${announceBar(cfg, "sp", `sp-root ${schemeOf(cfg)}`, "--ann-bg:var(--volt);--ann-ink:#121500;--ann-speed:16s")}
    <footer class=${`sp-root sp-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="sp-wrap">
        <div class="sp-fg">
          <div class="sp-about">
            <a href="#" class="sp-logo">${logo ? html`<img src=${logo} alt=${brand} />` : html`<span class="sp-mark">${badge}</span>${brand}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="sp-pay">${pays.map((pay) => html`<span>${pay}</span>`)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h4>${column.title}</h4>` : nothing}
            <div>${column.links.map((link) => html`<a href=${link.url}>${link.label}</a>`)}</div>
          </div>`)}
        </div>
        ${showTop ? html`<button type="button" class="sp-totop" @click=${this.toTop}>${topLabel}</button>` : nothing}
        <div class="sp-copy">
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
typeof PageFooter < "u" && PageFooter.registerSallaComponent("salla-page-footer");
export {
  PageFooter as default
};
