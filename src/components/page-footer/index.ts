import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, watchLocale } from "../../utils/config.js";
import { announceBar, announceCss } from "../../utils/announce.js";
import { currentTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle } from "../../utils/styles.js";

const css = `
.sp-foot { background: var(--sp-section-bg, var(--page)); color: var(--ink-soft); padding-block: 46px 0; font-size: .85rem; border-top: 1px solid var(--line); }
.sp-fg { display: grid; gap: 26px; padding-block-end: 32px; }
.sp-foot h4 { color: var(--ink); font-family: var(--disp); font-weight: 900; font-size: 1.04rem; margin-block-end: 10px; }
.sp-foot a { display: block; padding-block: 4px; color: var(--ink-soft); }
.sp-foot a:hover { color: var(--accent); }
.sp-about { max-width: 36ch; }
.sp-about p { margin-block-start: 10px; }
.sp-logo { display: inline-flex; align-items: center; gap: 10px; font-family: var(--disp); font-weight: 900; font-size: 1.35rem; color: var(--ink); }
.sp-logo img { height: 42px; width: auto; object-fit: contain; }
.sp-mark { width: 34px; height: 34px; border-radius: var(--r); background: var(--volt); color: #121500; display: grid; place-items: center; transform: skewX(-8deg); }
.sp-pay { display: flex; flex-wrap: wrap; gap: 8px; margin-block-start: 16px; }
.sp-pay span { border: 1px solid var(--line-2); border-radius: 999px; padding: 6px 12px; font-size: .75rem; color: var(--ink-soft); }
.sp-copy { border-top: 1px solid var(--line); padding-block: 18px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; font-size: .77rem; color: var(--muted); }
.sp-totop, .sp-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 16px; border-radius: var(--r); border: 1px solid var(--line-2); background: var(--paper); color: var(--ink); font-family: var(--disp); font-weight: 700; font-size: .82rem; cursor: pointer; }
.sp-foot .sp-totop { margin: 8px auto 22px; }
.sp-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; opacity: 0; pointer-events: none; transform: translateY(10px); }
.sp-top.show { opacity: 1; pointer-events: auto; transform: none; }
@container (min-width: 760px) { .sp-fg { grid-template-columns: 1.3fr 1fr 1fr 1fr; } }
`;

export default class PageFooter extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private storeName = "";
  @state() private dark = false;
  @state() private raised = false;
  @state() private atFooter = false;
  private stop = () => {};
  private floater: HTMLButtonElement | null = null;
  private seen?: IntersectionObserver;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-announce", announceCss("sp"));
    injectStyles("sp-page-footer", css);
    const stopLocale = watchLocale(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("sp-tone", onTone);
    this.dark = currentTone() === "dark";
    this.stop = () => {
      stopLocale();
      window.removeEventListener("sp-tone", onTone);
    };
    document.addEventListener("scroll", this.onScroll, { capture: true, passive: true });
    const api = (window as any).Salla;
    const read = () => { this.storeName = api?.config?.get("store.name") || ""; };
    read();
    api?.onReady?.().then(read);
    this.onScroll();
  }

  disconnectedCallback() {
    this.stop();
    document.removeEventListener("scroll", this.onScroll, { capture: true });
    this.seen?.disconnect();
    this.floater?.remove();
    this.floater = null;
    super.disconnectedCallback();
  }

  protected updated() {
    this.syncFloater();
    const button = this.querySelector(".sp-totop");
    this.seen?.disconnect();
    if (!button) {
      this.atFooter = false;
      return;
    }
    this.seen = new IntersectionObserver(([entry]) => {
      this.atFooter = entry.isIntersecting;
    }, { threshold: 0.5 });
    this.seen.observe(button);
  }

  private shown(value: unknown): boolean {
    if (value == null || value === "") return true;
    return flag(value);
  }

  private onScroll = (event?: Event) => {
    const target = event?.target;
    const nested = target instanceof Element ? target.scrollTop : 0;
    const top = Math.max(window.scrollY || 0, document.documentElement.scrollTop || 0, nested);
    const next = top > 360;
    if (next !== this.raised) this.raised = next;
  };

  private toTop = (event: Event) => {
    event.preventDefault();
    const nodes = new Set<Element>([document.documentElement, document.body]);
    if (document.scrollingElement) nodes.add(document.scrollingElement);
    let node: Element | null = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    nodes.forEach((el) => {
      try { el.scrollTo({ top: 0, behavior: "smooth" }); } catch { el.scrollTop = 0; }
    });
  };

  private syncFloater() {
    const cfg = getConfig(this.config);
    const show = this.shown(cfg.show_top) && this.raised && !this.atFooter;
    if (!show) {
      this.floater?.classList.remove("show");
      return;
    }
    if (!this.floater) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "sp-top";
      button.addEventListener("click", this.toTop);
      document.body.appendChild(button);
      this.floater = button;
    }
    const label = localizedString(cfg.top_label) || t({ ar: "للأعلى", en: "Back to top" });
    this.floater.setAttribute("aria-label", label);
    this.floater.textContent = label;
    this.floater.classList.add("show");
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || this.storeName || t({ ar: "قوّة", en: "Quwa" });
    const badge = localizedString(cfg.badge) || "ق";
    const showTop = this.shown(cfg.show_top);
    const topLabel = localizedString(cfg.top_label) || t({ ar: "للأعلى", en: "Back to top" });
    const columns = [1, 2, 3].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems<Record<string, any>>(cfg[`col${index}`], `col${index}`)
        .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" }))
        .filter((item) => item.label),
    })).filter((column) => column.title || column.links.length);
    const pays = getCollectionItems<Record<string, any>>(cfg.payments, "payments")
      .map((item) => localizedString(item.label))
      .filter(Boolean);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    return html`${announceBar(cfg, "sp", `sp-root ${schemeOf(cfg)}`, "--ann-bg:var(--volt);--ann-ink:#121500;--ann-speed:16s")}
    <footer class=${`sp-root sp-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="sp-wrap">
        <div class="sp-fg">
          <div class="sp-about">
            <a href="#" class="sp-logo">${logo ? html`<img src=${logo} alt=${brand} />` : html`<span class="sp-mark">${badge}</span>${brand}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="sp-pay">${pays.map((pay) => html`<span>${pay}</span>`)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h4>${column.title}</h4>` : nothing}
            <div>${column.links.map((link) => html`<a href=${link.url}>${link.label}</a>`)}</div>
          </div>`)}
        </div>
        ${showTop ? html`<button type="button" class="sp-totop" @click=${this.toTop}>${topLabel}</button>` : nothing}
        <div class="sp-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
}
