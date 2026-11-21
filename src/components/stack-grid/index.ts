import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { emptyCopy, frame } from "../../utils/ui.js";

const css = `
.sp-grid { background: var(--sp-section-bg, var(--page)); }
.sp-cols { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-col { background: var(--paper); padding: 26px 24px 28px; position: relative; color: inherit; display: block; transition: background .22s; }
.sp-col:hover { background: var(--paper-2); }
.sp-ph { aspect-ratio: 16/10; border-radius: var(--r); background: linear-gradient(145deg, color-mix(in srgb, var(--volt) 18%, transparent), transparent 70%), var(--page); border: 1px solid var(--line); display: grid; place-items: center; font-size: 2.4rem; margin-block-end: 16px; overflow: hidden; position: relative; }
.sp-ph img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sp-col h3 { font-family: var(--disp); font-weight: 900; font-size: 1.24rem; }
.sp-col p { font-size: .85rem; color: var(--ink-soft); margin-block-start: 6px; }
.sp-pr { display: flex; align-items: center; gap: 9px; margin-block-start: 14px; font-family: var(--disp); font-weight: 700; font-size: 1.1rem; color: var(--accent); }
.sp-pr s { color: var(--muted); font-size: .82rem; font-family: var(--body); font-weight: 300; }
.sp-lb { position: absolute; inset-block-start: 16px; inset-inline-end: 16px; background: var(--hot); color: #fff; font-weight: 700; font-size: .7rem; padding: 4px 10px; border-radius: 4px; }
@container (min-width: 620px) { .sp-cols { grid-template-columns: 1fr 1fr; } }
@container (min-width: 980px) { .sp-cols { grid-template-columns: repeat(3, 1fr); } }
`;

export default class StackGrid extends LitElement {
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
    injectStyles("sp-stack-grid", css);
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
    const cards = getCollectionItems<Record<string, any>>(cfg.cards, "cards")
      .map((item) => ({
        tag: localizedString(item.tag),
        image: String(item.image || ""),
        mark: localizedString(item.mark),
        title: localizedString(item.title),
        note: localizedString(item.note),
        price: localizedString(item.price),
        compare: localizedString(item.compare),
        url: linkHref(item.url),
      }))
      .filter((item) => item.title);
    const id = String(cfg.anchor || "stacks");
    return html`<section class=${`sp-root sp-sec sp-grid ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "products"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="sp-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        ${cards.length ? html`<div class="sp-cols">${cards.map((card, index) => {
          const body = html`
            ${card.tag ? html`<span class="sp-lb">${card.tag}</span>` : nothing}
            ${frame(card.image, card.mark)}
            <h3>${card.title}</h3>
            ${card.note ? html`<p>${card.note}</p>` : nothing}
            ${card.price ? html`<div class="sp-pr">${card.price}${card.compare ? html`<s>${card.compare}</s>` : nothing}</div>` : nothing}`;
          return card.url
            ? html`<a class="sp-col sp-rev" style=${`transition-delay:${index * 0.05}s`} href=${card.url}>${body}</a>`
            : html`<article class="sp-col sp-rev" style=${`transition-delay:${index * 0.05}s`}>${body}</article>`;
        })}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
