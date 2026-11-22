import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";
import { clipUrl, frameSrc, isFileClip, setFrameSound } from "../../utils/video.js";

const css = `
.sp-session { background: var(--sp-section-bg, var(--page)); }
.sp-stage { position: relative; margin-block-start: 22px; aspect-ratio: 21 / 9; min-height: 220px; background: #121500; color: #f4f6ea; overflow: hidden; border-radius: 2px 28px 2px 28px; }
.sp-stage video, .sp-stage iframe, .sp-stage img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; border: 0; }
.sp-stage__shade { position: absolute; inset: auto 0 0 0; z-index: 1; display: flex; align-items: end; justify-content: space-between; gap: 12px; padding: 18px 18px 14px; background: linear-gradient(transparent, rgb(18 21 0 / 82%)); pointer-events: none; }
.sp-stage__shade b { font-family: var(--disp); font-weight: 800; font-size: 1.25rem; }
.sp-stage__shade span { font-size: .82rem; color: var(--volt, #d4ff3f); }
.sp-go { position: absolute; z-index: 2; inset: 0; border: 0; background: transparent; cursor: pointer; }
.sp-go b { position: absolute; inset-inline-start: 18px; top: 16px; padding: 6px 12px; background: var(--volt, #d4ff3f); color: #121500; font-family: var(--disp); font-weight: 800; transform: skewX(-8deg); }
.sp-vol { position: absolute; z-index: 3; top: 14px; inset-inline-end: 14px; min-height: 34px; padding: 4px 12px; border: 0; background: #121500; color: var(--volt, #d4ff3f); font: inherit; font-weight: 700; cursor: pointer; }
.sp-slant { margin-block-start: 14px; display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.sp-chip { position: relative; display: block; padding: 0; border: 0; background: transparent; color: inherit; cursor: pointer; text-align: start; }
.sp-chip .cut { display: block; position: relative; aspect-ratio: 4 / 3; overflow: hidden; clip-path: polygon(10% 0, 100% 0, 90% 100%, 0 100%); background: #121500; }
.sp-chip img, .sp-chip video { width: 100%; height: 100%; object-fit: cover; display: block; }
.sp-chip em { display: block; margin-top: 8px; font-style: normal; font-family: var(--disp); font-weight: 700; }
.sp-chip.is-on .cut { outline: 3px solid var(--volt, #d4ff3f); outline-offset: -6px; }
.sp-session .sp-actions { margin-block-start: 20px; }
@container (max-width: 720px) {
  .sp-stage { aspect-ratio: 16 / 10; border-radius: 2px; }
  .sp-slant { grid-template-columns: 1fr; }
  .sp-chip .cut { clip-path: none; }
}
`;

type Clip = { source: string; poster: string; name: string; detail: string };

export default class SessionReels extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private pick = 0;
  @state() private playing = false;
  @state() private sound = false;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-session-reels", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    const video = this.querySelector(".sp-stage video");
    if (video instanceof HTMLVideoElement) video.muted = !this.sound;
    const frame = this.querySelector(".sp-stage iframe");
    if (frame instanceof HTMLIFrameElement) setFrameSound(frame, this.sound);
  }

  private clips(cfg: Record<string, any>): Clip[] {
    return getCollectionItems<Record<string, any>>(cfg.items, "items").map((item) => ({
      source: clipUrl(item.video_url),
      poster: clipUrl(item.poster),
      name: localizedString(item.name),
      detail: localizedString(item.detail),
    })).filter((item) => item.name || item.source || item.poster);
  }

  render() {
    const cfg = getConfig(this.config);
    const clips = this.clips(cfg);
    const current = clips[this.pick] || clips[0];
    const file = current && isFileClip(current.source);
    return html`<section id="session" class=${`sp-root sp-sec sp-session ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${localizedString(cfg.title) || "sessions"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${localizedString(cfg.title) ? html`<h2 class="sp-h2">${localizedString(cfg.title)}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="sp-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${current ? html`<div class="sp-stage sp-rev">
          ${this.playing && current.source
            ? file
              ? html`<video src=${current.source} poster=${current.poster} autoplay muted playsinline loop></video>`
              : html`<iframe src=${frameSrc(current.source)} title=${current.name} allow="autoplay; encrypted-media"></iframe>`
            : current.poster ? html`<img src=${current.poster} alt="">` : nothing}
          ${this.playing
            ? html`<button type="button" class="sp-vol" @click=${() => { this.sound = !this.sound; }}>${this.sound ? t({ ar: "كتم", en: "Mute" }) : t({ ar: "صوت", en: "Sound" })}</button>`
            : html`<button type="button" class="sp-go" @click=${() => { this.playing = true; this.sound = false; }}><b>${localizedString(cfg.play_label) || t({ ar: "تشغيل", en: "Play" })}</b></button>`}
          <div class="sp-stage__shade"><b>${current.name}</b><span>${current.detail}</span></div>
        </div>
        <div class="sp-slant">
          ${clips.map((clip, index) => html`<button type="button" class=${`sp-chip ${index === this.pick ? "is-on" : ""}`} @click=${() => { this.pick = index; this.playing = false; this.sound = false; }}>
            <span class="cut">${clip.poster ? html`<img src=${clip.poster} alt="">` : nothing}</span>
            <em>${clip.name}</em>
          </button>`)}
        </div>` : emptyCopy()}
        <div class="sp-actions">${renderCta(cfg.button_label, "#plan")}</div>
      </div>
    </section>`;
  }
}
