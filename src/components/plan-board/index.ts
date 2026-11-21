import { html, LitElement, nothing } from "lit";
import { property, state } from "lit/decorators.js";
import { flag, getCollectionItems, getConfig, linkHref, localizedString, watchLocale } from "../../utils/config.js";
import { renderCta, schemeOf } from "../../utils/landing.js";
import { baseCss, injectFonts, injectStyles, sectionStyle, watchReveal } from "../../utils/styles.js";
import { digits, emptyCopy } from "../../utils/ui.js";

const css = `
.sp-plan { background: var(--sp-section-bg, var(--paper)); border-block: 1px solid var(--line); }
.sp-sp { display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-pane { background: var(--paper); padding: clamp(24px, 3.6vw, 38px); }
.sp-pane.dk { background: var(--page); }
.sp-lab { font-size: .74rem; color: var(--muted); font-weight: 500; letter-spacing: .1em; margin-block-end: 11px; }
.sp-pills { display: flex; flex-wrap: wrap; gap: 8px; margin-block-end: 22px; }
.sp-pill { background: var(--page); border: 1px solid var(--line-2); border-radius: var(--r); padding: 11px 17px; font-family: var(--disp); font-weight: 700; font-size: .92rem; cursor: pointer; color: var(--ink); }
.sp-pill[aria-pressed="true"] { background: var(--volt); border-color: var(--volt); color: #121500; }
.sp-pill:disabled { opacity: .4; cursor: not-allowed; }
.sp-pname { font-family: var(--disp); font-weight: 900; font-size: 1.7rem; letter-spacing: -.01em; }
.sp-pdesc { font-size: .88rem; color: var(--ink-soft); margin-block-start: 9px; min-height: 4.4em; }
.sp-prow { display: flex; align-items: baseline; gap: 12px; margin-block: 20px 6px; flex-wrap: wrap; }
.sp-prow .p { font-family: var(--disp); font-weight: 900; font-size: 2.1rem; color: var(--accent); }
.sp-prow s { color: var(--muted); font-size: .94rem; }
.sp-off { background: var(--hot); color: #fff; font-weight: 700; border-radius: 4px; font-size: .74rem; padding: 5px 11px; }
.sp-split { display: flex; gap: 10px; flex-wrap: wrap; margin-block-start: 22px; }
.sp-split .sp-btn { flex: 1 1 180px; }
.sp-terms { font-size: .78rem; color: var(--muted); margin-block-start: 14px; }
.sp-rng { margin-block-end: 22px; }
.sp-rng .top { display: flex; align-items: baseline; justify-content: space-between; gap: 10px; margin-block-end: 8px; }
.sp-rng .top b { font-family: var(--disp); font-weight: 900; font-size: 1.25rem; color: var(--accent); }
.sp-rng input[type="range"] { -webkit-appearance: none; appearance: none; width: 100%; height: 5px; border-radius: 999px; background: var(--line-2); outline: none; }
.sp-rng input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 24px; height: 24px; border-radius: 50%; background: var(--volt); border: 4px solid var(--page); cursor: pointer; }
.sp-res { border: 1px solid var(--line-2); border-radius: var(--r); padding: 20px; background: var(--paper); }
.sp-big { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.sp-big b { font-family: var(--disp); font-weight: 900; font-size: 3.1rem; color: var(--accent); line-height: 1; }
.sp-big span { font-size: .88rem; color: var(--ink-soft); }
.sp-mg { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; margin-block-start: 18px; }
.sp-mg div { background: var(--page); padding: 13px 12px; text-align: center; }
.sp-mg b { display: block; font-family: var(--disp); font-weight: 900; font-size: 1.2rem; }
.sp-mg span { font-size: .72rem; color: var(--muted); }
.sp-bars { margin-block-start: 20px; display: grid; gap: 13px; }
.sp-br .t { display: flex; justify-content: space-between; font-size: .8rem; color: var(--ink-soft); margin-block-end: 6px; }
.sp-tr { height: 7px; border-radius: 999px; background: var(--line); overflow: hidden; }
.sp-fl { display: block; height: 100%; border-radius: 999px; background: linear-gradient(90deg, var(--volt), var(--ice)); transition: width .7s cubic-bezier(.2,.7,.3,1); }
.sp-stack { margin-block-start: 20px; display: grid; gap: 1px; background: var(--line); border-radius: var(--r); overflow: hidden; }
.sp-si { background: var(--paper); padding: 13px 15px; display: flex; align-items: center; gap: 12px; font-size: .87rem; }
.sp-si .mk { width: 24px; height: 24px; border-radius: 4px; background: var(--volt); color: #121500; display: grid; place-items: center; font-weight: 700; font-size: .75rem; flex: 0 0 auto; }
.sp-si b { font-family: var(--disp); font-weight: 700; }
.sp-si span { margin-inline-start: auto; color: var(--muted); font-size: .78rem; }
.sp-note { font-size: .82rem; color: var(--ink-soft); margin-block-start: 16px; border-inline-start: 2px solid var(--volt); padding-inline-start: 13px; }
.sp-buy { position: fixed; inset-inline: 0; inset-block-end: 0; z-index: 50; background: color-mix(in srgb, var(--paper) 97%, transparent); border-top: 1px solid var(--line-2); backdrop-filter: blur(10px); transform: translateY(102%); transition: transform .3s; padding-block-end: env(safe-area-inset-bottom, 0); }
.sp-buy.on { transform: translateY(0); }
.sp-buy .in { display: flex; align-items: center; gap: 14px; padding-block: 12px; }
.sp-buy .nm { font-family: var(--disp); font-weight: 700; font-size: 1.04rem; }
.sp-buy .nm s { display: block; font-size: .74rem; color: var(--muted); text-decoration: none; font-family: var(--body); font-weight: 300; }
.sp-buy .pz { margin-inline-start: auto; font-family: var(--disp); font-weight: 900; font-size: 1.26rem; color: var(--accent); }
@container (min-width: 1020px) { .sp-sp { grid-template-columns: 1fr 1fr; } }
@container (max-width: 560px) { .sp-buy .nm s { display: none; } .sp-mg { grid-template-columns: 1fr; } }
`;

