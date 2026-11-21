import { html, LitElement, nothing } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";

const css = `
.sp-hero { position: relative; overflow: hidden; padding-block: clamp(34px, 6vw, 78px); background: var(--sp-section-bg, var(--page)); }
.sp-hero::before { content: ""; position: absolute; inset: 0; background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 60px 60px; mask-image: radial-gradient(ellipse at 60% 20%, #000, transparent 72%); -webkit-mask-image: radial-gradient(ellipse at 60% 20%, #000, transparent 72%); pointer-events: none; }
.sp-hero-g { display: grid; gap: clamp(26px, 5vw, 50px); align-items: center; position: relative; z-index: 1; }
.sp-kicker { display: inline-flex; align-items: center; gap: 9px; border: 1px solid var(--line-2); border-radius: 999px; padding: 6px 15px; font-size: .76rem; font-weight: 500; color: var(--ink-soft); margin-block-end: 18px; }
.sp-kicker i { width: 7px; height: 7px; border-radius: 50%; background: var(--volt); font-style: normal; }
.sp-hero h1 { font-family: var(--disp); font-weight: 900; font-size: clamp(2.2rem, 6.4vw, 4.2rem); letter-spacing: -.02em; line-height: 1.18; }
.sp-hero h1 em { font-style: normal; color: var(--accent); }
.sp-hero .sp-copy { color: var(--ink-soft); font-size: 1.03rem; max-width: 50ch; margin-block: 18px 26px; }
.sp-cta { display: flex; flex-wrap: wrap; gap: 12px; }
.sp-micro { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); margin-block-start: 30px; border-radius: var(--r); overflow: hidden; }
.sp-micro div { background: var(--paper); padding: 16px 14px; }
.sp-micro b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.5rem; color: var(--accent); line-height: 1.1; }
.sp-micro span { font-size: .75rem; color: var(--muted); }
.sp-scene { position: relative; aspect-ratio: 1/1; border-radius: var(--r); background: radial-gradient(circle at 50% 45%, var(--paper-2), var(--page) 70%); border: 1px solid var(--line); display: grid; place-items: center; overflow: hidden; }
.sp-scene img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.sp-ring { position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); border: 1.5px dashed var(--line-2); border-radius: 50%; animation: sp-spin 26s linear infinite; }
.sp-ring.a { width: 78%; aspect-ratio: 1; }
.sp-ring.b { width: 56%; aspect-ratio: 1; animation-duration: 17s; animation-direction: reverse; border-color: color-mix(in srgb, var(--volt) 45%, transparent); }
@keyframes sp-spin { to { transform: translate(-50%, -50%) rotate(360deg); } }
.sp-db { position: relative; width: 72%; max-width: 330px; height: 118px; animation: sp-lift 4.6s ease-in-out infinite; }
@keyframes sp-lift { 0%, 100% { transform: translateY(8px) rotate(-6deg); } 50% { transform: translateY(-10px) rotate(-6deg); } }
.sp-bar { position: absolute; top: 50%; inset-inline: 17%; height: 15px; transform: translateY(-50%); border-radius: 4px; background: linear-gradient(180deg, #c9d2d8, #6d777e 55%, #434c52); }
.sp-pl { position: absolute; inset-block: 0; width: 17%; border-radius: 7px; background: linear-gradient(145deg, #2c3338, #171b1e); border: 1px solid var(--line-2); box-shadow: inset 0 0 0 7px rgba(212,255,63,.12); }
.sp-pl.a { inset-inline-start: 0; }
.sp-pl.b { inset-inline-end: 0; }
.sp-pl::after { content: ""; position: absolute; inset: 22% 28%; border-radius: 4px; background: var(--volt); }
.sp-stat { position: absolute; background: color-mix(in srgb, var(--paper) 92%, transparent); border: 1px solid var(--line-2); border-radius: var(--r); padding: 11px 15px; font-size: .78rem; z-index: 2; }
.sp-stat b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.3rem; color: var(--accent); line-height: 1.1; }
.sp-stat.s1 { inset-block-start: 22px; inset-inline-start: 22px; }
.sp-stat.s2 { inset-block-end: 22px; inset-inline-end: 22px; }
@container (min-width: 1000px) { .sp-hero-g { grid-template-columns: 1.06fr .94fr; } }
@container (max-width: 640px) { .sp-micro { grid-template-columns: 1fr; } }
`;

export default class VoltHero extends LitElement {
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
    injectStyles("sp-volt-hero", css);
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
    const before = localizedString(cfg.title_before);
    const accent = localizedString(cfg.title_accent);
    const after = localizedString(cfg.title_after);
    const title = [before, accent, after].filter(Boolean).join(" ");
    const stats = getCollectionItems<Record<string, any>>(cfg.stats, "stats")
      .map((item) => ({ value: localizedString(item.value), label: localizedString(item.label) }))
      .filter((item) => item.value);
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    const photo = String(cfg.scene_image || "");
    const chipA = localizedString(cfg.chip_a_value);
    const chipB = localizedString(cfg.chip_b_value);
    return html`<section class=${`sp-root sp-hero ${schemeOf(cfg)}`} style=${sectionStyle(cfg)} aria-label=${title || "hero"}>
      <div class="sp-wrap sp-hero-g">
        <div class="sp-rev">
          ${localizedString(cfg.kicker) ? html`<span class="sp-kicker"><i></i>${localizedString(cfg.kicker)}</span>` : nothing}
          ${title ? html`<h1>${before} ${accent ? html`<em>${accent}</em>` : nothing} ${after}</h1>` : nothing}
          ${localizedString(cfg.text) ? html`<p class="sp-copy">${localizedString(cfg.text)}</p>` : nothing}
          <div class="sp-cta">
            ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
            ${secondary && secondaryUrl ? html`<a class="sp-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
          </div>
          ${stats.length ? html`<div class="sp-micro">${stats.map((item) => html`<div><b>${item.value}</b><span>${item.label}</span></div>`)}</div>` : nothing}
        </div>
        <div class="sp-rev">
          <div class="sp-scene">
            ${photo ? html`<img src=${photo} alt="" />` : html`
              <span class="sp-ring a" aria-hidden="true"></span>
              <span class="sp-ring b" aria-hidden="true"></span>
              <div class="sp-db" aria-hidden="true"><span class="sp-pl a"></span><span class="sp-bar"></span><span class="sp-pl b"></span></div>
            `}
            ${chipA ? html`<div class="sp-stat s1"><b>${chipA}</b>${localizedString(cfg.chip_a_label)}</div>` : nothing}
            ${chipB ? html`<div class="sp-stat s2"><b>${chipB}</b>${localizedString(cfg.chip_b_label)}</div>` : nothing}
          </div>
        </div>
      </div>
    </section>`;
  }
}
