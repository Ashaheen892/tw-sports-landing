import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-proof { background: var(--sp-section-bg, var(--page)); }
.sp-proofs { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-pf { background: var(--paper); padding: 28px 20px; }
.sp-pf i { font-style: normal; font-size: 1.6rem; display: block; margin-block-end: 12px; }
.sp-pf b { display: block; font-family: var(--disp); font-weight: 700; font-size: 1.04rem; }
.sp-pf span { font-size: .8rem; color: var(--ink-soft); }
@container (min-width: 680px) { .sp-proofs { grid-template-columns: repeat(4, 1fr); } }
`;

export default class ProofRow extends LitElement {
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
    injectStyles("sp-proof-row", css);
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
    return html`<section class=${`sp-root sp-sec sp-proof ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "proof"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
        </div>
        ${items.length ? html`<div class="sp-proofs">${items.map((item, index) => html`<div class="sp-pf sp-rev" style=${`transition-delay:${index * 0.06}s`}>
          ${item.mark ? html`<i aria-hidden="true">${item.mark}</i>` : nothing}
          <b>${item.title}</b>
          ${item.text ? html`<span>${item.text}</span>` : nothing}
        </div>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
