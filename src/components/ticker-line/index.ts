import { html, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { getCollectionItems, getConfig, localizedString, watchLocale } from "../../utils/config.js";
import { schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.sp-mq { background: var(--volt); color: #121500; padding-block: 12px; overflow: hidden; }
.sp-mq-track { display: flex; width: max-content; animation: sp-sl 24s linear infinite; }
.sp-mq-set { display: flex; flex: none; align-items: center; }
.sp-mq-set span { font-family: var(--disp); font-weight: 700; font-size: .95rem; letter-spacing: .03em; white-space: nowrap; padding-inline-end: 36px; }
.sp-mq:hover .sp-mq-track { animation-play-state: paused; }
@keyframes sp-sl { from { transform: translateX(0); } to { transform: translateX(50%); } }
html[dir="ltr"] .sp-mq-track { animation-name: sp-sl-ltr; }
@keyframes sp-sl-ltr { to { transform: translateX(-50%); } }
`;

export default class TickerLine extends LitElement {
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
    injectStyles("sp-ticker-line", css);
    this.stop = watchLocale(this);
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  render() {
    const cfg = getConfig(this.config);
    const items = getCollectionItems<Record<string, any>>(cfg.items, "items")
      .map((item) => localizedString(item.text))
      .filter(Boolean);
    const times = items.length ? Math.max(2, Math.ceil(8 / items.length)) : 0;
    const unit = times ? Array.from({ length: times }, () => items).flat() : [];
    const row = (hidden: boolean) => html`<div class="sp-mq-set" aria-hidden=${hidden ? "true" : "false"}>${unit.map((item) => html`<span>${item}</span>`)}</div>`;
    return html`<div class=${`sp-root sp-mq ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="sp-mq-track">${row(false)}${row(true)}</div>
    </div>`;
  }
}
