import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-brands { display: flex; flex-wrap: wrap; gap: 10px; }
.sp-brand { display: inline-flex; align-items: center; gap: 8px; min-height: 3rem; padding: 0 14px; border: 2px solid var(--volt); color: inherit; text-decoration: none; font-weight: 800; transform: skewX(-8deg); }
.sp-brand span, .sp-brand img { transform: skewX(8deg); }
.sp-brand img { height: 22px; width: auto; max-width: 64px; object-fit: contain; }
.sp-brand small { display: block; font-weight: 500; font-size: .75rem; }
`;

export default class BrandRow extends LitElement {
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
    injectStyles("sp-brand-row", css);
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
      .map((item) => ({ name: localizedString(item.name), note: localizedString(item.note), image: String(item.image || "").trim(), url: String(item.url || "").trim() }))
      .filter((item) => item.name);
    const inner = (item: { name: string; note: string; image: string }) => html`${item.image ? html`<img src=${item.image} alt="" />` : nothing}<span><b>${item.name}</b>${item.note ? html`<small>${item.note}</small>` : nothing}</span>`;
    return html`<section id="sp-brands" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "brands"}>
      <div class="sp-wrap">
        <div class="sp-head">${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}</div>
        ${items.length ? html`<div class="sp-brands">${items.map((item) => item.url ? html`<a class="sp-brand" href=${item.url}>${inner(item)}</a>` : html`<span class="sp-brand">${inner(item)}</span>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
