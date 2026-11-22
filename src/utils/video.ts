import { unwrapValue } from "./config.js";

export function clipUrl(value: unknown): string {
  const raw = unwrapValue(value);
  if (typeof raw === "string") return raw.trim();
  if (raw && typeof raw === "object") {
    const url = (raw as { url?: unknown; src?: unknown }).url ?? (raw as { src?: unknown }).src;
    if (typeof url === "string") return url.trim();
  }
  return "";
}

export function isFileClip(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|m4v)(\?|#|$)/i.test(url);
}

function kindOf(url: string): "youtube" | "vimeo" | "file" | "other" {
  if (isFileClip(url)) return "file";
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host === "youtu.be" || host.includes("youtube.com") || host.includes("youtube-nocookie.com")) return "youtube";
    if (host.includes("vimeo.com")) return "vimeo";
  } catch {
    /* keep the raw address */
  }
  return "other";
}

/** Embed address that starts silent. The mirror turns sound on after a second press. */
export function frameSrc(url: string): string {
  let frame = url;
  const kind = kindOf(url);
  try {
    const parsed = new URL(url);
    if (kind === "youtube") {
      const host = parsed.hostname.replace(/^www\./, "");
      let id = "";
      if (host === "youtu.be") id = parsed.pathname.split("/").filter(Boolean)[0] || "";
      else if (parsed.pathname.includes("/embed/")) id = parsed.pathname.split("/embed/")[1]?.split("/")[0] || "";
      else if (parsed.pathname.includes("/shorts/")) id = parsed.pathname.split("/shorts/")[1]?.split("/")[0] || "";
      else id = parsed.searchParams.get("v") || "";
      if (id) frame = `https://www.youtube-nocookie.com/embed/${id}`;
    } else if (kind === "vimeo") {
      const id = parsed.pathname.split("/").filter(Boolean).pop() || "";
      if (/^\d+$/.test(id)) frame = `https://player.vimeo.com/video/${id}`;
    }
  } catch {
    frame = url;
  }
  if (kind === "file") return frame;
  const params = new URLSearchParams();
  params.set("autoplay", "1");
  params.set("playsinline", "1");
  if (kind === "youtube") {
    params.set("mute", "1");
    params.set("rel", "0");
    params.set("enablejsapi", "1");
  } else if (kind === "vimeo") {
    params.set("muted", "1");
  } else {
    params.set("mute", "1");
    params.set("muted", "1");
  }
  return `${frame}${frame.includes("?") ? "&" : "?"}${params.toString()}`;
}

export function setFrameSound(frame: HTMLIFrameElement, on: boolean): void {
  const win = frame.contentWindow;
  if (!win) return;
  const src = frame.src || "";
  if (src.includes("youtube")) {
    win.postMessage(JSON.stringify({ event: "command", func: on ? "unMute" : "mute", args: "" }), "*");
    win.postMessage(JSON.stringify({ event: "command", func: "setVolume", args: [on ? 100 : 0] }), "*");
  } else if (src.includes("vimeo")) {
    win.postMessage(JSON.stringify({ method: "setVolume", value: on ? 1 : 0 }), "*");
  }
}
