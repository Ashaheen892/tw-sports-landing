import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { countUp } from "../../utils/count.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-stats { display: grid; gap: 10px; }
@container (min-width: 760px) { .sp-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.sp-stat { background: #121500; color: #f4f6ef; padding: 22px 18px 16px; transform: skewX(-7deg); }
.sp-stat b, .sp-stat span { display: block; transform: skewX(7deg); }
.sp-stat b { color: var(--volt); font-size: clamp(2rem, 4vw, 3rem); font-weight: 800; line-height: 1; }
.sp-stat span { margin-top: 8px; font-size: .88rem; }
`;

export default class StatStrip extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  private stop = () => {};
  private stopCount = () => {};

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-stat-strip", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.stop = () => { stopLocale(); stopReveal(); };
  }

  disconnectedCallback() {
    this.stop();
    this.stopCount();
    super.disconnectedCallback();
  }

  protected updated() {
    const cfg = getConfig(this.config);
    const on = cfg.count_up === undefined || cfg.count_up === "" || flag(cfg.count_up);
    if (!on) return;
    this.stopCount();
    this.stopCount = countUp(this, ".sp-stat b");
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) }))
      .filter((item) => item.value);
    return html`<section id="sp-stats" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "stats"}>
      <div class="sp-wrap">
        <div class="sp-head">${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : ""}${title ? html`<h2 class="sp-h2">${title}</h2>` : ""}</div>
        ${items.length
          ? html`<div class="sp-stats">${items.map((item) => html`<article class="sp-stat"><b .textContent=${item.value}></b><span>${item.label}</span></article>`)}</div>`
          : emptyCopy()}
      </div>
    </section>`;
  }
}
