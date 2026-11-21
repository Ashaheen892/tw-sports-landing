import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-faq { background: var(--sp-section-bg, var(--page)); }
.sp-acc { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-acc details { background: var(--paper); }
.sp-acc summary { cursor: pointer; list-style: none; padding: 18px 22px; font-family: var(--disp); font-weight: 700; font-size: 1.04rem; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.sp-acc summary::-webkit-details-marker { display: none; }
.sp-acc summary::after { content: "+"; color: var(--accent); font-size: 1.4rem; line-height: 1; }
.sp-acc details[open] summary::after { content: "−"; }
.sp-acc .ans { padding: 0 22px 20px; font-size: .88rem; color: var(--ink-soft); }
`;

export default class AskList extends LitElement {
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
    injectStyles("sp-ask-list", css);
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
      .map((item) => ({ q: localizedString(item.q), a: localizedString(item.a) }))
      .filter((item) => item.q && item.a);
    const id = String(cfg.anchor || "faq");
    return html`<section class=${`sp-root sp-sec sp-faq ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "faq"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
        </div>
        ${items.length
          ? html`<div class="sp-acc sp-rev">${items.map((item, index) => html`<details ?open=${index === 0}><summary>${item.q}</summary><p class="ans">${item.a}</p></details>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
