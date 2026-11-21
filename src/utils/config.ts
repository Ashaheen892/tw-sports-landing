export type ComponentConfig = Record<string, any>;

/** Accepts the flat demo config and the landing renderer wrapper `{ component }`. */
export function getConfig(raw?: ComponentConfig | null): ComponentConfig {
  if (!raw) return {};
  if (raw.component && typeof raw.component === "object") return raw.component;
  return raw;
}

export function getLocale(): string {
  const lang = (window as any).Salla?.lang?.getLocale?.() || document.documentElement.lang || "ar";
  return String(lang).toLowerCase().startsWith("en") ? "en" : "ar";
}

export function isRtl(): boolean {
  return (document.documentElement.dir || (getLocale() === "ar" ? "rtl" : "ltr")) === "rtl";
}

/** Resolves a multilanguage value to the active locale. */
export function localizedString(value: unknown): string {
  if (value === null || value === undefined || value === "") return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const text = obj[getLocale()] || obj.ar || obj.en;
    return typeof text === "string" ? text : "";
  }
  return String(value);
}

export function t(strings: { ar: string; en: string }): string {
  return getLocale() === "ar" ? strings.ar : strings.en;
}

export function unwrapValue(value: any): any {
  if (Array.isArray(value)) return unwrapValue(value[0]?.value ?? value[0] ?? "");
  if (value && typeof value === "object" && "value" in value) return value.value;
  return value ?? "";
}

/** A footer or button URL, whether Salla saved a string or `{ value }` / `{ url }`. */
export function linkHref(value: unknown): string {
  if (value == null || value === "") return "";
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return linkHref(value[0]);
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (obj.url) return linkHref(obj.url);
    if ("value" in obj) return linkHref(obj.value);
    if (obj.href) return linkHref(obj.href);
  }
  return "";
}

export function flag(value: unknown): boolean {
  const raw = unwrapValue(value);
  if (raw === true || raw === 1) return true;
  if (typeof raw === "string") {
    const text = raw.trim().toLowerCase();
    return text === "true" || text === "1" || text === "on" || text === "yes";
  }
  return false;
}

export function getCollectionItems<T extends Record<string, any>>(items: unknown, prefix: string): T[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (!item || typeof item !== "object") return {} as T;
    const normalized: Record<string, any> = {};
    for (const [key, val] of Object.entries(item)) {
      normalized[key.startsWith(`${prefix}.`) ? key.slice(prefix.length + 1) : key] = val;
    }
    return normalized as T;
  });
}

export function watchLocale(host: { requestUpdate: () => void }): () => void {
  const update = () => host.requestUpdate();
  window.addEventListener("language-changed", update);
  return () => window.removeEventListener("language-changed", update);
}
