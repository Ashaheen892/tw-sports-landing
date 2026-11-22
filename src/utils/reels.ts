/**
 * Plays reel videos only while they are on screen, always muted until the visitor asks for sound.
 * Returns a cleanup function. Safe to call again after every render.
 */
export function watchReels(root: HTMLElement, selector = "video[data-reel]"): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!("IntersectionObserver" in window)) return () => {};
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0.55 && !reduced) {
        void video.play().catch(() => undefined);
      } else if (!video.paused) {
        video.pause();
      }
    });
  }, { threshold: [0, 0.55, 1] });
  root.querySelectorAll<HTMLVideoElement>(selector).forEach((video) => io.observe(video));
  return () => io.disconnect();
}

/** Scrolls a reel track by one card toward the reading direction (dir 1 = next). */
export function nudge(track: HTMLElement | null, dir: number): void {
  if (!track) return;
  const card = track.firstElementChild as HTMLElement | null;
  const step = (card?.getBoundingClientRect().width || 260) + 14;
  const rtl = getComputedStyle(track).direction === "rtl";
  track.scrollBy({ left: (rtl ? -1 : 1) * dir * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