type Goal = {
  code: string;
  label: string;
  name: string;
  factor: number;
  meals: number;
  priceFactor: number;
  foodShare: number;
  text: string;
  note: string;
  bars: number[];
  lines: { title: string; detail: string }[];
  on: boolean;
};
type Level = { code: string; label: string; days: number; take: number; multiplier: number; on: boolean };
type Flavor = { label: string; available: boolean; on: boolean };

function num(value: unknown, fallback: number): number {
  const n = Number(String(value ?? "").replace(",", "."));
  return Number.isFinite(n) ? n : fallback;
}

function linesOf(value: unknown): { title: string; detail: string }[] {
  return localizedString(value).split("\n").map((line) => {
    const [title, detail = ""] = line.split("|").map((part) => part.trim());
    return title ? { title, detail } : null;
  }).filter((row): row is { title: string; detail: string } => Boolean(row));
}

function goalsOf(cfg: Record<string, any>): Goal[] {
  return getCollectionItems<Record<string, any>>(cfg.goals, "goals").map((item) => ({
    code: localizedString(item.code) || localizedString(item.label),
    label: localizedString(item.label),
    name: localizedString(item.name) || localizedString(item.label),
    factor: num(localizedString(item.factor), 2),
    meals: num(localizedString(item.meals), 4),
    priceFactor: num(localizedString(item.price_factor), 1),
    foodShare: num(localizedString(item.food_share), 0.55),
    text: localizedString(item.text),
    note: localizedString(item.note),
    bars: localizedString(item.bars).split(",").map((part) => num(part.trim(), 0)).slice(0, 3),
    lines: linesOf(item.lines),
    on: flag(item.on),
  })).filter((item) => item.label);
}

function levelsOf(cfg: Record<string, any>): Level[] {
  return getCollectionItems<Record<string, any>>(cfg.levels, "levels").map((item) => ({
    code: localizedString(item.code) || localizedString(item.label),
    label: localizedString(item.label),
    days: num(localizedString(item.days), 4),
    take: num(localizedString(item.take), 4),
    multiplier: num(localizedString(item.multiplier), 1),
    on: flag(item.on),
  })).filter((item) => item.label);
}

function flavorsOf(cfg: Record<string, any>): Flavor[] {
  return getCollectionItems<Record<string, any>>(cfg.flavors, "flavors").map((item) => ({
    label: localizedString(item.label),
    available: item.available == null || item.available === "" ? true : flag(item.available),
    on: flag(item.on),
  })).filter((item) => item.label);
}

export default class PlanBoard extends LitElement {
  @property({ type: Object }) config?: Record<string, any>;
  @state() private goal = "";
  @state() private level = "";
  @state() private flavor = "";
  @state() private weight = 82;
  @state() private showBar = false;
  private touched = false;
  private stop = () => {};
  private queued = false;

