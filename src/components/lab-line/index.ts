import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getConfig, localizedString, t, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";
import { emptyCopy } from "../../utils/ui.js";

const css = `
.sp-slab { position: relative; display: grid; gap: 22px; align-items: center; padding: clamp(24px, 4vw, 40px); background: var(--volt); color: #121500; background-image: var(--diag); clip-path: polygon(0 0, 100% 0, 100% calc(100% - 26px), calc(100% - 26px) 100%, 0 100%); }
@container (min-width: 860px) { .sp-slab { grid-template-columns: minmax(0, 1fr) auto; } }
.sp-slab .sp-h2 { font-weight: 900; color: #121500; }
.sp-slab p { margin: 8px 0 0; max-width: 46ch; color: #2b3300; }
.sp-quick { display: flex; flex-wrap: wrap; gap: 10px; }
.sp-quick a { display: inline-flex; align-items: center; gap: 8px; min-height: 3.2rem; padding: 0 1.2rem; background: #121500; color: var(--volt); text-decoration: none; font-weight: 800; transform: skewX(-8deg); transition: transform .2s ease; }
.sp-quick a:hover { transform: skewX(-8deg) translateY(-3px); }
.sp-quick a span { transform: skewX(8deg); }
.sp-quick a small { transform: skewX(8deg); color: #f4f7f8; opacity: .7; font-weight: 600; font-size: .72rem; }
`;

function telHref(value: unknown): string {
  const raw = (typeof value === "string" ? value : localizedString(value)).trim();
  const num = raw.replace(/\D/g, "");
  if (!num) return "";
  if (raw.startsWith("+")) return `tel:+${num}`;
  if (num.startsWith("00")) return `tel:+${num.slice(2)}`;
  return `tel:${num}`;
}

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
      phone ? { value: localizedString(cfg.phone_text) || t({ ar: "اتصال", en: "Call" }), href: telHref(cfg.phone) } : null,
      wa ? { value: localizedString(cfg.whatsapp_text) || t({ ar: "واتساب", en: "WhatsApp" }), href: `https://wa.me/${wa}${message ? `?text=${encodeURIComponent(message)}` : ""}` } : null,
      email.includes("@") ? { value: email, href: `mailto:${email}` } : null,
    ].filter((item) => item) as { value: string; href: string }[];
    return html`<section id="sp-contact" class=${`sp-root sp-sec ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "contact"}>
      <div class="sp-wrap">
        <div class="sp-slab">
          <div>${localizedString(cfg.kicker) ? html`<span class="sp-no" style="color:#121500">${localizedString(cfg.kicker)}</span>` : nothing}${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}</div>
          ${actions.length ? html`<div class="sp-quick">${actions.map((item) => html`<a href=${item.href}><span>${item.value}</span></a>`)}</div>` : emptyCopy()}
        </div>
      </div>
    </section>`;
  }
}
