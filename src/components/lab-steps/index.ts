import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { digits, emptyCopy } from "../../utils/ui.js";

const css = `
.sp-labs { background: var(--sp-section-bg, var(--page)); }
.sp-lab { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-lf { background: var(--paper); padding: 30px 26px; display: flex; gap: 18px; align-items: flex-start; }
.sp-lf b { font-family: var(--disp); font-weight: 900; font-size: 2rem; color: transparent; -webkit-text-stroke: 1.4px var(--accent); line-height: 1; flex: 0 0 auto; }
.sp-lf h3 { font-family: var(--disp); font-weight: 900; font-size: 1.16rem; }
.sp-lf p { font-size: .87rem; color: var(--ink-soft); margin-block-start: 7px; }
@container (min-width: 760px) { .sp-lab { grid-template-columns: 1fr 1fr; } }
`;

export default class LabSteps extends LitElement {
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
    injectStyles("sp-lab-steps", css);
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
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({
        mark: localizedString(item.mark),
        title: localizedString(item.title),
        text: localizedString(item.text),
      }))
      .filter((item) => item.title);
    const id = String(cfg.anchor || "labs");
    return html`<section class=${`sp-root sp-sec sp-labs ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "labs"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="sp-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${items.length ? html`<div class="sp-lab">${items.map((item, index) => html`<article class="sp-lf sp-rev" style=${`transition-delay:${index * 0.06}s`}>
          <b>${item.mark || digits(index + 1, true)}</b>
          <div><h3>${item.title}</h3>${item.text ? html`<p>${item.text}</p>` : nothing}</div>
        </article>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
