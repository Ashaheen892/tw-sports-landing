import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { digits, emptyCopy } from "../../utils/ui.js";

const css = `
.sp-partners { display: grid; gap: 12px; }
@container (min-width: 640px) { .sp-partners { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); } }
.sp-partner { position: relative; display: grid; align-content: space-between; gap: 22px; min-height: 170px; padding: 18px 18px 22px; background: var(--paper); border: 1px solid var(--line); overflow: hidden; }
.sp-partner::after { content: ""; position: absolute; inset-inline: 0; bottom: 0; height: 6px; background: var(--volt); transform-origin: right; transform: scaleX(.35); transition: transform .35s ease; }
.sp-partner:hover::after { transform: scaleX(1); }
.sp-partner i { font-style: normal; font-weight: 900; font-size: 3.2rem; line-height: .9; color: transparent; -webkit-text-stroke: 1.5px var(--accent); font-variant-numeric: tabular-nums; }
.sp-partner b { display: block; font-weight: 800; font-size: 1.15rem; }
.sp-partner span { display: inline-block; margin-top: 6px; padding: 2px 10px; background: var(--paper-2); color: var(--ink-soft); font-size: .78rem; transform: skewX(-8deg); }
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
