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

// src/components/drop-slider/index.ts
import { html as html3, LitElement, nothing as nothing2 } from "lit";
import { property } from "lit/decorators.js";

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

// src/utils/video.ts
function clipUrl(value) {
  const raw = unwrapValue(value);
  if (typeof raw === "string") return raw.trim();
  if (raw && typeof raw === "object") {
    const url = raw.url ?? raw.src;
    if (typeof url === "string") return url.trim();
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
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
      else if (parsed.pathname.includes("/embed/")) id = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      else if (parsed.pathname.includes("/shorts/")) id = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      else id = parsed.searchParams.get("v") || "";
      if (id) frame = `https://www.youtube-nocookie.com/embed/${id}`;
    } else if (kind === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop() || "";
      if (/^\d+$/.test(id)) frame = `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    frame = url;
  }
  if (kind === "file") return frame;
  const params = new URLSearchParams();
  params.set("autoplay", "1");
  params.set("playsinline", "1");
  if (kind === "youtube") {
    params.set("mute", "1");
    params.set("rel", "0");
    params.set("enablejsapi", "1");
  } else if (kind === "vimeo") {
    params.set("muted", "1");
  } else {
    params.set("mute", "1");
    params.set("muted", "1");
  }
  return `${frame}${frame.includes("?") ? "&" : "?"}${params.toString()}`;
}
__name(frameSrc, "frameSrc");

// src/utils/deck.ts
var _a;
var Deck = (_a = class {
  constructor(host, imageMs = 6500, frameMs = 18e3) {
    this.host = host;
    this.imageMs = imageMs;
    this.frameMs = frameMs;
    this.index = 0;
    this.sound = false;
    this.paused = false;
    this.reduced = false;
    this.kinds = [];
    /** Slides whose video failed to load: they are timed like an image so the slider never stalls. */
    this.failed = /* @__PURE__ */ new Set();
    this.timer = 0;
    this.left = 0;
    this.since = 0;
    this.point = 0;
    this.pointing = false;
    this.pause = /* @__PURE__ */ __name(() => {
      if (this.paused) return;
      this.paused = true;
      if (this.timer) {
        window.clearTimeout(this.timer);
        this.timer = 0;
        this.left = Math.max(400, this.left - (performance.now() - this.since));
      }
      this.host.requestUpdate();
    }, "pause");
    this.resume = /* @__PURE__ */ __name(() => {
      if (!this.paused) return;
      this.paused = false;
      if (this.auto && this.left) {
        this.since = performance.now();
        this.timer = window.setTimeout(() => this.go(1), this.left);
      }
      this.host.requestUpdate();
    }, "resume");
    /** Bind to a video's error event. */
    this.fail = /* @__PURE__ */ __name(() => {
      if (this.failed.has(this.index)) return;
      this.failed.add(this.index);
      this.arm();
      this.host.requestUpdate();
    }, "fail");
    this.key = /* @__PURE__ */ __name((event) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      event.preventDefault();
      const forward = isRtl() ? event.key === "ArrowLeft" : event.key === "ArrowRight";
      this.go(forward ? 1 : -1);
    }, "key");
    this.down = /* @__PURE__ */ __name((event) => {
      if (event.target.closest("button, a")) return;
      this.point = event.clientX;
      this.pointing = true;
    }, "down");
    this.up = /* @__PURE__ */ __name((event) => {
      if (!this.pointing) return;
      this.pointing = false;
      const delta = event.clientX - this.point;
      if (Math.abs(delta) < 48) return;
      const forward = isRtl() ? delta > 0 : delta < 0;
      this.go(forward ? 1 : -1);
    }, "up");
    /** Fills a progress bar from a video file's own clock. */
    this.progress = /* @__PURE__ */ __name((event) => {
      const video = event.currentTarget;
      const bar = this.host.querySelector("[data-deck-fill]");
      if (bar && video.duration) bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
    }, "progress");
    host.addController(this);
  }
  static kindOf(video) {
    if (!video) return "image";
    return isFileClip(video) ? "file" : "frame";
  }
  hostConnected() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.host.addEventListener("pointerenter", this.pause);
    this.host.addEventListener("pointerleave", this.resume);
    this.host.addEventListener("focusin", this.pause);
    this.host.addEventListener("focusout", this.resume);
  }
  hostDisconnected() {
    window.clearTimeout(this.timer);
    this.host.removeEventListener("pointerenter", this.pause);
    this.host.removeEventListener("pointerleave", this.resume);
    this.host.removeEventListener("focusin", this.pause);
    this.host.removeEventListener("focusout", this.resume);
  }
  /** Call from render with the current slides. Starts the clock on the first call and when the slides change. */
  sync(kinds) {
    const changed = kinds.join() !== this.kinds.join();
    if (changed) this.failed.clear();
    this.kinds = kinds;
    if (this.index >= kinds.length) this.index = 0;
    if (changed) this.arm();
  }
  get count() {
    return this.kinds.length;
  }
  get kind() {
    const kind = this.kinds[this.index] || "image";
    return kind === "file" && this.failed.has(this.index) ? "image" : kind;
  }
  /** How long the current slide stays, or 0 when it waits for a video to end. */
  get ms() {
    if (this.kind === "file") return 0;
    return this.kind === "frame" ? this.frameMs : this.imageMs;
  }
  get auto() {
    return !this.reduced && this.count > 1;
  }
  arm(ms = this.ms) {
    window.clearTimeout(this.timer);
    this.timer = 0;
    this.left = ms;
    if (!this.auto || !ms) return;
    this.since = performance.now();
    if (this.paused) return;
    this.timer = window.setTimeout(() => this.go(1), ms);
  }
  go(dir) {
    if (this.count < 2) return;
    this.index = (this.index + dir + this.count) % this.count;
    this.arm();
    this.host.requestUpdate();
  }
  pick(index) {
    this.index = index;
    this.arm();
    this.host.requestUpdate();
  }
  toggleSound() {
    this.sound = !this.sound;
    this.host.requestUpdate();
  }
}, __name(_a, "Deck"), _a);

// src/utils/landing.ts
import { html, nothing } from "lit";
function salla() {
  return window.Salla;
}
__name(salla, "salla");
function landingSettings() {
  return salla()?.config?.get("theme.settings") || {};
}
__name(landingSettings, "landingSettings");
function isLandingPage() {
  return salla()?.config?.get("page.is_landing_page") === true;
}
__name(isLandingPage, "isLandingPage");
function pageMode() {
  const value = landingSettings().page_for_product;
  if (typeof value === "boolean" || value == null) return value === false ? "promotion" : "product";
  if (typeof value === "string") return value === "promotion" ? "promotion" : "product";
  return Array.isArray(value) && value[0]?.value === "promotion" ? "promotion" : "product";
}
__name(pageMode, "pageMode");
function landingProductId() {
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = landingSettings().product?.value?.[0];
  return id ? String(id) : null;
}
__name(landingProductId, "landingProductId");
function mainButton() {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}
__name(mainButton, "mainButton");
function openCheckout() {
  const checkout = document.querySelector(".s-block--fast-checkout");
  const layout = checkout?.getAttribute("data-layout");
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
  const cls = tone === "ghost" ? "sp-btn ghost" : tone === "light" ? "sp-btn light" : "sp-btn";
  const productPage = Boolean(landingProductId());
  const demo = !isLandingPage();
  if (productPage || demo && !fallbackUrl) {
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  }
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  if (!href) return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  return html`<a class=${cls} href=${href}>${label}</a>`;
}
__name(renderCta, "renderCta");
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
      const salla2 = window.Salla;
      on = window.self !== window.top || salla2?.config?.get?.("page.is_landing_page") !== true;
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

// src/utils/ui.ts
import { html as html2 } from "lit";
function emptyCopy() {
  return html2`<p class="sp-empty">${t({ ar: "\u0623\u0636\u0641 \u0639\u0646\u0627\u0635\u0631 \u0647\u0630\u0627 \u0627\u0644\u0642\u0633\u0645 \u0645\u0646 \u0627\u0644\u0625\u0639\u062F\u0627\u062F\u0627\u062A", en: "Add this section's items in the settings" })}</p>`;
}
__name(emptyCopy, "emptyCopy");

// src/components/drop-slider/index.ts
var css = `
.sp-drop { background: var(--sp-section-bg, var(--page)); padding-block: 1.25rem 2.5rem; }
.sp-drop-stage { position: relative; min-height: clamp(440px, 74vh, 760px); display: grid; align-items: end; overflow: hidden; overflow: clip; background: #121500; color: #f4f7f8; clip-path: polygon(0 0, 100% 0, 100% calc(100% - 46px), calc(100% - 46px) 100%, 0 100%); touch-action: pan-y; }
.sp-drop-stage > img, .sp-drop-stage > video, .sp-drop-stage > iframe { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; animation: sp-drop-in .5s cubic-bezier(.2,.8,.2,1); }
.sp-drop-stage > iframe { pointer-events: none; transform: scale(1.35); }
.sp-drop-stage::before { content: ""; position: absolute; inset: 0; z-index: 1; background: linear-gradient(0deg, rgb(8 9 10 / 92%), rgb(8 9 10 / 10%) 60%), var(--diag); opacity: .95; pointer-events: none; }
.sp-dbars { position: absolute; z-index: 3; top: 16px; inset-inline: 16px; display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 6px; }
.sp-dbars button { position: relative; height: 22px; padding: 0; border: 0; background: transparent; cursor: pointer; }
.sp-dbars button::before { content: ""; position: absolute; inset-inline: 0; top: 9px; height: 4px; background: rgb(244 247 248 / 28%); transform: skewX(-20deg); }
.sp-dbars i { position: absolute; inset-inline: 0; top: 9px; height: 4px; background: var(--volt); transform: skewX(-20deg) scaleX(0); transform-origin: right; }
[dir="ltr"] .sp-dbars i { transform-origin: left; }
.sp-dbars .past i, .sp-dbars .on i.done { transform: skewX(-20deg) scaleX(1); }
.sp-dbars .on i.run { animation: sp-bar var(--ms, 6500ms) linear forwards; }
.sp-drop.is-held .sp-dbars i.run { animation-play-state: paused; }
.sp-drop-copy { position: relative; z-index: 2; display: grid; gap: 12px; padding: clamp(22px, 4vw, 44px); padding-bottom: clamp(56px, 7vw, 78px); max-width: 720px; }
.sp-drop-tag { justify-self: start; padding: 4px 12px; background: var(--volt); color: #121500; font-weight: 800; font-size: .8rem; transform: skewX(-8deg); }
.sp-drop-copy h2 { font-family: var(--disp); font-weight: 900; font-size: clamp(2rem, 5.4vw, 3.8rem); line-height: 1.08; letter-spacing: -.02em; }
.sp-drop-copy p { color: #c9d1d6; max-width: 50ch; }
.sp-drop-count { position: absolute; z-index: 2; bottom: 58px; inset-inline-end: clamp(22px, 4vw, 44px); font-family: ui-monospace, Menlo, monospace; font-weight: 800; font-size: clamp(2.6rem, 7vw, 4.6rem); line-height: 1; color: transparent; -webkit-text-stroke: 1.5px var(--volt); }
.sp-drop-count small { font-size: .35em; -webkit-text-stroke: 0; color: #f4f7f8; opacity: .7; }
.sp-drop-sound { position: absolute; z-index: 3; top: 48px; inset-inline-end: 16px; min-height: 2.3rem; padding: 0 12px; border: 0; background: #121500; color: var(--volt); font: inherit; font-weight: 800; cursor: pointer; transform: skewX(-8deg); }
.sp-drop-nav { position: absolute; z-index: 2; inset: 40px 0 46px; display: grid; grid-template-columns: 1fr 1fr; pointer-events: none; }
.sp-drop-nav button { pointer-events: auto; border: 0; background: transparent; cursor: pointer; }
.sp-drop-nav button:focus-visible { outline: 3px solid var(--volt); outline-offset: -6px; }
@keyframes sp-bar { to { transform: skewX(-20deg) scaleX(1); } }
@keyframes sp-drop-in { from { opacity: .2; transform: scale(1.06); } to { opacity: 1; transform: none; } }
@container (max-width: 720px) { .sp-drop-count { display: none; } .sp-drop-stage { clip-path: none; } }
@media (prefers-reduced-motion: reduce) { .sp-drop-stage > * { animation: none !important; } .sp-dbars i.run { animation: none !important; transform: skewX(-20deg) scaleX(1); } }
`;
var _DropSlider = class _DropSlider extends LitElement {
  constructor() {
    super(...arguments);
    this.deck = new Deck(this, 6e3, 18e3);
    this.stop = /* @__PURE__ */ __name(() => {
    }, "stop");
  }
  createRenderRoot() {
    return this;
  }
  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-drop-slider", css);
    this.stop = watchLocale(this);
  }
  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }
  media(slide, total) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "image") return slide.image ? html3`<img src=${slide.image} alt=${slide.alt || slide.title} />` : nothing2;
    if (kind === "frame") return html3`<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
    return html3`<video src=${slide.video} poster=${slide.image || nothing2} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="sp-drop-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "\u0643\u062A\u0645", en: "Mute" }) : t({ ar: "\u{1F50A} \u0627\u0644\u0635\u0648\u062A", en: "\u{1F50A} Sound" })}</button>`;
  }
  render() {
    const cfg = getConfig(this.config);
    const slides = getCollectionItems(cfg.items, "items").map((item) => ({
      image: String(item.image || "").trim(),
      video: clipUrl(item.video),
      alt: localizedString(item.alt),
      tag: localizedString(item.tag),
      title: localizedString(item.title),
      text: localizedString(item.text),
      button: localizedString(item.button),
      url: String(item.url || "").trim()
    })).filter((item) => item.title || item.image || item.video);
    const deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index];
    const label = localizedString(cfg.title) || t({ ar: "\u0633\u0644\u0627\u064A\u062F\u0631", en: "Slider" });
    const barClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    return html3`<section id="sp-drop" class=${`sp-root sp-drop ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="sp-wrap">
        ${slide ? html3`<div class="sp-drop-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
          ${this.media(slide, slides.length)}
          ${slides.length > 1 ? html3`<div class="sp-dbars">${slides.map((item, index) => html3`<button type="button" class=${index === deck.index ? "on" : index < deck.index ? "past" : ""}
              aria-label=${item.title || t({ ar: `\u0627\u0644\u0634\u0631\u064A\u062D\u0629 ${index + 1}`, en: `Slide ${index + 1}` })} aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
              <i class=${index === deck.index ? barClass : ""} ?data-deck-fill=${index === deck.index && deck.kind === "file"}></i>
            </button>`)}</div>
            <div class="sp-drop-nav" aria-hidden="true"><button type="button" tabindex="-1" @click=${() => deck.go(-1)}></button><button type="button" tabindex="-1" @click=${() => deck.go(1)}></button></div>` : nothing2}
          <div class="sp-drop-copy" aria-live="polite">
            ${slide.tag ? html3`<span class="sp-drop-tag">${slide.tag}</span>` : nothing2}
            ${slide.title ? html3`<h2>${slide.title}</h2>` : nothing2}
            ${slide.text ? html3`<p>${slide.text}</p>` : nothing2}
            ${slide.button ? html3`<div>${renderCta(slide.button, slide.url)}</div>` : nothing2}
          </div>
          ${slides.length > 1 ? html3`<div class="sp-drop-count" aria-hidden="true"><span dir="ltr">${String(deck.index + 1).padStart(2, "0")}<small>/${String(slides.length).padStart(2, "0")}</small></span></div>` : nothing2}
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
};
__name(_DropSlider, "DropSlider");
__decorateClass([
  property({ type: Object })
], _DropSlider.prototype, "config", 2);
var DropSlider = _DropSlider;
export {
  DropSlider as default
};
typeof DropSlider < "u" && DropSlider.registerSallaComponent("salla-drop-slider");
