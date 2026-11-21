import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { digits, emptyCopy } from "../../utils/ui.js";

const css = `
.sp-partners { display: grid; }
.sp-partner { display: grid; grid-template-columns: auto 1fr; gap: 8px 14px; align-items: center; padding: 14px 0; border-block-end: 2px solid var(--ink); }
.sp-partner i { font-style: normal; font-weight: 800; color: #121500; background: var(--volt); min-width: 2.4rem; min-height: 2.4rem; display: grid; place-items: center; }
.sp-partner b { display: block; font-weight: 800; }
.sp-partner span { display: block; color: var(--ink-soft); font-size: .86rem; }
`;

export default class PartnerRow extends LitElement {
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
    injectStyles("sp-partner-row", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ name: localizedString(item.name), note: localizedString(item.note) }))
      .filter((item) => item.name);
    return html`<section id="sp-partners" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "partners"}>
      <div class="sp-wrap">
        <div class="sp-head">${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}</div>
        ${items.length
          ? html`<div class="sp-partners">${items.map((item, index) => html`<article class="sp-partner"><i>${digits(index + 1, true)}</i><div><b>${item.name}</b>${item.note ? html`<span>${item.note}</span>` : nothing}</div></article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
