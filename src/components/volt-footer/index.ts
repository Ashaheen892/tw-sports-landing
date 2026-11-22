import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { announceBar, announceCss, announceTone } from "../../utils/announce.js";
import { clearDocks, syncDocks, type DockNodes } from "../../utils/dock.js";
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
.sp-flogo { display: inline-flex; align-items: center; gap: 10px; font-family: var(--disp); font-weight: 900; font-size: 1.35rem; color: var(--ink); }
.sp-flogo img { height: 42px; width: auto; object-fit: contain; }
.sp-fmark { width: 34px; height: 34px; border-radius: var(--r); background: var(--volt); color: #121500; display: grid; place-items: center; transform: skewX(-8deg); }
.sp-pay-size { margin: 16px 0 8px; font-size: .72rem; font-weight: 700; color: var(--muted); }
.sp-pay { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.sp-pay img { width: 32px; height: 32px; object-fit: contain; border-radius: .2rem; background: #d4ff3f; }
.sp-social { display: flex; flex-wrap: wrap; gap: 8px; }
.sp-social a { width: 40px; height: 36px; display: grid; place-items: center; color: var(--ink); background: var(--volt); text-decoration: none; transform: skewX(-10deg); }
.sp-social svg { width: 16px; height: 16px; display: block; transform: skewX(10deg); }
.sp-foot-copy { border-top: 1px solid var(--line); padding-block: 18px; display: flex; flex-wrap: wrap; gap: 12px; justify-content: space-between; font-size: .77rem; color: var(--muted); }
.sp-totop, .sp-top { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 42px; padding: 8px 16px; border-radius: var(--r); border: 1px solid var(--line-2); background: var(--paper); color: var(--ink); font-family: var(--disp); font-weight: 700; font-size: .82rem; cursor: pointer; }
.sp-foot .sp-totop { margin: 8px auto 22px; }
.sp-top { position: fixed; z-index: 70; inset-inline-end: 18px; bottom: 22px; opacity: 0; pointer-events: none; transform: translateY(10px); }
.sp-top.show { opacity: 1; pointer-events: auto; transform: none; }
.sp-dock { position: fixed; z-index: 80; display: inline-grid; place-items: center; width: 3.4rem; height: 3.3rem; padding: 0; border: 0; border-radius: .15rem; background: #d4ff3f; color: #121500; font-family: var(--font-main, inherit); font-weight: 800; cursor: pointer; text-decoration: none; transform: skewX(-10deg); box-shadow: 0 10px 24px rgb(0 0 0 / 22%); }
.sp-dock[hidden] { display: none; }
.sp-dock svg { width: 1.35rem; height: 1.35rem; display: block; transform: skewX(10deg); }
.sp-dock--wa { background: #121500; color: #d4ff3f; }
@container (min-width: 760px) { .sp-fg { grid-template-columns: 1.3fr 1fr 1fr 1fr; } }
`;

function socialIcon(name: string) {
  if (name === "instagram") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"></rect><circle cx="12" cy="12" r="3.2"></circle><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" stroke="none"></circle></svg>`;
  if (name === "snapchat") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M12 4c2.4 0 4 1.8 4 4.2 0 1.2-.2 2 .4 2.6.3.3.8.4 1.1.6.4.3.3 1-.2 1.2-.8.3-1.3.2-1.7.6-.3.3-.4.8-.2 1.4.2.5-.2.9-.8.9-.7 0-1.1.4-1.6.7-.4.2-.7.2-1 .2s-.6 0-1-.2c-.5-.3-.9-.7-1.6-.7-.6 0-1-.4-.8-.9.2-.6.1-1.1-.2-1.4-.4-.4-.9-.3-1.7-.6-.5-.2-.6-.9-.2-1.2.3-.2.8-.3 1.1-.6.6-.6.4-1.4.4-2.6C8 5.8 9.6 4 12 4Z"></path></svg>`;
  if (name === "tiktok") return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14 6c.6 2.2 2 3.6 4 4v2.2c-1.4 0-2.7-.4-4-1.2v5.2a5.2 5.2 0 1 1-5.2-5.2c.3 0 .6 0 .8.1v2.3a2.9 2.9 0 1 0 2 2.8V6H14Z"></path></svg>`;
  if (name === "whatsapp") return html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>`;
  if (name === "youtube") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><rect x="3.5" y="7" width="17" height="11" rx="2.5"></rect><path d="m11 10 4 2.2-4 2.2V10Z" fill="currentColor" stroke="none"></path></svg>`;
  if (name === "x") return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"></path></svg>`;
  return html`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="7"></circle></svg>`;
}

export default class PageFooter extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private storeName = "";
  @state() private dark = false;
  @state() private raised = false;
  @state() private atFooter = false;
  private stop = () => {};
  private floater: HTMLButtonElement | null = null;
  private docks: DockNodes = { wa: null, top: null };
  private seen?: IntersectionObserver;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-announce", announceCss("sp", "slant"));
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
    clearDocks(this.docks);
    super.disconnectedCallback();
  }

  protected updated() {
    this.floater?.remove();
    this.floater = null;
    this.docks = syncDocks(getConfig(this.config), "sp", this.docks, this.toTop, { hideTop: this.atFooter });
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
    const brand = localizedString(cfg.brand) || this.storeName;
    const badge = localizedString(cfg.badge) || "ق";
    const showTop = this.shown(cfg.show_top);
    const topLabel = localizedString(cfg.top_label) || t({ ar: "للأعلى", en: "Back to top" });
    const columns = [1, 2].map((index) => ({
      title: localizedString(cfg[`col${index}_title`]),
      links: getCollectionItems<Record<string, any>>(cfg[`col${index}`], `col${index}`)
        .map((item) => ({ label: localizedString(item.label), url: linkHref(item.url) || "#" }))
        .filter((item) => item.label),
    })).filter((column) => column.title || column.links.length);
    const socialTitle = localizedString(cfg.col3_title);
    const socials = getCollectionItems<Record<string, any>>(cfg.social, "social")
      .map((item) => ({
        network: String(unwrapValue(item.network) || "instagram"),
        url: linkHref(item.url) || "#",
        label: ({
          instagram: t({ ar: "إنستغرام", en: "Instagram" }),
          snapchat: t({ ar: "سناب شات", en: "Snapchat" }),
          tiktok: t({ ar: "تيك توك", en: "TikTok" }),
          whatsapp: t({ ar: "واتساب", en: "WhatsApp" }),
          x: t({ ar: "إكس", en: "X" }),
          youtube: t({ ar: "يوتيوب", en: "YouTube" }),
        } as Record<string, string>)[String(unwrapValue(item.network) || "instagram")] || t({ ar: "تواصل", en: "Social" }),
      }))
      .filter((item) => item.url);
    const pays = getCollectionItems<Record<string, any>>(cfg.payments, "payments")
      .map((item) => ({ image: String(item.image || ""), label: localizedString(item.label) }))
      .filter((item) => item.image || item.label);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    return html`${announceBar(cfg, "sp", `sp-root ${schemeOf(cfg)}`, announceTone(cfg))}
    <footer class=${`sp-root sp-foot ${schemeOf(cfg)}`} style=${sectionStyle(cfg)}>
      <div class="sp-wrap">
        <div class="sp-fg">
          <div class="sp-about">
            <a href="#" class="sp-flogo">${logo ? html`<img src=${logo} alt=${brand} />` : html`<span class="sp-fmark">${badge}</span>${brand}`}</a>
            ${localizedString(cfg.about) ? html`<p>${localizedString(cfg.about)}</p>` : nothing}
            ${pays.length ? html`<div class="sp-pay">${pays.map((pay) => pay.image
              ? html`<img src=${pay.image} alt=${pay.label} width="32" height="32" title=${pay.label} />`
              : nothing)}</div>` : nothing}
          </div>
          ${columns.map((column) => html`<div>
            ${column.title ? html`<h4>${column.title}</h4>` : nothing}
            <div>${column.links.map((link) => html`<a href=${link.url}>${link.label}</a>`)}</div>
          </div>`)}
          ${socialTitle || socials.length ? html`<div>
            ${socialTitle ? html`<h4>${socialTitle}</h4>` : nothing}
            <div class="sp-social">${socials.map((item) => html`<a href=${item.url} aria-label=${item.label} target="_blank" rel="noopener noreferrer">${socialIcon(item.network)}</a>`)}</div>
          </div>` : nothing}
        </div>
        ${showTop ? html`<button type="button" class="sp-totop" @click=${this.toTop}>${topLabel}</button>` : nothing}
        <div class="sp-foot-copy">
          <span>${localizedString(cfg.copyright)}</span>
          <span>${localizedString(cfg.legal)}</span>
        </div>
      </div>
    </footer>`;
  }
}
