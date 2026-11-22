import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getConfig, linkHref, localizedString, t, unwrapValue, watchLocale } from "../../utils/config.js";
import { announceCss, announceStrips, announceTone, rotateStrips, stopStrips } from "../../utils/announce.js";
import { applyTone, currentTone, savedTone, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";

const css = `
header.sp-bar { position: relative; background: var(--sp-section-bg, color-mix(in srgb, var(--page) 92%, transparent)); border-bottom: 1px solid var(--line); }
header.sp-bar.is-clear { background: transparent; border-bottom-color: transparent; }
.sp-nav { position: relative; display: flex; align-items: center; justify-content: center; min-height: calc(var(--sp-logo, 52px) + 1.5rem); padding-block: .75rem; }
.sp-nav.is-start { justify-content: flex-start; }
.sp-logo { display: inline-flex; align-items: center; gap: 10px; font-weight: 800; font-size: 1.35rem; line-height: 1; color: inherit; text-decoration: none; }
.sp-logo img { height: var(--sp-logo, 52px); width: auto; max-width: 60vw; object-fit: contain; }
.sp-mark { width: 38px; height: 38px; border-radius: var(--r); background: var(--color-primary, var(--volt)); color: var(--color-primary-reverse, #121500); display: grid; place-items: center; font-weight: 800; }
.sp-text-link { position: absolute; inset-inline-start: 0; top: 50%; transform: translateY(-50%); font-weight: 700; color: var(--ink-soft); }
.sp-text-link:hover { color: var(--accent); }
.sp-tone { position: absolute; inset-inline-end: 0; top: 50%; width: 2.5rem; height: 2.5rem; margin-top: -1.25rem; border: 0; border-radius: var(--r); background: transparent; color: inherit; display: grid; place-items: center; cursor: pointer; padding: 0; }
.sp-tone svg { width: 22px; height: 22px; }
@container (max-width: 640px) { .sp-text-link { display: none; } }
`;

export default class PageBar extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private dark = false;
  private stop = () => {};
  private pinned: HTMLElement | null = null;
  private opened: HTMLElement[] = [];
  private modeKey = "";

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-announce", announceCss("sp", "slant"));
    injectStyles("sp-page-bar", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    const onTone = () => { this.dark = currentTone() === "dark"; };
    window.addEventListener("sp-tone", onTone);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.removeEventListener("sp-tone", onTone);
      this.release();
    };
  }

  protected willUpdate() {
    const cfg = getConfig(this.config);
    const key = `${unwrapValue(cfg.default_mode) || "light"}|${this.showMode(cfg)}`;
    if (key === this.modeKey) return;
    this.modeKey = key;
    applyTone(this.openingMode(cfg));
    this.dark = currentTone() === "dark";
  }

  disconnectedCallback() {
    stopStrips(this, "sp");
    this.stop();
    super.disconnectedCallback();
  }

  protected updated() {
    rotateStrips(this, "sp");
    this.pin();
  }

  private showMode(cfg: Record<string, any>): boolean {
    if (cfg.show_mode_toggle == null || cfg.show_mode_toggle === "") return true;
    return flag(cfg.show_mode_toggle);
  }

  private openingMode(cfg: Record<string, any>): "light" | "dark" {
    const base = String(unwrapValue(cfg.default_mode) || "light");
    if (this.showMode(cfg)) {
      const saved = savedTone();
      if (saved) return saved;
    }
    if (base === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    return base === "light" ? "light" : "dark";
  }

  private place(run: () => void) {
    const view = this.ownerDocument.defaultView;
    if (!view) {
      run();
      return;
    }
    const nodes = new Set<Element>([this.ownerDocument.documentElement, this.ownerDocument.body]);
    if (this.ownerDocument.scrollingElement) nodes.add(this.ownerDocument.scrollingElement);
    let node: HTMLElement | null = this;
    while (node) {
      nodes.add(node);
      node = node.parentElement;
    }
    const marks = [...nodes].map((el) => [el, el.scrollTop] as const);
    const x = view.scrollX;
    const y = view.scrollY;
    const put = () => {
      for (const [el, top] of marks) if (el.scrollTop !== top) el.scrollTop = top;
      if (Math.abs(view.scrollY - y) > 1 || Math.abs(view.scrollX - x) > 1) view.scrollTo(x, y);
    };
    run();
    put();
    view.requestAnimationFrame(() => {
      put();
      view.requestAnimationFrame(put);
    });
  }

  private outerBox(): HTMLElement {
    let node: HTMLElement = this;
    while (node.parentElement && node.parentElement !== document.body && node.parentElement !== document.documentElement) {
      const parent = node.parentElement;
      const sections = [...parent.children].filter((el) => el.tagName !== "SCRIPT" && el.tagName !== "STYLE");
      if (sections.length > 1) return node;
      node = parent;
    }
    return node;
  }

  private pin() {
    const cfg = getConfig(this.config);
    const sticky = cfg.sticky == null || cfg.sticky === "" ? true : flag(cfg.sticky);
    const trans = flag(cfg.transparent);
    const outer = this.outerBox();
    if (this.pinned && this.pinned !== outer) this.release();
    this.pinned = outer;
    outer.style.position = sticky ? "sticky" : trans ? "relative" : "";
    outer.style.top = sticky ? "0" : "";
    outer.style.zIndex = sticky || trans ? "40" : "";
    outer.style.marginBottom = trans ? `-${this.offsetHeight}px` : "";
    this.opened.forEach((el) => { el.style.overflow = ""; });
    this.opened = [];
    if (!sticky) return;
    let node = outer.parentElement;
    while (node && node !== document.body && node !== document.documentElement) {
      const flow = getComputedStyle(node);
      if (flow.overflowY === "auto" || flow.overflowY === "scroll") break;
      if (flow.overflowY === "hidden" || flow.overflowX === "hidden") {
        node.style.overflow = "clip";
        this.opened.push(node);
      }
      node = node.parentElement;
    }
  }

  private release() {
    if (this.pinned) {
      this.pinned.style.position = this.pinned.style.top = this.pinned.style.zIndex = this.pinned.style.marginBottom = "";
      this.pinned = null;
    }
    this.opened.forEach((el) => { el.style.overflow = ""; });
    this.opened = [];
  }

  render() {
    const cfg = getConfig(this.config);
    const brand = localizedString(cfg.brand) || ((window as any).Salla?.config?.get?.("store.name") as string) || "";
    const badge = localizedString(cfg.badge) || "ق";
    const linkLabel = localizedString(cfg.link_label);
    const linkUrl = linkHref(cfg.link_url);
    const logo = (this.dark && cfg.logo_dark) || cfg.logo;
    const height = Math.min(Math.max(Number(cfg.logo_height) || 52, 28), 120);
    const start = String(unwrapValue(cfg.align) || "center") === "start";
    const clear = flag(cfg.transparent);
    return html`
      ${announceStrips(cfg, "sp", "slant", `sp-root ${schemeOf(cfg)}`, announceTone(cfg))}
      <header class=${`sp-root sp-bar ${schemeOf(cfg)} ${clear ? "is-clear" : ""}`} style=${`${sectionStyle(cfg)};--sp-logo:${height}px`}>
        <div class="sp-nav sp-wrap ${start ? "is-start" : ""}">
          ${linkLabel && linkUrl ? html`<a class="sp-text-link" href=${linkUrl}>${linkLabel}</a>` : nothing}
          <a href=${linkHref(cfg.home_url) || "#"} class="sp-logo" aria-label=${brand}>
            ${logo ? html`<img src=${logo} alt=${brand} />` : html`<span class="sp-mark">${badge}</span>${brand}`}
          </a>
          ${this.showMode(cfg) ? html`<button type="button" class="sp-tone" aria-pressed=${this.dark ? "true" : "false"} aria-label=${this.dark ? t({ ar: "التبديل إلى الوضع الفاتح", en: "Switch to light mode" }) : t({ ar: "التبديل إلى الوضع الداكن", en: "Switch to dark mode" })} @mousedown=${(event: Event) => event.preventDefault()} @click=${() => this.place(() => { applyTone(this.dark ? "light" : "dark"); this.dark = currentTone() === "dark"; })}>
            ${this.dark
              ? html`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor" /><g fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.1 5.1l1.6 1.6M17.3 17.3l1.6 1.6M18.9 5.1l-1.6 1.6M6.7 17.3l-1.6 1.6" /></g></svg>`
              : html`<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M14.5 2.4a9 9 0 1 0 7.1 13.6A8 8 0 0 1 14.5 2.4z" /></svg>`}
          </button>` : nothing}
        </div>
      </header>`;
  }
}
