import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { Deck } from "../../utils/deck.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc } from "../../utils/video.js";

const css = `
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

type Slide = { image: string; video: string; alt: string; tag: string; title: string; text: string; button: string; url: string };

export default class DropSlider extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private deck = new Deck(this, 6000, 18000);
  private stop = () => {};

  protected createRenderRoot() {
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

  private media(slide: Slide, total: number) {
    const kind = Deck.kindOf(slide.video);
    if (kind === "image") return slide.image ? html`<img src=${slide.image} alt=${slide.alt || slide.title} />` : nothing;
    if (kind === "frame") return html`<iframe src=${frameSrc(slide.video)} title=${slide.alt || slide.title} allow="autoplay; encrypted-media; picture-in-picture" loading="lazy"></iframe>`;
    return html`<video src=${slide.video} poster=${slide.image || nothing} .muted=${!this.deck.sound} autoplay playsinline preload="metadata" ?loop=${total < 2 || this.deck.reduced}
        aria-label=${slide.alt || slide.title} @timeupdate=${this.deck.progress} @ended=${() => this.deck.go(1)} @error=${this.deck.fail}></video>
      <button type="button" class="sp-drop-sound" @click=${() => this.deck.toggleSound()}>${this.deck.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "🔊 الصوت", en: "🔊 Sound" })}</button>`;
  }

  render() {
    const cfg = getConfig(this.config);
    const slides: Slide[] = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        image: String(item.image || "").trim(),
        video: clipUrl(item.video),
        alt: localizedString(item.alt),
        tag: localizedString(item.tag),
        title: localizedString(item.title),
        text: localizedString(item.text),
        button: localizedString(item.button),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.title || item.image || item.video);
    const deck = this.deck;
    deck.sync(slides.map((item) => Deck.kindOf(item.video)));
    const slide = slides[deck.index];
    const label = localizedString(cfg.title) || t({ ar: "سلايدر", en: "Slider" });
    const barClass = deck.kind === "file" ? "" : deck.auto ? "run" : "done";
    return html`<section id="sp-drop" class=${`sp-root sp-drop ${schemeOf(cfg)} ${deck.paused ? "is-held" : ""}`} style=${`${sectionStyle(cfg)};--ms:${deck.ms}ms`}
        aria-roledescription="carousel" aria-label=${label} @keydown=${deck.key}>
      <div class="sp-wrap">
        ${slide ? html`<div class="sp-drop-stage" @pointerdown=${deck.down} @pointerup=${deck.up} @pointercancel=${deck.up}>
          ${this.media(slide, slides.length)}
          ${slides.length > 1 ? html`<div class="sp-dbars">${slides.map((item, index) => html`<button type="button" class=${index === deck.index ? "on" : index < deck.index ? "past" : ""}
              aria-label=${item.title || t({ ar: `الشريحة ${index + 1}`, en: `Slide ${index + 1}` })} aria-current=${index === deck.index ? "true" : "false"} @click=${() => deck.pick(index)}>
              <i class=${index === deck.index ? barClass : ""} ?data-deck-fill=${index === deck.index && deck.kind === "file"}></i>
            </button>`)}</div>
            <div class="sp-drop-nav" aria-hidden="true"><button type="button" tabindex="-1" @click=${() => deck.go(-1)}></button><button type="button" tabindex="-1" @click=${() => deck.go(1)}></button></div>` : nothing}
          <div class="sp-drop-copy" aria-live="polite">
            ${slide.tag ? html`<span class="sp-drop-tag">${slide.tag}</span>` : nothing}
            ${slide.title ? html`<h2>${slide.title}</h2>` : nothing}
            ${slide.text ? html`<p>${slide.text}</p>` : nothing}
            ${slide.button ? html`<div>${renderCta(slide.button, slide.url)}</div>` : nothing}
          </div>
          ${slides.length > 1 ? html`<div class="sp-drop-count" aria-hidden="true"><span dir="ltr">${String(deck.index + 1).padStart(2, "0")}<small>/${String(slides.length).padStart(2, "0")}</small></span></div>` : nothing}
        </div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
