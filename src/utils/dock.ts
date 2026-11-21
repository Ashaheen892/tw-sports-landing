import { flag, localizedString, t, unwrapValue } from "./config.js";

const WA = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 4.2A7.8 7.8 0 0 0 5.3 16l-.7 3.2 3.3-.7A7.8 7.8 0 1 0 12 4.2Zm3.7 10.3c-.2.5-1 .9-1.4 1-.4.1-.8.1-1.3-.1-.3-.1-.7-.2-1.2-.5-2.1-1.1-3.4-3.2-3.5-3.4-.1-.2-.9-1.2-.9-2.3s.6-1.6.8-1.8c.2-.2.4-.3.6-.3h.4c.2 0 .3 0 .5.4.2.5.6 1.6.7 1.7.1.2 0 .3-.1.5l-.3.4c-.1.1-.2.2 0 .4.2.3.7 1 1.5 1.6.6.5 1.1.6 1.3.5l.4-.3c.2-.1.3-.1.5 0 .2.2 1 .8 1.1 1 .1.1.1.3 0 .5Z"></path></svg>`;
const UP = `<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M11 19V8.8L7.4 12.4 6 11l6-6 6 6-1.4 1.4L13 8.8V19h-2Z"></path></svg>`;

export type DockNodes = { wa: HTMLAnchorElement | null; top: HTMLButtonElement | null };

function shown(value: unknown): boolean {
  if (value == null || value === "") return true;
  return flag(value);
}

function sideOf(value: unknown, fallback: "start" | "end"): "start" | "end" {
  return String(unwrapValue(value) || fallback) === "end" ? "end" : "start";
}

function digitsOf(value: unknown): string {
  const raw = typeof value === "string" ? value : localizedString(value);
  return raw.replace(/\D/g, "");
}

function paint(el: HTMLElement, bg: unknown, ink: unknown) {
  el.style.background = String(bg || "").trim();
  el.style.color = String(ink || "").trim();
}

function place(el: HTMLElement, side: "start" | "end", raised: boolean) {
  el.style.bottom = raised ? "5.6rem" : "1.15rem";
  el.style.insetInlineStart = side === "start" ? "1.15rem" : "auto";
  el.style.insetInlineEnd = side === "end" ? "1.15rem" : "auto";
}

export function syncDocks(
  cfg: Record<string, any>,
  prefix: string,
  nodes: DockNodes,
  onTop: (event: Event) => void,
  options: { hideTop?: boolean; topText?: boolean } = {},
): DockNodes {
  const showWa = shown(cfg.show_whatsapp);
  const showTop = shown(cfg.show_top) && !options.hideTop;
  const waSide = sideOf(cfg.whatsapp_side, "start");
  const topSide = sideOf(cfg.top_side, "end");
  const stacked = showWa && showTop && waSide === topSide;
  const digits = digitsOf(cfg.whatsapp_number || "201153958512");
  const message = localizedString(cfg.whatsapp_message);
  const href = digits ? `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}` : "";

  if (showWa && href) {
    if (!nodes.wa) {
      const link = document.createElement("a");
      link.className = `${prefix}-dock ${prefix}-dock--wa`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.innerHTML = WA;
      document.body.appendChild(link);
      nodes.wa = link;
    }
    nodes.wa.href = href;
    nodes.wa.setAttribute("aria-label", t({ ar: "واتساب", en: "WhatsApp" }));
    paint(nodes.wa, cfg.whatsapp_bg, cfg.whatsapp_ink);
    place(nodes.wa, waSide, stacked);
    nodes.wa.hidden = false;
  } else if (nodes.wa) nodes.wa.hidden = true;

  const label = localizedString(cfg.top_label) || t({ ar: "أعلى", en: "Top" });
  if (shown(cfg.show_top)) {
    if (!nodes.top) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `${prefix}-dock ${prefix}-dock--top`;
      button.innerHTML = UP;
      button.addEventListener("click", onTop);
      document.body.appendChild(button);
      nodes.top = button;
    }
    nodes.top.setAttribute("aria-label", label);
    if (options.topText) {
      let caption = nodes.top.querySelector("span");
      if (!caption) {
        caption = document.createElement("span");
        nodes.top.appendChild(caption);
      }
      caption.textContent = label;
    }
    paint(nodes.top, cfg.top_bg, cfg.top_ink);
    place(nodes.top, topSide, false);
    nodes.top.hidden = !showTop;
  } else if (nodes.top) nodes.top.hidden = true;

  return nodes;
}

export function clearDocks(nodes: DockNodes) {
  nodes.wa?.remove();
  nodes.top?.remove();
  nodes.wa = null;
  nodes.top = null;
}

export function scrollPageTop(event: Event, host: Element) {
  if (event.cancelable) event.preventDefault();
  const targets = new Set<Element>();
  const addDoc = (doc: Document) => {
    targets.add(doc.documentElement);
    if (doc.body) targets.add(doc.body);
    if (doc.scrollingElement) targets.add(doc.scrollingElement);
  };
  addDoc(document);
  try {
    if (window.parent && window.parent !== window) addDoc(window.parent.document);
  } catch {
    /* the parent page is a different site */
  }
  let node: Element | null = host;
  while (node) {
    if (node.scrollHeight > node.clientHeight + 4) targets.add(node);
    node = node.parentElement;
  }
  targets.forEach((el) => {
    el.scrollTop = 0;
  });
  try { window.scrollTo(0, 0); } catch { /* the window is not scrollable */ }
}
