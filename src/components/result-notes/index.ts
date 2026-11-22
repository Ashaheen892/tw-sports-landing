import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-notes { background: var(--sp-section-bg, var(--page)); }
.sp-tally { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; margin-block-end: 28px; }
.sp-st { background: var(--paper); padding: 28px 16px; text-align: center; }
.sp-st b { display: block; font-family: var(--disp); font-weight: 900; font-size: 2.2rem; color: var(--accent); line-height: 1.1; }
.sp-st span { font-size: .79rem; color: var(--ink-soft); }
.sp-rv { columns: 3; column-gap: 16px; }
.sp-rc { break-inside: avoid; background: var(--paper); border: 1px solid var(--line); border-radius: var(--r); padding: 20px; margin-block-end: 16px; }
.sp-rc .stars { color: var(--accent); font-size: .84rem; letter-spacing: .14em; }
.sp-rc p { font-size: .87rem; color: var(--ink-soft); margin-block: 9px; }
.sp-who { display: flex; align-items: center; gap: 10px; border-block-start: 1px solid var(--line); padding-block-start: 12px; }
.sp-av { width: 36px; height: 36px; border-radius: var(--r); background: var(--volt); color: #121500; display: grid; place-items: center; font-family: var(--disp); font-weight: 900; font-size: .95rem; }
.sp-who b { font-family: var(--disp); font-weight: 700; font-size: .97rem; display: block; color: var(--ink); }
.sp-who span { font-size: .74rem; color: var(--muted); }
@container (max-width: 980px) { .sp-rv { columns: 2; } }
@container (max-width: 640px) { .sp-rv { columns: 1; } }
@container (min-width: 620px) { .sp-tally { grid-template-columns: repeat(4, 1fr); } }
`;

export default class ResultNotes extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private stop = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-result-notes", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const stats = getCollectionItems<Record<string, any>>(cfg.stats, "stats")
      .map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) }))
      .filter((item) => item.value);
    const notes = getCollectionItems<Record<string, any>>(cfg.notes, "notes")
      .map((item) => ({
        stars: localizedString(item.stars),
        quote: localizedString(item.quote),
        name: localizedString(item.name),
        meta: localizedString(item.meta),
        initial: localizedString(item.initial),
      }))
      .filter((item) => item.quote);
    const id = String(cfg.anchor || "reviews");
    return html`<section class=${`sp-root sp-sec sp-notes ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "reviews"}>
      <div class="sp-wrap">
        ${stats.length ? html`<div class="sp-tally">${stats.map((item, index) => html`<div class="sp-st sp-rev" style=${`transition-delay:${index * 0.06}s`}><b>${item.value}</b><span>${item.label}</span></div>`)}</div>` : nothing}
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
        </div>
        ${notes.length ? html`<div class="sp-rv">${notes.map((note) => html`<article class="sp-rc sp-rev">
          ${note.stars ? html`<div class="stars">${note.stars}</div>` : nothing}
          <p>${note.quote}</p>
          <div class="sp-who"><span class="sp-av">${note.initial || note.name.slice(0, 1)}</span><div><b>${note.name}</b>${note.meta ? html`<span>${note.meta}</span>` : nothing}</div></div>
        </article>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
