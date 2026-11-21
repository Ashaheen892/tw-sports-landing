import { html, nothing } from "lit";
import { localizedString, unwrapValue } from "./config.js";

type SallaGlobal = {
  config?: { get: (key: string, fallback?: unknown) => any };
};

function salla(): SallaGlobal | undefined {
  return (window as any).Salla;
}

export function landingSettings(): Record<string, any> {
  return salla()?.config?.get("theme.settings") || {};
}

export function isLandingPage(): boolean {
  return salla()?.config?.get("page.is_landing_page") === true;
}

export function pageMode(): "product" | "promotion" {
  const value = landingSettings().page_for_product;
  if (typeof value === "boolean" || value == null) return value === false ? "promotion" : "product";
  if (typeof value === "string") return value === "promotion" ? "promotion" : "product";
  return Array.isArray(value) && value[0]?.value === "promotion" ? "promotion" : "product";
}

export function landingProductId(): string | null {
  if (!isLandingPage() || pageMode() !== "product") return null;
  const id = landingSettings().product?.value?.[0];
  return id ? String(id) : null;
}

/** Id saved by the product picker: a value, or `{ value }` / `{ id }`. */
export function pickedId(value: unknown): string | null {
  const first = Array.isArray(value) ? value[0] : value;
  if (first == null || first === "") return null;
  if (typeof first === "object") {
    const id = (first as { value?: unknown; id?: unknown }).value ?? (first as { id?: unknown }).id;
    return id ? String(id) : null;
  }
  return String(first);
}

export async function fetchProduct(id: string | number | null | undefined): Promise<Record<string, any> | null> {
  const api = (window as any).Salla;
  if (!id || !api?.product?.api?.getDetails) return null;
  try {
    await api.onReady?.();
    const res = await api.product.api.getDetails(id, ["images", "rating", "options"]);
    return res?.data?.id ? res.data : null;
  } catch {
    return null;
  }
}

export function money(amount: number): string {
  const api = (window as any).Salla;
  return api?.money ? api.money(amount) : String(amount);
}

export function mainButton(): { text: string; url: string } {
  const settings = landingSettings();
  return { text: String(settings.main_btn_text || ""), url: String(settings.main_btn_url || "") };
}

/** Product pages buy through the page checkout. Promotion pages follow the page link. */
export function openCheckout(): void {
  const checkout = document.querySelector(".s-block--fast-checkout");
  const layout = checkout?.getAttribute("data-layout");
  if (window.innerWidth < 1024 || layout === "side-drawer" || !checkout) {
    window.dispatchEvent(new CustomEvent("open-checkout-drawer"));
    return;
  }
  checkout.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function renderCta(labelValue: unknown, fallbackUrl = "", tone: "solid" | "ghost" | "light" = "solid") {
  const label = localizedString(labelValue).trim();
  if (!label) return nothing;
  const cls = tone === "ghost" ? "sp-btn ghost" : tone === "light" ? "sp-btn light" : "sp-btn";
  const productPage = Boolean(landingProductId());
  const demo = !isLandingPage();
  if (productPage || (demo && !fallbackUrl)) {
    return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  }
  const href = (isLandingPage() && pageMode() === "promotion" ? mainButton().url : "") || fallbackUrl;
  if (!href) return html`<button type="button" class=${cls} @click=${() => openCheckout()}>${label}</button>`;
  return html`<a class=${cls} href=${href}>${label}</a>`;
}

const TONE_KEY = "sp-landing-tone";

export function applyTone(mode: "light" | "dark"): void {
  document.documentElement.classList.remove("sp-mode-light", "sp-mode-dark");
  document.documentElement.classList.add(mode === "dark" ? "sp-mode-dark" : "sp-mode-light");
  try {
    localStorage.setItem(TONE_KEY, mode);
  } catch {
    /* private mode */
  }
  window.dispatchEvent(new CustomEvent("sp-tone"));
}

export function currentTone(): "light" | "dark" {
  return document.documentElement.classList.contains("sp-mode-dark") ? "dark" : "light";
}

export function savedTone(): "light" | "dark" | "" {
  try {
    const saved = localStorage.getItem(TONE_KEY);
    return saved === "dark" || saved === "light" ? saved : "";
  } catch {
    return "";
  }
}

/** `auto` follows the header toggle. `light` and `dark` pin the section. */
export function schemeOf(cfg: Record<string, any>): string {
  const scheme = String(unwrapValue(cfg.color_scheme) || "auto");
  if (scheme === "dark") return "sp-dark";
  if (scheme === "light") return "sp-light";
  return "sp-auto";
}
