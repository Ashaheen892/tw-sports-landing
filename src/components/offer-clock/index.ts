import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { digits } from "../../utils/ui.js";

const css = `
.sp-offer { background: var(--volt); color: #121500; background-image: var(--diag); position: relative; }
.sp-offer-g { display: grid; gap: 26px; align-items: center; }
.sp-offer h2 { font-family: var(--disp); font-weight: 900; font-size: clamp(1.8rem, 4.2vw, 2.8rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-offer p { margin-block-start: 10px; font-size: .95rem; font-weight: 400; max-width: 46ch; }
.sp-code { display: inline-flex; align-items: center; gap: 10px; margin-block-start: 16px; background: #121500; color: var(--volt); border-radius: var(--r); padding: 10px 18px; font-size: .84rem; }
.sp-code b { font-family: var(--disp); font-weight: 900; letter-spacing: .12em; }
.sp-clock { display: flex; gap: 8px; flex-wrap: wrap; }
.sp-cu { flex: 1 1 70px; background: #121500; color: var(--volt); border-radius: var(--r); padding: 14px 8px; text-align: center; }
.sp-cu b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.9rem; line-height: 1; font-variant-numeric: tabular-nums; }
.sp-cu span { font-size: .68rem; opacity: .75; }
@container (min-width: 900px) { .sp-offer-g { grid-template-columns: 1.2fr .8fr; } }
`;

export default class OfferClock extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private left = 0;
  private stop = () => {};
  private timer = 0;
  private end = 0;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-offer-clock", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    this.arm();
    this.timer = window.setInterval(() => {
      this.left = Math.max(0, this.end - Date.now());
    }, 1000);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.clearInterval(this.timer);
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected willUpdate() {
    this.arm();
  }

  private arm() {
    const cfg = getConfig(this.config);
    const hours = Math.min(Math.max(Number(cfg.hours) || 57, 1), 240);
    const key = `sp-offer-end-${hours}`;
    let end = 0;
    try {
      end = Number(sessionStorage.getItem(key)) || 0;
    } catch {
      end = 0;
    }
    if (!end || end < Date.now() - 1000) {
      end = Date.now() + hours * 3600000;
      try { sessionStorage.setItem(key, String(end)); } catch { /* private mode */ }
    }
    this.end = end;
    this.left = Math.max(0, end - Date.now());
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const code = localizedString(cfg.code);
    const seconds = Math.floor(this.left / 1000);
    const parts = [
      [Math.floor(seconds / 86400), localizedString(cfg.day_label) || "يوم"],
      [Math.floor((seconds % 86400) / 3600), localizedString(cfg.hour_label) || "ساعة"],
      [Math.floor((seconds % 3600) / 60), localizedString(cfg.minute_label) || "دقيقة"],
      [seconds % 60, localizedString(cfg.second_label) || "ثانية"],
    ];
    return html`<section class=${`sp-root sp-sec sp-offer ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "offer"}>
      <div class="sp-wrap sp-offer-g">
        <div class="sp-rev">
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
          ${code ? html`<div class="sp-code"><span>${localizedString(cfg.code_label) || "كود الخصم"}</span><b>${code}</b></div>` : nothing}
        </div>
        <div class="sp-clock sp-rev" role="timer" aria-label=${title || "timer"}>
          ${parts.map(([value, label]) => html`<div class="sp-cu"><b>${digits(Number(value), true)}</b><span>${label}</span></div>`)}
        </div>
      </div>
    </section>`;
  }
}
