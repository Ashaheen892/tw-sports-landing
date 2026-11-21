import { html, type TemplateResult } from "lit";
import { getLocale, localizedString, t } from "./config.js";

export function digits(n: number, pad = false): string {
  const raw = pad ? String(Math.max(0, Math.floor(n))).padStart(2, "0") : String(Math.round(n));
  if (getLocale() !== "ar") return raw;
  return raw.replace(/\d/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]);
}

export function emptyCopy() {
  return html`<p class="sp-empty">${t({ ar: "أضف عناصر هذا القسم من الإعدادات", en: "Add this section's items in the settings" })}</p>`;
}

export function textOf(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value);
  return localizedString(value);
}

export function frame(src: string, mark: string): TemplateResult {
  return html`<div class="sp-ph">${src ? html`<img src=${src} alt="" />` : html`<span aria-hidden="true">${mark || "⚡"}</span>`}</div>`;
}
