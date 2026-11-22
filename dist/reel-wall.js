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
function watchReels(root, selector = "video[data-reel]") {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window)) return () => {
  };
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target;
      entry.isIntersecting && entry.intersectionRatio > 0.55 && !reduced ? video.play().catch(() => {
      }) : video.paused || video.pause();
    });
  }, { threshold: [0, 0.55, 1] });
  return root.querySelectorAll(selector).forEach((video) => io.observe(video)), () => io.disconnect();
}
__name(watchReels, "watchReels");
function nudge(track, dir) {
  if (!track) return;
  const card = track.firstElementChild, step = ((card == null ? void 0 : card.getBoundingClientRect().width) || 260) + 14, rtl = getComputedStyle(track).direction === "rtl";
  track.scrollBy({ left: (rtl ? -1 : 1) * dir * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
__name(nudge, "nudge");
function markEditing() {
  var _a, _b;
  const root = document.documentElement, read = /* @__PURE__ */ __name(() => {
    var _a2, _b2;
    let on = !0;
    try {
      const salla2 = window.Salla;
      on = window.self !== window.top || ((_b2 = (_a2 = salla2 == null ? void 0 : salla2.config) == null ? void 0 : _a2.get) == null ? void 0 : _b2.call(_a2, "page.is_landing_page")) !== !0;
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
function clipUrl(value) {
  const raw = unwrapValue(value);
  if (typeof raw == "string") return raw.trim();
  if (raw && typeof raw == "object") {
    const url = raw.url ?? raw.src;
    if (typeof url == "string") return url.trim();
  }
  return "";
}
__name(clipUrl, "clipUrl");
function isFileClip(url) {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
}
__name(isFileClip, "isFileClip");
function kindOf(url) {
  if (isFileClip(url)) return "file";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) return "youtube";
    if (host.includes("vimeo.com")) return "vimeo";
  } catch {
  }
  return "other";
}
__name(kindOf, "kindOf");
function frameSrc(url) {
  var _a, _b;
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      host === "youtu.be" ? id = parsed.pathname.split("/").filter(Boolean)[0] || "" : parsed.pathname.includes("/embed/") ? id = ((_a = parsed.pathname.split("/embed/")[1]) == null ? void 0 : _a.split("/")[0]) || "" : parsed.pathname.includes("/shorts/") ? id = ((_b = parsed.pathname.split("/shorts/")[1]) == null ? void 0 : _b.split("/")[0]) || "" : id = parsed.searchParams.get("v") || "", id && (frame = `https://www.youtube-nocookie.com/embed/${id}`);
    } else if (kind === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop() || "";
      /^\d+$/.test(id) && (frame = `https://player.vimeo.com/video/${id}`);
    }
  } catch {
    frame = url;
  }
  if (kind === "file") return frame;
  const params = new URLSearchParams();
  return params.set("autoplay", "1"), params.set("playsinline", "1"), kind === "youtube" ? (params.set("mute", "1"), params.set("rel", "0"), params.set("enablejsapi", "1")) : (kind === "vimeo" || params.set("mute", "1"), params.set("muted", "1")), `${frame}${frame.includes("?") ? "&" : "?"}${params.toString()}`;
}
__name(frameSrc, "frameSrc");
var __defProp2 = Object.defineProperty, __decorateClass = /* @__PURE__ */ __name((decorators, target, key, kind) => {
  for (var result = void 0, i = decorators.length - 1, decorator; i >= 0; i--)
    (decorator = decorators[i]) && (result = decorator(target, key, result) || result);
  return result && __defProp2(target, key, result), result;
}, "__decorateClass");
const css = `
.sp-wall { background: var(--sp-section-bg, var(--page)); overflow: hidden; }
.sp-wall-top { display: flex; flex-wrap: wrap; align-items: end; justify-content: space-between; gap: 14px; margin-bottom: 20px; }
.sp-wall-top .sp-head { align-items: flex-start; text-align: start; margin: 0; }
.sp-wall-top .sp-lead { margin-inline: 0; }
.sp-wall-nav { display: flex; gap: 8px; }
.sp-wall-nav button { width: 3rem; height: 3rem; display: grid; place-items: center; border: 0; background: var(--volt); color: #121500; transform: skewX(-8deg); cursor: pointer; }
.sp-wall-nav svg { width: 1.2rem; height: 1.2rem; transform: skewX(8deg); }
[dir="rtl"] .sp-wall-nav svg { transform: skewX(8deg) scaleX(-1); }
.sp-wall-track { display: grid; grid-auto-flow: column; grid-auto-columns: clamp(220px, 24vw, 280px); gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; padding-bottom: 8px; scrollbar-width: thin; scrollbar-color: var(--volt) transparent; }
.sp-clip { position: relative; scroll-snap-align: start; aspect-ratio: 9 / 16; overflow: hidden; background: #121500; color: #f4f7f8; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 28px), calc(100% - 28px) 100%, 0 100%); }
.sp-clip > video, .sp-clip > img, .sp-clip > iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.sp-clip::after { content: ""; position: absolute; inset: 0; background: linear-gradient(0deg, rgb(8 9 10 / 94%) 6%, transparent 55%); pointer-events: none; }
.sp-clip.is-on { box-shadow: inset 0 0 0 3px var(--volt); }
.sp-clip-tap { position: absolute; z-index: 2; inset: 0; border: 0; background: transparent; cursor: pointer; }
.sp-clip-no { position: absolute; z-index: 3; top: 8px; inset-inline-start: 12px; font-weight: 900; font-size: 2.6rem; line-height: 1; color: transparent; -webkit-text-stroke: 1.5px var(--volt); font-variant-numeric: tabular-nums; pointer-events: none; }
.sp-clip-live { position: absolute; z-index: 3; top: 12px; inset-inline-end: 12px; padding: 3px 10px; background: var(--volt); color: #121500; font-weight: 800; font-size: .72rem; transform: skewX(-8deg); pointer-events: none; }
.sp-clip-body { position: absolute; z-index: 3; inset-inline: 0; bottom: 0; padding: 14px 14px 30px; display: grid; gap: 6px; pointer-events: none; }
.sp-clip-body b { font-weight: 800; font-size: 1.05rem; }
.sp-clip-chips { display: flex; flex-wrap: wrap; gap: 5px; }
.sp-clip-chips span { padding: 2px 8px; background: rgb(212 255 63 / 16%); color: var(--volt); font-size: .72rem; font-weight: 700; }
.sp-clip-body .sp-clip-buy { pointer-events: auto; margin-top: 4px; }
.sp-clip-body .sp-clip-buy a, .sp-clip-body .sp-clip-buy button { min-height: 2.4rem; width: 100%; font-size: .82rem; }
@container (max-width: 640px) { .sp-wall-track { grid-auto-columns: 72%; } .sp-wall-nav { display: none; } }
`, _ReelWall = class _ReelWall extends LitElement {
  constructor() {
    super(...arguments), this.active = -1, this.opened = /* @__PURE__ */ new Set(), this.stop = () => {
    }, this.stopReels = () => {
    };
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback(), this.classList.add("sp-host"), injectStyles("sp-base", baseCss), injectStyles("sp-reel-wall", css);
    const stopLocale = watchLocale(this), stopReveal = watchReveal(this);
    this.stop = () => {
      stopLocale(), stopReveal();
    };
  }
  disconnectedCallback() {
    this.stop(), this.stopReels(), super.disconnectedCallback();
  }
  updated() {
    this.stopReels(), this.stopReels = watchReels(this);
  }
  tap(index, clip) {
    if (clip.video) {
      if (!isFileClip(clip.video)) {
        this.opened = new Set(this.opened).add(index);
        return;
      }
      this.active = this.active === index ? -1 : index, this.querySelectorAll("video[data-reel]").forEach((video) => {
        const mine = Number(video.dataset.reel) === this.active;
        video.muted = !mine, mine && video.play().catch(() => {
        });
      });
    }
  }
  render() {
    const cfg = getConfig(this.config), clips = getCollectionItems(cfg.items, "items").map((item) => ({
      video: clipUrl(item.video),
      poster: String(item.poster || "").trim(),
      name: localizedString(item.name),
      chips: localizedString(item.detail).split(/[·•|،,]/).map((part) => part.trim()).filter(Boolean).slice(0, 3),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.video || item.poster), title = localizedString(cfg.title), left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.6" /></svg>`, right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" /></svg>`, track = /* @__PURE__ */ __name(() => this.querySelector(".sp-wall-track"), "track");
    return html`<section id="sp-wall" class=${`sp-root sp-sec sp-wall ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "reels"}>
      <div class="sp-wrap">
        <div class="sp-wall-top">
          <div class="sp-head">
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
            ${localizedString(cfg.text) ? html`<p class="sp-lead">${localizedString(cfg.text)}</p>` : nothing}
          </div>
          ${clips.length > 2 ? html`<div class="sp-wall-nav">
            <button type="button" aria-label=${t({ ar: "السابق", en: "Previous" })} @click=${() => nudge(track(), -1)}>${left}</button>
            <button type="button" aria-label=${t({ ar: "التالي", en: "Next" })} @click=${() => nudge(track(), 1)}>${right}</button>
          </div>` : nothing}
        </div>
        ${clips.length ? html`<div class="sp-wall-track">
          ${clips.map((clip, index) => {
      const file = clip.video && isFileClip(clip.video), frameOpen = clip.video && !file && this.opened.has(index);
      return html`<article class=${`sp-clip ${this.active === index ? "is-on" : ""}`}>
              ${file ? html`<video data-reel=${index} src=${clip.video} poster=${clip.poster || nothing} muted loop playsinline preload="metadata" aria-label=${clip.name}></video>` : frameOpen ? html`<iframe src=${frameSrc(clip.video)} title=${clip.name} allow="autoplay; encrypted-media; picture-in-picture"></iframe>` : clip.poster ? html`<img src=${clip.poster} alt=${clip.name} loading="lazy" />` : nothing}
              ${frameOpen ? nothing : html`<button type="button" class="sp-clip-tap" aria-label=${file ? this.active === index ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Play with sound" }) : t({ ar: "تشغيل الفيديو", en: "Play video" })} @click=${() => this.tap(index, clip)}></button>`}
              <span class="sp-clip-no" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
              ${clip.video && !frameOpen ? html`<span class="sp-clip-live" aria-hidden="true">${file ? this.active === index ? "🔊" : "🔇" : "▶"} ${t({ ar: "شاهد", en: "Watch" })}</span>` : nothing}
              <div class="sp-clip-body">
                ${clip.name ? html`<b>${clip.name}</b>` : nothing}
                ${clip.chips.length ? html`<div class="sp-clip-chips">${clip.chips.map((chip) => html`<span>${chip}</span>`)}</div>` : nothing}
                ${clip.button ? html`<div class="sp-clip-buy">${renderCta(clip.button, clip.url)}</div>` : nothing}
              </div>
            </article>`;
    })}
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
};
__name(_ReelWall, "ReelWall");
let ReelWall = _ReelWall;
__decorateClass([
  property({ type: Object })
], ReelWall.prototype, "config");
__decorateClass([
  state()
], ReelWall.prototype, "active");
__decorateClass([
  state()
], ReelWall.prototype, "opened");
typeof ReelWall < "u" && ReelWall.registerSallaComponent("salla-reel-wall");
export {
  ReelWall as default
};
