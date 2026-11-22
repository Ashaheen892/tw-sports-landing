import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";

const css = `
.sp-close { background: var(--sp-section-bg, var(--page)); }
.sp-duo { display: grid; gap: 16px; margin-block-end: 16px; }
.sp-dc { border-radius: var(--r); padding: clamp(24px, 4vw, 40px); border: 1px solid var(--line); background: var(--paper); display: block; color: inherit; }
.sp-dc:nth-child(odd) { background-image: var(--diag); }
.sp-dc:nth-child(even) { background: var(--paper-2); }
.sp-dc h3 { font-family: var(--disp); font-weight: 900; font-size: 1.42rem; }
.sp-dc p { font-size: .9rem; color: var(--ink-soft); margin-block: 10px 18px; }
.sp-dc .lk { font-family: var(--disp); font-weight: 700; font-size: .96rem; color: var(--accent); border-bottom: 1.5px solid var(--accent); padding-bottom: 3px; }
.sp-ship { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; margin-block-end: 16px; }
.sp-sc { background: var(--paper); padding: 22px 20px; display: flex; gap: 13px; align-items: flex-start; }
.sp-sc i { font-size: 1.3rem; font-style: normal; }
.sp-sc b { display: block; font-family: var(--disp); font-weight: 700; font-size: 1.01rem; }
.sp-sc span { font-size: .78rem; color: var(--ink-soft); }
.sp-cta-box { text-align: center; border: 1px solid var(--line-2); border-radius: var(--r); padding: clamp(34px, 6vw, 70px); background: radial-gradient(ellipse at 50% 0, rgba(212,255,63,.14), transparent 65%), var(--paper); }
.sp-cta-box h2 { font-family: var(--disp); font-weight: 900; font-size: clamp(1.9rem, 4.6vw, 3rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-cta-box p { color: var(--ink-soft); margin: 14px auto 26px; max-width: 54ch; }
.sp-close-cta { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
@container (min-width: 760px) { .sp-duo { grid-template-columns: 1fr 1fr; } }
@container (min-width: 680px) { .sp-ship { grid-template-columns: repeat(4, 1fr); } }
`;

export default class CloseInvite extends LitElement {
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
    injectStyles("sp-close-invite", css);
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
        title: localizedString(item.title),
        text: localizedString(item.text),
        label: localizedString(item.label),
        url: linkHref(item.url),
      }))
      .filter((item) => item.title);
    const perks = getCollectionItems<Record<string, any>>(cfg.perks, "perks")
      .map((item) => ({
        mark: localizedString(item.mark),
        title: localizedString(item.title),
        text: localizedString(item.text),
      }))
      .filter((item) => item.title);
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    return html`<section class=${`sp-root sp-sec sp-close ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "close"}>
      <div class="sp-wrap">
        ${cards.length ? html`<div class="sp-duo">${cards.map((card) => {
          const inner = html`<h3>${card.title}</h3>${card.text ? html`<p>${card.text}</p>` : nothing}${card.label ? html`<span class="lk">${card.label}</span>` : nothing}`;
          return card.url ? html`<a class="sp-dc sp-rev" href=${card.url}>${inner}</a>` : html`<article class="sp-dc sp-rev">${inner}</article>`;
        })}</div>` : nothing}
        ${perks.length ? html`<div class="sp-ship">${perks.map((perk) => html`<div class="sp-sc sp-rev">${perk.mark ? html`<i aria-hidden="true">${perk.mark}</i>` : nothing}<div><b>${perk.title}</b>${perk.text ? html`<span>${perk.text}</span>` : nothing}</div></div>`)}</div>` : nothing}
        <div class="sp-cta-box sp-rev">
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
          <div class="sp-close-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${secondary && secondaryUrl ? html`<a class="sp-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
          </div>
        </div>
      </div>
    </section>`;
  }
}
