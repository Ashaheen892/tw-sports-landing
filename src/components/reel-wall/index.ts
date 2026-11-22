import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { nudge, watchReels } from "../../utils/reels.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc, isFileClip } from "../../utils/video.js";

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
`;

type Clip = { video: string; poster: string; name: string; chips: string[]; button: string; url: string };

export default class ReelWall extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private active = -1;
  @state() private opened = new Set<number>();
  private stop = () => {};
  private stopReels = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-reel-wall", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    this.stopReels();
    super.disconnectedCallback();
  }

  protected updated() {
    this.stopReels();
    this.stopReels = watchReels(this);
  }

  private tap(index: number, clip: Clip) {
    if (!clip.video) return;
    if (!isFileClip(clip.video)) {
      this.opened = new Set(this.opened).add(index);
      return;
    }
    this.active = this.active === index ? -1 : index;
    this.querySelectorAll<HTMLVideoElement>("video[data-reel]").forEach((video) => {
      const mine = Number(video.dataset.reel) === this.active;
      video.muted = !mine;
      if (mine) void video.play().catch(() => undefined);
    });
  }

  render() {
    const cfg = getConfig(this.config);
    const clips: Clip[] = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        video: clipUrl(item.video),
        poster: String(item.poster || "").trim(),
        name: localizedString(item.name),
        chips: localizedString(item.detail).split(/[·•|،,]/).map((part) => part.trim()).filter(Boolean).slice(0, 3),
        button: localizedString(item.button),
        url: String(item.url || "").trim(),
      }))
      .filter((item) => item.video || item.poster);
    const title = localizedString(cfg.title);
    const left = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5 8 12l7 7" fill="none" stroke="currentColor" stroke-width="2.6" /></svg>`;
    const right = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 7 7-7 7" fill="none" stroke="currentColor" stroke-width="2.6" /></svg>`;
    const track = () => this.querySelector<HTMLElement>(".sp-wall-track");
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
            const file = clip.video && isFileClip(clip.video);
            const frameOpen = clip.video && !file && this.opened.has(index);
            return html`<article class=${`sp-clip ${this.active === index ? "is-on" : ""}`}>
              ${file
                ? html`<video data-reel=${index} src=${clip.video} poster=${clip.poster || nothing} muted loop playsinline preload="metadata" aria-label=${clip.name}></video>`
                : frameOpen
                  ? html`<iframe src=${frameSrc(clip.video)} title=${clip.name} allow="autoplay; encrypted-media; picture-in-picture"></iframe>`
                  : clip.poster ? html`<img src=${clip.poster} alt=${clip.name} loading="lazy" />` : nothing}
              ${frameOpen ? nothing : html`<button type="button" class="sp-clip-tap" aria-label=${file ? (this.active === index ? t({ ar: "كتم الصوت", en: "Mute" }) : t({ ar: "تشغيل الصوت", en: "Play with sound" })) : t({ ar: "تشغيل الفيديو", en: "Play video" })} @click=${() => this.tap(index, clip)}></button>`}
              <span class="sp-clip-no" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
              ${clip.video && !frameOpen ? html`<span class="sp-clip-live" aria-hidden="true">${file ? (this.active === index ? "🔊" : "🔇") : "▶"} ${t({ ar: "شاهد", en: "Watch" })}</span>` : nothing}
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
}
