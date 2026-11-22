/**
 * Counts a stat up from zero the first time it scrolls into view.
 * Keeps the text around the number ("١٢ ألف", "+14,200", "٤٫٩", "SAR 150") and its digit script.
 */
const AR = "٠١٢٣٤٥٦٧٨٩";
const NUM = /[+-]?[\d٠-٩]+(?:[.,٫٬][\d٠-٩]+)*/;

type Parsed = { before: string; after: string; value: number; decimals: number; arabic: boolean; grouped: boolean };

function parse(text: string): Parsed | null {
  const match = text.match(NUM);
  if (!match || match.index === undefined) return null;
  const raw = match[0];
  const arabic = /[٠-٩]/.test(raw);
  const latin = raw.replace(/[٠-٩]/g, (d) => String(AR.indexOf(d)));
  const decimalMark = /[.٫](\d+)$/.exec(latin);
  const decimals = decimalMark && decimalMark[1].length < 3 ? decimalMark[1].length : 0;
  const grouped = /[,٬]/.test(latin) || (!decimals && /[.٫]\d{3}/.test(latin));
  const clean = decimals ? latin.replace(/[,٬]/g, "").replace(/[٫]/, ".") : latin.replace(/[.,٫٬]/g, "");
  const value = Number(clean);
  if (!Number.isFinite(value) || value === 0) return null;
  return { before: text.slice(0, match.index), after: text.slice(match.index + raw.length), value, decimals, arabic, grouped };
}

function format(n: number, p: Parsed): string {
  let out = p.decimals ? n.toFixed(p.decimals) : String(Math.round(n));
  if (p.grouped) out = out.replace(/\B(?=(\d{3})+(?!\d))/g, p.arabic ? "٬" : ",");
  if (p.arabic) out = out.replace(/\d/g, (d) => AR[Number(d)]).replace(".", "٫");
  return p.before + out + p.after;
}

const done = new WeakSet<Element>();

export function countUp(root: ParentNode, selector: string, duration = 1400): () => void {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nodes = Array.from(root.querySelectorAll<HTMLElement>(selector)).filter((el) => !done.has(el));
  if (reduced || !nodes.length || !("IntersectionObserver" in window)) return () => {};
  const frames = new Set<number>();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target as HTMLElement;
      io.unobserve(el);
      const final = el.dataset.countFinal || el.textContent || "";
      const parsed = parse(final);
      if (!parsed) return;
      el.dataset.countFinal = final;
      done.add(el);
      const start = performance.now();
      const tick = (now: number) => {
        const k = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = k < 1 ? format(parsed.value * eased, parsed) : final;
        if (k < 1) frames.add(requestAnimationFrame(tick));
      };
      el.textContent = format(0, parsed);
      frames.add(requestAnimationFrame(tick));
    });
  }, { threshold: 0.4 });
  nodes.forEach((el) => io.observe(el));
  return () => {
    io.disconnect();
    frames.forEach((id) => cancelAnimationFrame(id));
  };
}
