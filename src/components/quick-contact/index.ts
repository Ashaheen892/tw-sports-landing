import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-quick { display: flex; flex-wrap: wrap; gap: 10px; }
.sp-quick a { display: inline-flex; align-items: center; min-height: 3.2rem; padding: 0 1.1rem; border: 2px solid var(--volt); color: var(--ink); text-decoration: none; font-weight: 800; transform: skewX(-8deg); }
.sp-quick a span { transform: skewX(8deg); }
`;

function digits(value: unknown): string {
  const raw = typeof value === "string" ? value : localizedString(value);
  return raw.replace(/\D/g, "");
}

export default class QuickContact extends LitElement {
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
    injectStyles("sp-quick-contact", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const phone = digits(cfg.phone);
    const wa = digits(cfg.whatsapp || "201153958512");
    const email = String(cfg.email || "").trim();
    const message = localizedString(cfg.whatsapp_message);
    const actions = [
      phone ? { value: localizedString(cfg.phone_text) || t({ ar: "اتصل بالمختبر", en: "Call the lab" }), href: `tel:+${phone}` } : null,
      wa ? { value: localizedString(cfg.whatsapp_text) || t({ ar: "اسأل عن الجرعة", en: "Ask about the dose" }), href: `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` } : null,
      email.includes("@") ? { value: email, href: `mailto:${email}` } : null,
    ].filter((item) => item) as { value: string; href: string }[];
    return html`<section id="sp-contact" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "contact"}>
      <div class="sp-wrap">
        <div class="sp-head">${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}</div>
        ${actions.length ? html`<div class="sp-quick">${actions.map((item) => html`<a href=${item.href}><span>${item.value}</span></a>`)}</div>` : emptyCopy()}
      </div>
    </section>`;
  }
}