  protected createRenderRoot() {
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    this.classList.add("sp-host");
    injectFonts();
    injectStyles("sp-base", baseCss);
    injectStyles("sp-plan-board", css);
    const stopLocale = watchLocale(this);
    const stopReveal = watchReveal(this);
    const onScroll = () => {
      if (this.queued) return;
      this.queued = true;
      requestAnimationFrame(() => {
        this.queued = false;
        const next = this.getBoundingClientRect().top < window.innerHeight * 0.4;
        if (next !== this.showBar) this.showBar = next;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    this.stop = () => {
      stopLocale();
      stopReveal();
      window.removeEventListener("scroll", onScroll);
    };
  }

  disconnectedCallback() {
    this.stop();
    super.disconnectedCallback();
  }

  protected willUpdate() {
    if (this.touched) return;
    const cfg = getConfig(this.config);
    const goals = goalsOf(cfg);
    const levels = levelsOf(cfg);
    const flavors = flavorsOf(cfg);
    this.goal = goals.find((item) => item.on)?.code || goals[0]?.code || "";
    this.level = levels.find((item) => item.on)?.code || levels[0]?.code || "";
    this.flavor = flavors.find((item) => item.on && item.available)?.label || flavors.find((item) => item.available)?.label || "";
    const min = num(cfg.weight_min, 45);
    const max = num(cfg.weight_max, 140);
    this.weight = Math.min(max, Math.max(min, num(cfg.weight_default, 82)));
  }

  private pick(kind: "goal" | "level" | "flavor", value: string) {
    this.touched = true;
    if (kind === "goal") this.goal = value;
    if (kind === "level") this.level = value;
    if (kind === "flavor") this.flavor = value;
  }

  render() {
    const cfg = getConfig(this.config);
    const title = localizedString(cfg.title);
    const goals = goalsOf(cfg);
    const levels = levelsOf(cfg);
    const flavors = flavorsOf(cfg);
    const goal = goals.find((item) => item.code === this.goal) || goals[0];
    const level = levels.find((item) => item.code === this.level) || levels[0];
    const id = String(cfg.anchor || "plan");
    if (!goal || !level) {
      return html`<section class=${`sp-root sp-sec sp-plan ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)}>${emptyCopy()}</section>`;
    }
    const min = num(cfg.weight_min, 45);
    const max = num(cfg.weight_max, 140);
    const scoop = num(cfg.scoop_grams, 27);
    const creatine = num(cfg.creatine_grams, 5);
    const base = num(cfg.base_price, 265);
    const need = Math.round(this.weight * goal.factor);
    const fromFood = Math.round(need * goal.foodShare);
    const scoops = Math.max(1, Math.round((need - fromFood) / Math.max(1, scoop)));
    const price = Math.round((base * level.multiplier * goal.priceFactor) / 5) * 5;
    const old = Math.round((price * 1.25) / 5) * 5;
    const off = old > price ? Math.round((1 - price / old) * 100) : 0;
    const unit = localizedString(cfg.currency) || "ر.س";
    const stack = goal.lines.slice(0, Math.max(1, level.take));
    const barLabels = [
      localizedString(cfg.bar_1) || "بروتين",
      localizedString(cfg.bar_2) || "كرياتين",
      localizedString(cfg.bar_3) || "كافيين",
    ];
    const secondary = localizedString(cfg.secondary_label);
    const secondaryUrl = linkHref(cfg.secondary_url);
    const money = (value: number) => `${digits(value)} ${unit}`;
    return html`<section class=${`sp-root sp-sec sp-plan ${schemeOf(cfg)}`} id=${id} style=${sectionStyle(cfg)} aria-label=${title || "plan"}>
      <div class="sp-wrap">
        <div class="sp-head sp-rev">
          <div>
            ${localizedString(cfg.kicker) ? html`<span class="sp-no">${localizedString(cfg.kicker)}</span>` : nothing}
            ${title ? html`<h2 class="sp-h2">${title}</h2>` : nothing}
          </div>
          ${localizedString(cfg.text) ? html`<p class="sp-lead">${localizedString(cfg.text)}</p>` : nothing}
        </div>
        <div class="sp-sp sp-rev">
          <div class="sp-pane">
            <p class="sp-lab">${localizedString(cfg.goal_label) || "هدفك الأساسي"}</p>
            <div class="sp-pills" role="group" aria-label=${localizedString(cfg.goal_label) || "goal"}>
              ${goals.map((item) => html`<button type="button" class="sp-pill" aria-pressed=${item.code === goal.code ? "true" : "false"} @click=${() => this.pick("goal", item.code)}>${item.label}</button>`)}
            </div>
            <p class="sp-lab">${localizedString(cfg.level_label) || "مستوى التدريب"}</p>
            <div class="sp-pills" role="group">
              ${levels.map((item) => html`<button type="button" class="sp-pill" aria-pressed=${item.code === level.code ? "true" : "false"} @click=${() => this.pick("level", item.code)}>${item.label}</button>`)}
            </div>
            <div class="sp-rng">
              <div class="top"><span>${localizedString(cfg.weight_label) || "وزنك الحالي"}</span><b>${digits(this.weight)} ${localizedString(cfg.weight_unit) || "كغ"}</b></div>
              <input type="range" min=${String(min)} max=${String(max)} step="1" .value=${String(this.weight)} aria-label=${localizedString(cfg.weight_label) || "weight"} @input=${(event: Event) => { this.touched = true; this.weight = Number((event.target as HTMLInputElement).value); }}>
            </div>
            ${flavors.length ? html`<p class="sp-lab">${localizedString(cfg.flavor_label) || "النكهة"}</p>
              <div class="sp-pills" role="group">
                ${flavors.map((item) => html`<button type="button" class="sp-pill" ?disabled=${!item.available} aria-pressed=${item.label === this.flavor ? "true" : "false"} @click=${() => { if (item.available) this.pick("flavor", item.label); }}>${item.label}</button>`)}
              </div>` : nothing}
            <h3 class="sp-pname">${goal.name} — ${level.label}</h3>
            ${goal.text ? html`<p class="sp-pdesc">${goal.text}</p>` : nothing}
            <div class="sp-prow">
              <span class="p">${money(price)}</span>
              ${off ? html`<s>${money(old)}</s><span class="sp-off">${localizedString(cfg.off_label) || "خصم"} ${digits(off)}٪</span>` : nothing}
            </div>
            <div class="sp-split">
              ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
              ${secondary && secondaryUrl ? html`<a class="sp-btn ghost" href=${secondaryUrl}>${secondary}</a>` : nothing}
            </div>
            ${localizedString(cfg.disclaimer) ? html`<p class="sp-terms">${localizedString(cfg.disclaimer)}</p>` : nothing}
          </div>
          <div class="sp-pane dk">
            <p class="sp-lab">${localizedString(cfg.result_label) || "خطتك المحسوبة"}</p>
            <div class="sp-res" aria-live="polite">
              <div class="sp-big"><b>${digits(need)}</b><span>${localizedString(cfg.protein_label) || "غرام بروتين يومياً"} · ${digits(scoops)} ${localizedString(cfg.scoop_label) || "سكوب"}</span></div>
              <div class="sp-mg">
                <div><b>${digits(goal.meals)}</b><span>${localizedString(cfg.meals_label) || "وجبات باليوم"}</span></div>
                <div><b>${digits(level.days)}</b><span>${localizedString(cfg.days_label) || "أيام تدريب"}</span></div>
                <div><b>${digits(creatine)} ${localizedString(cfg.gram_label) || "غ"}</b><span>${localizedString(cfg.creatine_label) || "كرياتين يومي"}</span></div>
              </div>
              <div class="sp-bars">
                ${barLabels.map((label, index) => html`<div class="sp-br"><div class="t"><span>${label}</span><span>${digits(goal.bars[index] || 0)}٪</span></div><div class="sp-tr"><i class="sp-fl" style=${`width:${goal.bars[index] || 0}%`}></i></div></div>`)}
              </div>
              ${stack.length ? html`<div class="sp-stack">${stack.map((row) => html`<div class="sp-si"><span class="mk" aria-hidden="true">✓</span><b>${row.title}</b>${row.detail ? html`<span>${row.detail}</span>` : nothing}</div>`)}</div>` : nothing}
              ${goal.note ? html`<p class="sp-note">${goal.note}</p>` : nothing}
            </div>
          </div>
        </div>
      </div>
      <div class=${`sp-buy ${this.showBar ? "on" : ""}`} aria-live="polite">
        <div class="sp-wrap in">
          <div class="sp-nm">${goal.name} — ${level.label} <s>${digits(stack.length)} ${localizedString(cfg.items_label) || "أصناف"} · ${this.flavor}</s></div>
          <div class="sp-pz">${money(price)}</div>
          ${renderCta(cfg.primary_label, linkHref(cfg.primary_url))}
        </div>
      </div>
    </section>`;
  }
}
