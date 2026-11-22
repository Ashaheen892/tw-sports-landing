import type { ReactiveControllerHost } from "lit";
import { isRtl } from "./config.js";
import { isFileClip } from "./video.js";

export type SlideKind = "image" | "file" | "frame";

/**
 * Slider state for sections whose slides may be an image, a video file or a YouTube / Vimeo embed.
 * Images stay `imageMs`, embeds `frameMs`, and a video file moves on when it ends.
 * Hover, focus and a press pause it; reduced motion turns autoplay off.
 */
// Written as an expression: Salla's dev transform treats the first `class <Name>` in any module loaded for
// a section as that section and calls <Name>.registerSallaComponent on it, which would throw here.
export const Deck = class {
  index = 0;
  sound = false;
  paused = false;
  reduced = false;
  kinds: SlideKind[] = [];
  /** Slides whose video failed to load: they are timed like an image so the slider never stalls. */
  private failed = new Set<number>();
  private timer = 0;
  private left = 0;
  private since = 0;
  private point = 0;
  private pointing = false;

  constructor(private host: ReactiveControllerHost & HTMLElement, private imageMs = 6500, private frameMs = 18000) {
    host.addController(this);
  }

  static kindOf(video: string): SlideKind {
    if (!video) return "image";
    return isFileClip(video) ? "file" : "frame";
  }

  hostConnected() {
    this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.host.addEventListener("pointerenter", this.pause);
    this.host.addEventListener("pointerleave", this.resume);
    this.host.addEventListener("focusin", this.pause);
    this.host.addEventListener("focusout", this.resume);
  }

  hostDisconnected() {
    window.clearTimeout(this.timer);
    this.host.removeEventListener("pointerenter", this.pause);
    this.host.removeEventListener("pointerleave", this.resume);
    this.host.removeEventListener("focusin", this.pause);
    this.host.removeEventListener("focusout", this.resume);
  }

  /** Call from render with the current slides. Starts the clock on the first call and when the slides change. */
  sync(kinds: SlideKind[]) {
    const changed = kinds.join() !== this.kinds.join();
    if (changed) this.failed.clear();
    this.kinds = kinds;
    if (this.index >= kinds.length) this.index = 0;
    if (changed) this.arm();
  }

  get count() {
    return this.kinds.length;
  }

  get kind(): SlideKind {
    const kind = this.kinds[this.index] || "image";
    return kind === "file" && this.failed.has(this.index) ? "image" : kind;
  }

  /** How long the current slide stays, or 0 when it waits for a video to end. */
  get ms() {
    if (this.kind === "file") return 0;
    return this.kind === "frame" ? this.frameMs : this.imageMs;
  }

  get auto() {
    return !this.reduced && this.count > 1;
  }

  private arm(ms = this.ms) {
    window.clearTimeout(this.timer);
    this.timer = 0;
    this.left = ms;
    if (!this.auto || !ms) return;
    this.since = performance.now();
    if (this.paused) return;
    this.timer = window.setTimeout(() => this.go(1), ms);
  }

  pause = () => {
    if (this.paused) return;
    this.paused = true;
    if (this.timer) {
      window.clearTimeout(this.timer);
      this.timer = 0;
      this.left = Math.max(400, this.left - (performance.now() - this.since));
    }
    this.host.requestUpdate();
  };

  resume = () => {
    if (!this.paused) return;
    this.paused = false;
    if (this.auto && this.left) {
      this.since = performance.now();
      this.timer = window.setTimeout(() => this.go(1), this.left);
    }
    this.host.requestUpdate();
  };

  go(dir: number) {
    if (this.count < 2) return;
    this.index = (this.index + dir + this.count) % this.count;
    this.arm();
    this.host.requestUpdate();
  }

  pick(index: number) {
    this.index = index;
    this.arm();
    this.host.requestUpdate();
  }

  /** Bind to a video's error event. */
  fail = () => {
    if (this.failed.has(this.index)) return;
    this.failed.add(this.index);
    this.arm();
    this.host.requestUpdate();
  };

  toggleSound() {
    this.sound = !this.sound;
    this.host.requestUpdate();
  }

  key = (event: KeyboardEvent) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const forward = isRtl() ? event.key === "ArrowLeft" : event.key === "ArrowRight";
    this.go(forward ? 1 : -1);
  };

  down = (event: PointerEvent) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    this.point = event.clientX;
    this.pointing = true;
  };

  up = (event: PointerEvent) => {
    if (!this.pointing) return;
    this.pointing = false;
    const delta = event.clientX - this.point;
    if (Math.abs(delta) < 48) return;
    const forward = isRtl() ? delta > 0 : delta < 0;
    this.go(forward ? 1 : -1);
  };

  /** Fills a progress bar from a video file's own clock. */
  progress = (event: Event) => {
    const video = event.currentTarget as HTMLVideoElement;
    const bar = (this.host as HTMLElement).querySelector("[data-deck-fill]") as HTMLElement | null;
    if (bar && video.duration) bar.style.transform = `scaleX(${video.currentTime / video.duration})`;
  };
};

export type Deck = InstanceType<typeof Deck>;
