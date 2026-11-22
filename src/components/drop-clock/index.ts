import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { getConfig, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { digits } from "../../utils/ui.js";

function offerEnd(raw: unknown): number {
  const text = String(unwrapValue(raw) || "").trim();
  if (!text) return 0;
  const day = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (day) return new Date(Number(day[1]), Number(day[2]) - 1, Number(day[3]), 23, 59, 59).getTime();
  const local = text.match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  if (local) return new Date(Number(local[1]), Number(local[2]) - 1, Number(local[3]), Number(local[4]), Number(local[5]), 0).getTime();
  const parsed = Date.parse(text);
  return Number.isNaN(parsed) ? 0 : parsed;
}

const css = `
.sp-offer { background: var(--volt); color: #121500; background-image: var(--diag); position: relative; overflow: hidden; }
.sp-offer-g { display: grid; gap: 26px; align-items: center; }
.sp-offer h2 { font-family: var(--disp); font-weight: 900; font-size: clamp(1.8rem, 4.2vw, 2.8rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-offer p { margin-block-start: 10px; font-size: .95rem; font-weight: 400; max-width: 46ch; }
.sp-code { display: inline-flex; align-items: center; gap: 10px; margin-block-start: 16px; background: #121500; color: var(--volt); border-radius: var(--r); padding: 10px 18px; font-size: .84rem; transform: skewX(-8deg); }
.sp-code > * { transform: skewX(8deg); }
.sp-code b { font-family: var(--disp); font-weight: 900; letter-spacing: .12em; }
.sp-board { direction: ltr; display: flex; align-items: stretch; justify-content: center; padding: 18px 16px 12px; background: #121500; color: var(--volt); transform: skewX(-8deg); box-shadow: 10px 10px 0 rgb(18 21 0 / 25%); }
.sp-board > * { transform: skewX(8deg); }
.sp-cu { display: grid; justify-items: center; min-width: 3.4rem; }
.sp-cu b { font-family: ui-monospace, "SFMono-Regular", Menlo, monospace; font-weight: 800; font-size: clamp(2.2rem, 6vw, 3.6rem); line-height: 1; font-variant-numeric: tabular-nums; text-shadow: 0 0 18px rgb(212 255 63 / 45%); }
.sp-cu span { margin-top: 6px; font-size: .66rem; letter-spacing: .14em; color: #f4f7f8; opacity: .7; direction: rtl; }
.sp-colon { align-self: start; padding-inline: 4px; font-family: ui-monospace, Menlo, monospace; font-size: clamp(2rem, 5vw, 3.2rem); line-height: 1; opacity: .55; animation: sp-blink 1s steps(2) infinite; }
@keyframes sp-blink { 50% { opacity: .12; } }
@media (prefers-reduced-motion: reduce) { .sp-colon { animation: none; } }
@container (min-width: 900px) { .sp-offer-g { grid-template-columns: 1.15fr .85fr; } }
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

  protected willUpdate(changed: Map<PropertyKey, unknown>) {
    if (changed.has("config")) this.arm();
  }

  private arm() {
    this.end = offerEnd(getConfig(this.config).ends_at);
    this.left = Math.max(0, this.end - Date.now());
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const code = localizedString(cfg.code);
    const seconds = Math.floor(this.left / 1000);
    const parts = [
      [Math.floor(seconds / 86400), t({ ar: "يوم", en: "day" })],
      [Math.floor((seconds % 86400) / 3600), t({ ar: "ساعة", en: "hour" })],
      [Math.floor((seconds % 3600) / 60), t({ ar: "دقيقة", en: "min" })],
      [seconds % 60, t({ ar: "ثانية", en: "sec" })],
    ];
    return html`<section class=${`sp-root sp-sec sp-offer ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "offer"}>
      <div class="sp-wrap sp-offer-g">
        <div class="sp-rev">
          ${title ? html`<h2>${title}</h2>` : nothing}
          ${localizedString(cfg.text) ? html`<p>${localizedString(cfg.text)}</p>` : nothing}
          ${code ? html`<div class="sp-code"><span>${localizedString(cfg.code_label) || t({ ar: "كود الخصم", en: "Code" })}</span><b>${code}</b></div>` : nothing}
        </div>
        <div class="sp-board sp-rev" role="timer" aria-label=${title || "timer"}>
          ${parts.map(([value, label], index) => html`${index ? html`<i class="sp-colon" aria-hidden="true">:</i>` : nothing}<div class="sp-cu"><b>${String(Math.max(0, Number(value))).padStart(2, "0")}</b><span>${label}</span></div>`)}
        </div>
      </div>
    </section>`;
  }
}
