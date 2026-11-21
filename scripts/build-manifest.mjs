import fs from "node:fs";

const L = (ar, en) => ({ ar, en });
const px = (id, width = 1400) => `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}`;
const text = (id, label, value, o = {}) => ({
  id,
  type: "string",
  format: o.format || "text",
  label,
  icon: o.icon || "sicon-format-text-alt",
  multilanguage: o.multilang !== false,
  required: false,
  description: o.desc ?? null,
  minLength: 0,
  maxLength: o.max ?? (o.format === "textarea" ? 1200 : 180),
  value,
});
const area = (id, label, value, desc = null) => text(id, label, value, { format: "textarea", icon: "sicon-paragraph", desc, max: 1200 });
const plain = (id, label, value, desc = null) => text(id, label, value, { multilang: false, desc, max: 80 });
const color = (id, label, value = "") => ({
  id, type: "string", format: "color", inputType: "color", label, icon: "sicon-format-fill", required: false, description: null, value,
});
const sw = (id, label, value, desc = null) => ({
  id, type: "boolean", format: "switch", label, icon: "sicon-toggle-off", required: false, description: desc, value, selected: value,
});
const image = (id, label, desc, value = "") => ({
  id, type: "string", format: "image", label, icon: "sicon-image", required: false, description: desc, value,
});
const url = (id, label, value = "", desc = null) => ({
  id, type: "string", format: "text", label, icon: "sicon-link", multilanguage: false, required: false,
  description: desc || "رابط داخل الصفحة مثل #plan، أو رابط كامل يبدأ بـ https.",
  minLength: 0, maxLength: 500, value,
});
const line = (id) => ({ id, type: "static", format: "line" });
const num = (id, label, value, min, max, desc = null) => ({
  id, type: "number", format: "number", inputType: "number", label, icon: "sicon-calculator",
  required: false, description: desc, minimum: min, maximum: max, value,
});
const collection = (id, itemLabel, fields, value, min, max) => ({
  id, type: "collection", format: "collection", required: min > 0, minLength: min, maxLength: max,
  item_label: itemLabel,
  fields: fields.map((field) => ({ ...field, id: String(field.id).includes(".") ? field.id : `${id}.${field.id}` })),
  value: value.map((row) => {
    const out = {};
    for (const [key, val] of Object.entries(row)) out[key.startsWith(`${id}.`) ? key : `${id}.${key}`] = val;
    return out;
  }),
});
const buyHint = "في صفحة منتج يفتح الشراء السريع. في صفحة العروض يتبع رابط زر الصفحة، أو هذا الرابط إن وضعته.";
const KEY = {
  schemeAuto: "b5be2661-56fa-4e98-acd8-9d25e4671994",
  schemeLight: "46c4c561-9252-43c0-9cb2-ea2cec3f8b9a",
  schemeDark: "a7c50b53-8c83-47c9-a437-8d4d7746f5d2",
  modeLight: "5e44b78b-ba1b-476e-a800-22d306132d7d",
  modeDark: "5d485d48-f62c-4dee-91dc-1949b7a97b7f",
  modeSystem: "79b97e66-25d4-43c0-b13f-2da78ef9c715",
  annMove: "c9a57e36-a184-4f20-9d71-8e4b3c6a0f27",
  annStill: "d0b68f47-b295-4a31-8e82-9f5c4d7b1a38",
};
const opt = (value, label, key) => ({ label, value, key });
const drop = (id, label, options, selected, desc = null) => {
  const opts = options.map(([value, name, key]) => opt(value, name, key));
  const picked = opts.filter((item) => item.value === selected);
  return {
    id, type: "items", format: "dropdown-list", source: "Manual", label, icon: "sicon-list",
    required: false, description: desc, options: opts, selected: picked, value: picked,
  };
};
const scheme = (selected = "auto") => drop(
  "color_scheme",
  "وضع الألوان",
  [["auto", "حسب رأس الصفحة", KEY.schemeAuto], ["light", "فاتح دائماً", KEY.schemeLight], ["dark", "داكن دائماً", KEY.schemeDark]],
  selected,
  "حسب رأس الصفحة يتبع زر الفاتح والداكن. الفاتح أو الداكن يثبت القسم ولا يتأثر بالزر.",
);

const components = [
  {
    title: "رأس الصفحة",
    icon: "sicon-store",
    name: "page-bar",
    key: "eac17f82-e143-4a43-ace0-54a6aa5cd45d",
    image: "",
    props: { "min-height": "110px" },
    fields: [
      text("announce", "الشريط الإعلاني", L("شحن مجاني فوق ٢٠٠ ر.س · تحليل مختبر مستقل مع كل دفعة · استرجاع ١٤ يوم", "Free shipping over SAR 200 · an independent lab report with every batch · 14-day returns"), { desc: "يظهر فوق الشعار. اتركه فارغاً لإخفاء الشريط." }),
      drop("announce_mode", "حركة الشريط", [["move", "متحرك", KEY.annMove], ["still", "ثابت", KEY.annStill]], "move", "المتحرك يمرّ الجملة باستمرار. الثابت يُبقيها في الوسط."),
      image("logo", "شعار", "اتركه فارغاً ليظهر الاسم مع الشارة. المقاس المقترح 280×80 بكسل."),
      image("logo_dark", "شعار للوضع الداكن", "يظهر عندما تكون الصفحة داكنة. بدونه يُستخدم الشعار الأساسي."),
      num("logo_height", "ارتفاع الشعار", 52, 28, 120, "بالبكسل."),
      drop("align", "مكان الشعار", [["center", "الوسط", "36ce7336-a377-409d-b4dd-e7a591343dda"], ["start", "البداية", "8818c046-be2e-4a84-9b64-a0eb33296419"]], "center"),
      text("brand", "اسم المتجر", L("قوّة", "Quwa")),
      text("badge", "حرف الشارة", L("ق", "Q"), { max: 4 }),
      url("home_url", "رابط الشعار", "#"),
      text("link_label", "رابط نصي", L("خطتي", "My plan"), { max: 40 }),
      url("link_url", "عنوان الرابط النصي", "#plan"),
      line("pb-brand"),
      sw("sticky", "تثبيت الرأس عند التمرير", true, "يبقى الاسم ظاهراً أثناء نزول الزائر."),
      sw("transparent", "رأس شفاف فوق القسم التالي", false, "يناسب صورة افتتاحية داكنة. عند التمرير يمكن إبقاؤه ثابتاً."),
      sw("show_mode_toggle", "زر الفاتح والداكن", true, "أيقونة في الرأس تتبدل بين القمر والشمس، وتبدّل الأقسام المضبوطة على حسب الصفحة، وتتذكر اختيار الزائر."),
      drop("default_mode", "وضع الصفحة عند الفتح", [["dark", "داكن", KEY.modeDark], ["light", "فاتح", KEY.modeLight], ["system", "حسب جهاز الزائر", KEY.modeSystem]], "dark"),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "افتتاح الخطة",
    icon: "sicon-image",
    name: "volt-hero",
    key: "c3475adb-2bba-4156-a6c6-540a6f8cf00e",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      text("kicker", "سطر صغير", L("كل دفعة مُحلّلة في مختبر مستقل · الرقم على العلبة", "Every batch is tested in an independent lab · the number is on the tub")),
      text("title_before", "ما قبل الكلمة المميزة", L("لا تُخمّن جرعتك.", "Stop guessing the dose."), { max: 80 }),
      text("title_accent", "الكلمة المميزة", L("احسبها.", "Calculate it."), { max: 40 }),
      text("title_after", "ما بعد الكلمة المميزة", L("", ""), { max: 80 }),
      area("text", "النص", L("أدخل وزنك وهدفك ومستوى تدريبك، وتُبنى لك خطة مكملات محدّدة بالغرام لا بالتقديرات — مع تحليل مختبر لكل علبة تستلمها.", "Enter your weight, goal, and training level. The plan comes back in grams, not guesses, with a lab report on every tub.")),
      text("primary_label", "نص الزر الأساسي", L("ابنِ خطتي الآن", "Build my plan")),
      url("primary_url", "رابط الزر الأساسي", "#plan", buyHint),
      text("secondary_label", "نص الزر الثاني", L("اقرأ التحاليل", "Read the lab reports")),
      url("secondary_url", "رابط الزر الثاني", "#labs"),
      line("vh-stats"),
      collection("stats", "رقم", [
        text("value", "الرقم", L("٢٧ غ", "27 g"), { max: 20 }),
        text("label", "الوصف", L("بروتين لكل سكوب", "protein per scoop"), { max: 40 }),
      ], [
        { value: L("٢٧ غ", "27 g"), label: L("بروتين لكل سكوب", "protein per scoop") },
        { value: L("٠ غ", "0 g"), label: L("سكر مضاف", "added sugar") },
        { value: L("٤٨ س", "48 h"), label: L("توصيل داخل المملكة", "delivery in the Kingdom") },
      ], 0, 3),
      line("vh-scene"),
      image("scene_image", "صورة الافتتاح", "المقاس المقترح 900×900 بكسل. اتركها فارغة ليظهر رسم الدمبل.", px(4164761, 1200)),
      text("chip_a_value", "رقم البطاقة الأولى", L("٩٨.٤٪", "98.4%"), { max: 20 }),
      text("chip_a_label", "وصف البطاقة الأولى", L("نقاء البروتين", "protein purity"), { max: 40 }),
      text("chip_b_value", "رقم البطاقة الثانية", L("١٤٢٠٠", "14,200"), { max: 20 }),
      text("chip_b_label", "وصف البطاقة الثانية", L("خطة جاهزة", "plans built"), { max: 40 }),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "شريط الأصناف",
    icon: "sicon-format-text-alt",
    name: "ticker-line",
    key: "ec4fceac-d2f1-4ec8-b2c2-6bff1e63b0ce",
    image: "",
    props: { "min-height": "48px" },
    fields: [
      collection("items", "عبارة", [
        text("text", "العبارة", L("واي بروتين آيزوليت", "Whey protein isolate")),
      ], [
        { text: L("واي بروتين آيزوليت", "Whey protein isolate") },
        { text: L("كرياتين مونوهيدرات", "Creatine monohydrate") },
        { text: L("قبل التمرين", "Pre-workout") },
        { text: L("أوميغا ٣", "Omega-3") },
        { text: L("مغنيسيوم", "Magnesium") },
        { text: L("BCAA", "BCAA") },
      ], 1, 8),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "شبكة المنتجات",
    icon: "sicon-box",
    name: "stack-grid",
    key: "943bca18-90e7-4933-82b5-6e6d5ad17707",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "stacks", "يُستخدم في روابط الرأس، مثل #stacks."),
      text("kicker", "سطر صغير", L("٠١ / المنتجات", "01 / products")),
      text("title", "العنوان", L("ستة أساسات… لا رفوف مزدحمة", "Six staples. No crowded shelves.")),
      area("text", "النص", L("لا نبيع ٢٠٠ صنفاً. نبيع ما له دليل، بجرعة فعّالة، وبمصدر معروف.", "Not 200 products. What has evidence, an effective dose, and a known source.")),
      collection("cards", "منتج", [
        text("tag", "شارة", L("الأكثر مبيعاً", "Bestseller"), { max: 40 }),
        image("image", "الصورة", "المقاس المقترح 800×500 بكسل. اتركها فارغة ليظهر الرمز."),
        text("mark", "رمز بديل للصورة", L("🥛", "🥛"), { max: 8 }),
        text("title", "الاسم", L("واي آيزوليت", "Whey isolate")),
        text("note", "الوصف", L("٢٧ غ بروتين · ٠ غ سكر", "27 g protein · 0 g sugar")),
        text("price", "السعر", L("٢٤٩ ر.س", "SAR 249"), { max: 30 }),
        text("compare", "السعر قبل الخصم", L("٣١٠ ر.س", "SAR 310"), { max: 30 }),
        url("url", "الرابط", "#plan"),
      ], [
        { tag: L("الأكثر مبيعاً", "Bestseller"), image: px(3837757), mark: L("🥛", "🥛"), title: L("واي آيزوليت", "Whey isolate"), note: L("٢٧ غ بروتين · ٠ غ سكر · مُرشّح بالتبادل الأيوني ونسبة لاكتوز أقل من ١٪.", "27 g protein · 0 g sugar · ion-exchanged, lactose under 1%."), price: L("٢٤٩ ر.س", "SAR 249"), compare: L("٣١٠ ر.س", "SAR 310"), url: "#plan" },
        { tag: L("", ""), image: px(6551133), mark: L("⚗️", "⚗️"), title: L("كرياتين مونوهيدرات", "Creatine monohydrate"), note: L("٥ غ لكل جرعة · Creapure مُصنّع في ألمانيا · بلا إضافات ولا محليات.", "5 g a serving · Creapure, made in Germany · no additives or sweeteners."), price: L("١٢٩ ر.س", "SAR 129"), compare: L("١٦٥ ر.س", "SAR 165"), url: "#plan" },
        { tag: L("", ""), image: px(1552242), mark: L("🔥", "🔥"), title: L("قبل التمرين", "Pre-workout"), note: L("٢٠٠ ملغ كافيين · سيترولين ٦ غ · بيتا ألانين ٣.٢ غ بجرعات معلنة.", "200 mg caffeine · 6 g citrulline · 3.2 g beta-alanine, doses declared."), price: L("١٥٩ ر.س", "SAR 159"), compare: L("١٩٥ ر.س", "SAR 195"), url: "#plan" },
        { tag: L("", ""), image: px(6456140), mark: L("🐟", "🐟"), title: L("أوميغا ٣ مركّز", "Concentrated omega-3"), note: L("١٠٠٠ ملغ EPA+DHA · زيت سمك مُنقّى من المعادن الثقيلة.", "1,000 mg EPA+DHA · fish oil screened for heavy metals."), price: L("٩٩ ر.س", "SAR 99"), compare: L("١٢٥ ر.س", "SAR 125"), url: "#plan" },
        { tag: L("", ""), image: px(3768916), mark: L("🧲", "🧲"), title: L("مغنيسيوم جلايسينات", "Magnesium glycinate"), note: L("٤٠٠ ملغ · شكل عالي الامتصاص يدعم النوم والاستشفاء.", "400 mg · a well-absorbed form for sleep and recovery."), price: L("٨٩ ر.س", "SAR 89"), compare: L("١١٠ ر.س", "SAR 110"), url: "#plan" },
        { tag: L("", ""), image: px(949126), mark: L("🎽", "🎽"), title: L("مستلزمات التدريب", "Training gear"), note: L("أحزمة رفع · ستربس · شيكر معدني · قفازات بقبضة مانعة للانزلاق.", "Lifting belts, straps, a metal shaker, and grip gloves."), price: L("٧٩ ر.س", "SAR 79"), compare: L("١٠٥ ر.س", "SAR 105"), url: "#plan" },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "خطوات المختبر",
    icon: "sicon-list",
    name: "lab-steps",
    key: "0402cb70-af00-480b-a5d2-15a53d9e3f9a",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "labs"),
      text("kicker", "سطر صغير", L("٠٢ / الشفافية", "02 / transparency")),
      text("title", "العنوان", L("أربع خطوات قبل أن تصل العلبة إليك", "Four steps before the tub reaches you")),
      area("text", "النص", L("الملصق وحده لا يكفي. هذه هي سلسلة الإثبات.", "The label is not enough. This is the chain of proof.")),
      collection("items", "خطوة", [
        text("mark", "الرقم", L("٠١", "01"), { max: 8 }),
        text("title", "العنوان", L("تحليل مختبر مستقل لكل دفعة", "An independent lab test for every batch")),
        area("text", "النص", L("كل رقم دفعة له تقرير يعرض نسبة البروتين الفعلية والمعادن الثقيلة.", "Every batch number has a report for measured protein and heavy metals.")),
      ], [
        { mark: L("٠١", "01"), title: L("تحليل مختبر مستقل لكل دفعة", "An independent lab test for every batch"), text: L("كل رقم دفعة له تقرير PDF يعرض نسبة البروتين الفعلية والمعادن الثقيلة. تجده بمسح رمز العلبة.", "Each batch number has a PDF for measured protein and heavy metals. Scan the code on the tub.") },
        { mark: L("٠٢", "02"), title: L("جرعات معلنة بالكامل", "Every dose is declared"), text: L("لا وجود لعبارة «خلطة خاصة» في أي منتج. كل مكوّن مكتوب بالملغرام.", "No product says “proprietary blend”. Every ingredient is written in milligrams.") },
        { mark: L("٠٣", "03"), title: L("خالٍ من المواد المحظورة", "Screened against banned substances"), text: L("فحص مطابق لقائمة الوكالة العالمية لمكافحة المنشطات، مهم للرياضيين المسجّلين.", "Screened against the World Anti-Doping Agency list, which matters for registered athletes.") },
        { mark: L("٠٤", "04"), title: L("تاريخ إنتاج لا تاريخ استيراد", "A production date, not an import date"), text: L("نطبع تاريخ التصنيع الحقيقي، ولا نستقبل دفعة مضى على إنتاجها أكثر من ٩٠ يوماً.", "We print the real manufacture date and do not accept a batch older than 90 days.") },
      ], 1, 6),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "حاسبة الخطة",
    icon: "sicon-calculator",
    name: "plan-board",
    key: "adfef080-b344-476c-b6e9-0f6ef67e8f4d",
    image: "",
    props: { "min-height": "760px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "plan"),
      text("kicker", "سطر صغير", L("٠٣ / خطتي", "03 / my plan")),
      text("title", "العنوان", L("احسب خطتك في ثلاثين ثانية", "Calculate your plan in thirty seconds")),
      area("text", "النص", L("معادلة بسيطة: وزنك × هدفك × مستوى تدريبك. النتيجة جرعة بالغرام وستاك محدّد.", "A simple equation: weight × goal × training level. The result is a dose in grams and a named stack.")),
      text("goal_label", "عنوان الأهداف", L("هدفك الأساسي", "Your main goal")),
      text("level_label", "عنوان المستويات", L("مستوى التدريب", "Training level")),
      text("weight_label", "عنوان الوزن", L("وزنك الحالي", "Current weight")),
      text("weight_unit", "وحدة الوزن", L("كغ", "kg"), { max: 12 }),
      num("weight_min", "أقل وزن", 45, 30, 80),
      num("weight_max", "أعلى وزن", 140, 90, 220),
      num("weight_default", "الوزن عند الفتح", 82, 40, 160),
      text("flavor_label", "عنوان النكهة", L("النكهة", "Flavor")),
      line("pb-math"),
      num("base_price", "أساس السعر", 265, 50, 2000, "يُضرب في معامل الهدف والمستوى، ثم يُقرّب لأقرب ٥."),
      num("scoop_grams", "غرام البروتين في السكوب", 27, 10, 50),
      num("creatine_grams", "غرام الكرياتين اليومي", 5, 1, 20),
      plain("currency", "العملة", "ر.س"),
      text("off_label", "كلمة الخصم", L("خصم", "off"), { max: 20 }),
      text("result_label", "عنوان النتيجة", L("خطتك المحسوبة", "Your calculated plan")),
      text("protein_label", "وصف البروتين", L("غرام بروتين يومياً", "grams of protein a day")),
      text("scoop_label", "كلمة السكوب", L("سكوب", "scoops"), { max: 20 }),
      text("meals_label", "وصف الوجبات", L("وجبات باليوم", "meals a day"), { max: 40 }),
      text("days_label", "وصف أيام التدريب", L("أيام تدريب", "training days"), { max: 40 }),
      text("creatine_label", "وصف الكرياتين", L("كرياتين يومي", "daily creatine"), { max: 40 }),
      text("gram_label", "اختصار الغرام", L("غ", "g"), { max: 8 }),
      text("bar_1", "اسم الشريط الأول", L("بروتين", "Protein"), { max: 40 }),
      text("bar_2", "اسم الشريط الثاني", L("كرياتين", "Creatine"), { max: 40 }),
      text("bar_3", "اسم الشريط الثالث", L("كافيين قبل التمرين", "Pre-workout caffeine"), { max: 40 }),
      text("items_label", "كلمة الأصناف", L("أصناف", "items"), { max: 20 }),
      line("pb-goals"),
      collection("goals", "هدف", [
        plain("code", "الرمز", "mass", "mass أو cut أو endu أو fit."),
        text("label", "زر الهدف", L("بناء عضل", "Build muscle")),
        text("name", "اسم الستاك", L("ستاك الضخامة", "Mass stack")),
        plain("factor", "غرام بروتين لكل كيلو", "2"),
        plain("meals", "عدد الوجبات", "4"),
        plain("price_factor", "معامل السعر", "1.13"),
        plain("food_share", "نسبة البروتين من الطعام", "0.55"),
        plain("bars", "نسب الأشرطة", "90,85,45", "ثلاثة أرقام مفصولة بفاصلة."),
        area("text", "وصف الخطة", L("هدفك زيادة الكتلة العضلية.", "The goal is more muscle.")),
        area("note", "ملاحظة", L("في أيام الراحة خفّض الكمية.", "On rest days, drop one scoop.")),
        area("lines", "أصناف الستاك", L("واي آيزوليت | ٢٧ غ لكل سكوب", "Whey isolate | 27 g per scoop"), "سطر لكل صنف: الاسم | التفصيل."),
        sw("on", "مختار عند الفتح", false),
      ], [
        { code: "mass", label: L("بناء عضل", "Build muscle"), name: L("ستاك الضخامة", "Mass stack"), factor: "2", meals: "4", price_factor: "1.13", food_share: "0.55", bars: "90,85,45", on: true, text: L("هدفك زيادة الكتلة العضلية مع أقل زيادة دهنية ممكنة. الأساس بروتين مرتفع موزّع على ٤ وجبات، وكرياتين يومي ثابت حتى في أيام الراحة.", "The goal is muscle with as little fat as possible. High protein across 4 meals, and creatine every day including rest days."), note: L("في أيام الراحة خفّض الكمية بمقدار سكوب واحد وأبقِ الكرياتين كما هو.", "On rest days drop one scoop and keep the creatine."), lines: L("واي آيزوليت ٢ كغ | ٢٧ غ لكل سكوب\nكرياتين مونوهيدرات | ٥ غ يومياً\nقبل التمرين | ١٨٠ ملغ كافيين\nمغنيسيوم جلايسينات | للنوم والاستشفاء\nأوميغا ٣ مركّز | ١٠٠٠ ملغ EPA+DHA", "Whey isolate 2 kg | 27 g per scoop\nCreatine monohydrate | 5 g daily\nPre-workout | 180 mg caffeine\nMagnesium glycinate | sleep and recovery\nOmega-3 | 1,000 mg EPA+DHA") },
        { code: "cut", label: L("خسارة دهون", "Lose fat"), name: L("ستاك التنشيف", "Cut stack"), factor: "2.2", meals: "5", price_factor: "1.08", food_share: "0.5", bars: "100,70,60", on: false, text: L("الهدف الحفاظ على العضل مع نقص سعرات. نرفع البروتين ونوزّعه على ٥ وجبات.", "Keep muscle while calories drop. Protein goes up, spread across 5 meals."), note: L("اشرب سكوباً بعد التمرين مباشرة وآخر قبل النوم.", "One scoop right after training and one before sleep."), lines: L("واي آيزوليت ٢ كغ | لاكتوز أقل من ١٪\nكرياتين مونوهيدرات | ٥ غ يومياً\nقبل التمرين | ٢٠٠ ملغ كافيين\nأوميغا ٣ مركّز | دعم الاستشفاء\nمغنيسيوم جلايسينات | جودة النوم", "Whey isolate 2 kg | lactose under 1%\nCreatine monohydrate | 5 g daily\nPre-workout | 200 mg caffeine\nOmega-3 | recovery\nMagnesium glycinate | sleep") },
        { code: "endu", label: L("قدرة تحمّل", "Endurance"), name: L("ستاك التحمّل", "Endurance stack"), factor: "1.6", meals: "4", price_factor: "1.02", food_share: "0.6", bars: "72,60,55", on: false, text: L("للجري والدراجة والرياضات الطويلة. التركيز على الكهارل والاستشفاء بين الجلسات.", "For running, cycling, and long sessions. The focus is electrolytes and recovery between sessions."), note: L("قسّم الكرياتين إلى جرعتين في الجلسات الأطول من ٩٠ دقيقة.", "Split creatine into two doses on sessions longer than 90 minutes."), lines: L("واي آيزوليت ١ كغ | سريع الامتصاص\nكهارل بلا سكر | صوديوم وبوتاسيوم\nكرياتين مونوهيدرات | ٥ غ يومياً\nأوميغا ٣ مركّز | دعم المفاصل\nفيتامين د٣ + ك٢ | للجلسات الداخلية", "Whey isolate 1 kg | fast absorbing\nSugar-free electrolytes | sodium and potassium\nCreatine monohydrate | 5 g daily\nOmega-3 | joints\nVitamin D3 + K2 | indoor sessions") },
        { code: "fit", label: L("لياقة عامة", "General fitness"), name: L("ستاك اللياقة", "Fitness stack"), factor: "1.4", meals: "3", price_factor: "1", food_share: "0.65", bars: "62,55,30", on: false, text: L("لمن يتدرّب ٣ أيام أسبوعياً ويريد الأساسيات فقط: بروتين يكمل نقص الطعام، ومكمّلان يدعمان الاستشفاء.", "For three days a week: protein to cover what food misses, plus two supplements for recovery."), note: L("ابدأ بالبروتين والكرياتين فقط لأربعة أسابيع.", "Start with protein and creatine only for four weeks."), lines: L("واي آيزوليت ١ كغ | ٢٧ غ لكل سكوب\nكرياتين مونوهيدرات | ٥ غ يومياً\nمغنيسيوم جلايسينات | ٤٠٠ ملغ\nأوميغا ٣ مركّز | ١٠٠٠ ملغ\nشيكر معدني | ٧٠٠ مل", "Whey isolate 1 kg | 27 g per scoop\nCreatine monohydrate | 5 g daily\nMagnesium glycinate | 400 mg\nOmega-3 | 1,000 mg\nMetal shaker | 700 ml") },
      ], 1, 6),
      collection("levels", "مستوى", [
        plain("code", "الرمز", "int"),
        text("label", "الاسم", L("متوسط", "Intermediate")),
        plain("days", "أيام التدريب", "4"),
        plain("take", "عدد أصناف الستاك", "4"),
        plain("multiplier", "معامل السعر", "1.62"),
        sw("on", "مختار عند الفتح", false),
      ], [
        { code: "beg", label: L("مبتدئ", "Beginner"), days: "3", take: "2", multiplier: "1", on: false },
        { code: "int", label: L("متوسط", "Intermediate"), days: "4", take: "4", multiplier: "1.62", on: true },
        { code: "adv", label: L("متقدم", "Advanced"), days: "6", take: "5", multiplier: "2.04", on: false },
      ], 1, 4),
      collection("flavors", "نكهة", [
        text("label", "الاسم", L("شوكولاتة", "Chocolate")),
        sw("available", "متوفرة", true),
        sw("on", "مختارة عند الفتح", false),
      ], [
        { label: L("شوكولاتة", "Chocolate"), available: true, on: true },
        { label: L("فانيلا", "Vanilla"), available: true, on: false },
        { label: L("قهوة", "Coffee"), available: true, on: false },
        { label: L("موز — نفد", "Banana — sold out"), available: false, on: false },
      ], 0, 6),
      line("pb-buy"),
      text("primary_label", "نص زر السلة", L("أضف الستاك إلى السلة", "Add the stack to the cart")),
      url("primary_url", "رابط زر السلة", "", buyHint),
      text("secondary_label", "نص الزر الثاني", L("أرسل الخطة لي", "Send me the plan")),
      url("secondary_url", "رابط الزر الثاني", "#faq"),
      area("disclaimer", "تنبيه", L("الأرقام تقديرية لأهداف التدريب العام، وليست بديلاً عن استشارة أخصائي تغذية رياضية أو طبيب.", "The numbers are estimates for general training. They are not a substitute for a sports dietitian or a doctor.")),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "صف الضمانات",
    icon: "sicon-star2",
    name: "proof-row",
    key: "5867d91a-b54a-4aa6-9f48-d8f6d4705071",
    image: "",
    props: { "min-height": "280px" },
    fields: [
      text("kicker", "سطر صغير", L("٠٤ / ضماناتنا", "04 / our guarantees")),
      text("title", "العنوان", L("أربعة أشياء لا نتهاون فيها", "Four things we do not bend on")),
      collection("items", "ضمان", [
        text("mark", "الرمز", L("🧪", "🧪"), { max: 8 }),
        text("title", "العنوان", L("تقرير مختبر لكل دفعة", "A lab report for every batch")),
        text("text", "السطر", L("بمسح رمز العلبة", "scan the code on the tub"), { max: 80 }),
      ], [
        { mark: L("🧪", "🧪"), title: L("تقرير مختبر لكل دفعة", "A lab report for every batch"), text: L("بمسح رمز العلبة", "scan the code on the tub") },
        { mark: L("📋", "📋"), title: L("جرعات معلنة بالملغرام", "Doses declared in milligrams"), text: L("بلا خلطات سرية", "no secret blends") },
        { mark: L("↺", "↺"), title: L("استرجاع ١٤ يوم", "14-day returns"), text: L("حتى لو فُتحت العلبة", "even if the tub is open") },
        { mark: L("📞", "📞"), title: L("مدرّب مرافق", "A coach alongside"), text: L("متابعة مجانية أول شهر", "a free first month of follow-up") },
      ], 1, 4),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "عدّاد العرض",
    icon: "sicon-timer",
    name: "offer-clock",
    key: "03cf374c-5038-4a0b-8912-13a3c3118bc3",
    image: "",
    props: { "min-height": "220px" },
    fields: [
      text("title", "العنوان", L("أسبوع الستاكات", "Stack week")),
      area("text", "النص", L("خصم إضافي ١٥٪ على كل الخطط المحسوبة، مع شيكر معدني وجدول جرعات مطبوع يصل مع الطلب.", "An extra 15% off every calculated plan, with a metal shaker and a printed dose card in the box.")),
      text("code_label", "عبارة الكود", L("كود الخصم", "Discount code"), { max: 40 }),
      text("code", "الكود", L("POWER15", "POWER15"), { max: 24 }),
      num("hours", "مدة العداد بالساعات", 57, 1, 240, "يبدأ من أول زيارة في المتصفح، ولا يُعاد عند تحديث الصفحة."),
      text("day_label", "اليوم", L("يوم", "days"), { max: 20 }),
      text("hour_label", "الساعة", L("ساعة", "hours"), { max: 20 }),
      text("minute_label", "الدقيقة", L("دقيقة", "minutes"), { max: 20 }),
      text("second_label", "الثانية", L("ثانية", "seconds"), { max: 20 }),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "النتائج والآراء",
    icon: "sicon-chat",
    name: "result-notes",
    key: "f5b88a43-b476-416e-9f58-4fedddc2ffae",
    image: "",
    props: { "min-height": "640px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "reviews"),
      text("kicker", "سطر صغير", L("٠٥ / النتائج", "05 / results")),
      text("title", "العنوان", L("من استخدم الخطة فعلاً", "People who actually used the plan")),
      collection("stats", "رقم", [
        text("value", "الرقم", L("١٤٢٠٠+", "14,200+"), { max: 20 }),
        text("label", "الوصف", L("خطة مبنية", "plans built"), { max: 40 }),
      ], [
        { value: L("١٤٢٠٠+", "14,200+"), label: L("خطة مبنية", "plans built") },
        { value: L("٩٨.٤٪", "98.4%"), label: L("نقاء البروتين المُقاس", "measured protein purity") },
        { value: L("٤.٨", "4.8"), label: L("تقييم العملاء من ٥", "customer rating out of 5") },
        { value: L("٠", "0"), label: L("مواد محظورة", "banned substances") },
      ], 0, 4),
      collection("notes", "رأي", [
        text("stars", "النجوم", L("★★★★★", "★★★★★"), { max: 12 }),
        area("quote", "النص", L("أول مرة أعرف كم غرام بروتين أحتاج.", "The first time I knew the protein in grams.")),
        text("name", "الاسم", L("محمد الزهراني", "Mohammed Al-Zahrani")),
        text("meta", "السطر الصغير", L("الرياض · ستاك الضخامة", "Riyadh · mass stack"), { max: 80 }),
        text("initial", "الحرف", L("م", "M"), { max: 4 }),
      ], [
        { stars: L("★★★★★", "★★★★★"), quote: L("أول مرة أعرف كم غرام بروتين أحتاج بالضبط بدل التخمين. زدت ٤ كيلو كتلة في ١١ أسبوعاً والدهون تقريباً ثابتة.", "The first time I knew the exact grams of protein instead of guessing. I added 4 kg of mass in 11 weeks and fat stayed about the same."), name: L("محمد الزهراني", "Mohammed Al-Zahrani"), meta: L("الرياض · ستاك الضخامة", "Riyadh · mass stack"), initial: L("م", "M") },
        { stars: L("★★★★★", "★★★★★"), quote: L("التقرير المختبري موجود فعلاً وبرقم الدفعة. فحصته قبل ما أشتري وهذا اللي خلاني أثق.", "The lab report is really there, with the batch number. I checked it before buying, and that is what made me trust it."), name: L("عبدالله الدوسري", "Abdullah Al-Dosari"), meta: L("جدة · واي آيزوليت", "Jeddah · whey isolate"), initial: L("ع", "A") },
        { stars: L("★★★★☆", "★★★★☆"), quote: L("قبل التمرين قوي وجرعاته واضحة. حسمت نجمة لأن طعم القهوة أقوى مما توقعت.", "The pre-workout is strong and the doses are clear. I dropped a star because the coffee flavor is stronger than I expected."), name: L("فهد العتيبي", "Fahad Al-Otaibi"), meta: L("الدمام · قبل التمرين", "Dammam · pre-workout"), initial: L("ف", "F") },
        { stars: L("★★★★★", "★★★★★"), quote: L("اخترت خطة خسارة الدهون وكان البروتين مرتفعاً بشكل مريح. نزلت ٦ كيلو مع احتفاظي بأرقام الرفع.", "I chose the fat-loss plan and the protein was comfortably high. I dropped 6 kg and kept my lifting numbers."), name: L("سارة المالكي", "Sara Al-Malki"), meta: L("الخبر · ستاك التنشيف", "Khobar · cut stack"), initial: L("س", "S") },
        { stars: L("★★★★★", "★★★★★"), quote: L("أنا لاعب نصف ماراثون والفحص المطابق لقائمة المنشطات نقطة حسّاسة لي. وجدته موثّقاً وهذا نادر محلياً.", "I run the half marathon and the banned-list screen matters to me. It was documented, which is rare locally."), name: L("تركي الحربي", "Turki Al-Harbi"), meta: L("أبها · قدرة تحمّل", "Abha · endurance"), initial: L("ت", "T") },
        { stars: L("★★★★★", "★★★★★"), quote: L("المدرّب المرافق راجع جدولي مرتين بالشهر الأول مجاناً. خدمة ما توقعتها من متجر مكملات.", "The coach reviewed my plan twice in the first month for free. I did not expect that from a supplement store."), name: L("راكان القحطاني", "Rakan Al-Qahtani"), meta: L("بريدة · لياقة عامة", "Buraidah · general fitness"), initial: L("ر", "R") },
      ], 1, 8),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "أسئلة قبل الستاك",
    icon: "sicon-help",
    name: "ask-list",
    key: "191507b1-8464-404e-a222-13fb248429ad",
    image: "",
    props: { "min-height": "420px" },
    fields: [
      plain("anchor", "معرّف القسم في الرابط", "faq"),
      text("kicker", "سطر صغير", L("٠٦ / الأسئلة", "06 / questions")),
      text("title", "العنوان", L("أسئلة قبل أول ستاك", "Questions before the first stack")),
      collection("items", "سؤال", [
        text("q", "السؤال", L("كيف تُحسب كمية البروتين؟", "How is the protein amount calculated?")),
        area("a", "الجواب", L("نضرب وزنك بمعامل الهدف ثم نحدد عدد السكوبات.", "We multiply your weight by the goal factor, then set the scoops.")),
      ], [
        { q: L("كيف تُحسب كمية البروتين في الخطة؟", "How is the protein in the plan calculated?"), a: L("نضرب وزنك بمعامل يختلف حسب الهدف: ٢ غ لكل كيلو لبناء العضل، ٢.٢ غ للتنشيف، ١.٦ غ لقدرة التحمّل، و١.٤ غ للياقة العامة. ثم نطرح تقديراً ما يأتي من الطعام لنحدد عدد السكوبات.", "We multiply your weight by a factor: 2 g per kilo to build muscle, 2.2 g to cut, 1.6 g for endurance, and 1.4 g for general fitness. Then we subtract an estimate of food protein to set the scoops.") },
        { q: L("هل الكرياتين آمن ويحتاج فترة تحميل؟", "Is creatine safe, and does it need a loading phase?"), a: L("الكرياتين مونوهيدرات من أكثر المكملات المدروسة. ٥ غ يومياً تصل للتشبّع خلال ٣–٤ أسابيع دون مرحلة تحميل، وفي أيام الراحة أيضاً.", "Creatine monohydrate is among the most studied supplements. 5 g a day saturates in 3–4 weeks with no loading phase, including rest days.") },
        { q: L("كيف أتحقق من تقرير المختبر؟", "How do I check the lab report?"), a: L("على كل علبة رقم دفعة ورمز. امسحه فيُفتح تقرير يعرض نسبة البروتين المقاسة والرطوبة والمعادن الثقيلة.", "Every tub has a batch number and a code. Scan it and the report opens with measured protein, moisture, and heavy metals.") },
        { q: L("هل المنتجات مناسبة للرياضيين المسجّلين؟", "Are the products suitable for registered athletes?"), a: L("كل دفعة تُفحَص مقابل قائمة المواد المحظورة. يبقى على الرياضي إبلاغ اتحاده والاحتفاظ بتقارير الدفعات.", "Every batch is screened against the banned list. The athlete still tells their federation and keeps the batch reports.") },
        { q: L("ماذا لو لم تناسبني النكهة؟", "What if the flavor does not suit me?"), a: L("خلال ١٤ يوماً نستبدل العلبة بنكهة أخرى حتى لو فُتحت واستُخدم منها جرعتان. هذا الضمان للعلبة الأولى من كل منتج.", "Within 14 days we swap the tub for another flavor even if it is open and two servings are gone. The guarantee is for the first tub of each product.") },
      ], 1, 8),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "دعوة الختام",
    icon: "sicon-megaphone",
    name: "close-invite",
    key: "d2e6ab79-092e-4cb5-8757-91100ff0773c",
    image: "",
    props: { "min-height": "520px" },
    fields: [
      collection("cards", "بطاقة", [
        text("title", "العنوان", L("اشتراك شهري ذكي", "A smarter monthly delivery")),
        area("text", "النص", L("تصلك كميتك المحسوبة قبل نفادها بأسبوع.", "Your calculated amount arrives a week before you run out.")),
        text("label", "نص الرابط", L("فعّل الاشتراك", "Start the delivery")),
        url("url", "الرابط", "#plan"),
      ], [
        { title: L("اشتراك شهري ذكي", "A smarter monthly delivery"), text: L("تصلك كميتك المحسوبة تلقائياً قبل نفادها بأسبوع، مع خصم ١٢٪ ثابت وإيقاف فوري في أي وقت.", "Your calculated amount arrives a week before you run out, with a standing 12% off and a stop any time."), label: L("فعّل الاشتراك", "Start the delivery"), url: "#plan" },
        { title: L("جلسة مع مدرّب معتمد", "A session with a certified coach"), text: L("٣٠ دقيقة لمراجعة جدولك وجرعاتك، مجانية مع أول طلب فوق ٤٠٠ ر.س.", "30 minutes to review your plan and doses, free with a first order over SAR 400."), label: L("احجز الجلسة", "Book the session"), url: "#faq" },
      ], 0, 2),
      collection("perks", "ميزة", [
        text("mark", "الرمز", L("🚚", "🚚"), { max: 8 }),
        text("title", "العنوان", L("شحن مجاني فوق ٢٠٠ ر.س", "Free shipping over SAR 200")),
        text("text", "السطر", L("١–٣ أيام عمل", "1–3 business days"), { max: 60 }),
      ], [
        { mark: L("🚚", "🚚"), title: L("شحن مجاني فوق ٢٠٠ ر.س", "Free shipping over SAR 200"), text: L("١–٣ أيام عمل", "1–3 business days") },
        { mark: L("🧪", "🧪"), title: L("تقرير مختبر مرفق", "A lab report included"), text: L("برقم دفعة قابل للتحقق", "a batch number you can check") },
        { mark: L("↺", "↺"), title: L("استرجاع ١٤ يوم", "14-day returns"), text: L("استبدال نكهة مجاني", "a free flavor swap") },
        { mark: L("🥤", "🥤"), title: L("شيكر هدية", "A shaker on us"), text: L("مع كل ستاك كامل", "with every full stack") },
      ], 0, 4),
      text("title", "عنوان الدعوة", L("توقّف عن التخمين. ابنِ خطتك.", "Stop guessing. Build the plan.")),
      area("text", "النص", L("ثلاثون ثانية تفصلك عن جرعة محسوبة بوزنك وهدفك، وستاك لا يحتوي صنفاً واحداً بلا دليل.", "Thirty seconds from a dose set by your weight and goal, and a stack with nothing in it that lacks evidence.")),
      text("primary_label", "نص الزر الأساسي", L("ابنِ خطتي", "Build my plan")),
      url("primary_url", "رابط الزر الأساسي", "#plan", buyHint),
      text("secondary_label", "نص الزر الثاني", L("اقرأ النتائج", "Read the results")),
      url("secondary_url", "رابط الزر الثاني", "#reviews"),
      color("bg_color", "لون الخلفية"),
    ],
  },
  {
    title: "فوتر الصفحة",
    icon: "sicon-footer",
    name: "page-footer",
    key: "10e57afc-c780-45b7-9d01-16e0828de04d",
    image: "",
    props: { "min-height": "280px" },
    fields: [
      text("announce", "الشريط الإعلاني", L("جرعات معلنة · تقرير مختبر مع كل دفعة · استرجاع ١٤ يوم", "Declared doses · a lab report with every batch · 14-day returns"), { desc: "يظهر فوق الفوتر. اتركه فارغاً لإخفاء الشريط." }),
      drop("announce_mode", "حركة الشريط", [["move", "متحرك", KEY.annMove], ["still", "ثابت", KEY.annStill]], "move", "المتحرك يمرّ الجملة باستمرار. الثابت يُبقيها في الوسط."),
      line("ft-announce"),
      image("logo", "شعار", "المقاس المقترح 280×80 بكسل. اتركه فارغاً ليظهر الاسم."),
      image("logo_dark", "شعار للوضع الداكن", "يظهر عندما تكون الصفحة داكنة."),
      text("brand", "الاسم", L("قوّة", "Quwa")),
      text("badge", "حرف الشارة", L("ق", "Q"), { max: 4 }),
      area("about", "نبذة", L("متجر سعودي للمكملات الرياضية يبيع ما له دليل فقط، بجرعات معلنة وتقارير مختبر مستقلة لكل دفعة. مستودعنا في الرياض.", "A Saudi sports-supplement store that sells only what has evidence, with declared doses and an independent lab report for every batch. The warehouse is in Riyadh.")),
      collection("payments", "وسيلة دفع", [
        text("label", "الاسم", L("مدى", "mada"), { max: 40 }),
      ], [
        { label: L("مدى", "mada") },
        { label: L("Visa", "Visa") },
        { label: L("Mastercard", "Mastercard") },
        { label: L("Apple Pay", "Apple Pay") },
        { label: L("تابي", "Tabby") },
        { label: L("تمارا", "Tamara") },
        { label: L("الدفع عند الاستلام", "Cash on delivery") },
      ], 0, 8),
      line("ft-cols"),
      text("col1_title", "عنوان العمود الأول", L("المنتجات", "Products")),
      collection("col1", "رابط", [
        text("label", "النص", L("واي آيزوليت", "Whey isolate")),
        url("url", "الرابط", "#stacks"),
      ], [
        { label: L("واي آيزوليت", "Whey isolate"), url: "#stacks" },
        { label: L("كرياتين", "Creatine"), url: "#stacks" },
        { label: L("قبل التمرين", "Pre-workout"), url: "#stacks" },
        { label: L("أوميغا ٣", "Omega-3"), url: "#stacks" },
      ], 0, 6),
      text("col2_title", "عنوان العمود الثاني", L("المساعدة", "Help")),
      collection("col2", "رابط", [
        text("label", "النص", L("احسب خطتي", "Calculate my plan")),
        url("url", "الرابط", "#plan"),
      ], [
        { label: L("احسب خطتي", "Calculate my plan"), url: "#plan" },
        { label: L("تقارير المختبر", "Lab reports"), url: "#labs" },
        { label: L("سياسة الاسترجاع", "Returns"), url: "#faq" },
        { label: L("الأسئلة", "Questions"), url: "#faq" },
      ], 0, 6),
      text("col3_title", "عنوان العمود الثالث", L("تواصل", "Contact")),
      collection("col3", "رابط", [
        text("label", "النص", L("واتساب المتجر", "Store WhatsApp")),
        url("url", "الرابط", "#"),
      ], [
        { label: L("واتساب المتجر", "Store WhatsApp"), url: "#" },
        { label: L("حجز جلسة مدرّب", "Book a coach"), url: "#faq" },
        { label: L("الاشتراك الشهري", "Monthly delivery"), url: "#plan" },
      ], 0, 6),
      line("ft-base"),
      sw("show_top", "زر العودة للأعلى", true),
      text("top_label", "نص زر العودة", L("للأعلى", "Back to top"), { max: 40 }),
      text("copyright", "سطر الحقوق", L("© ٢٠٢٦ قوّة · جميع الحقوق محفوظة", "© 2026 Quwa")),
      text("legal", "السجل والرقم الضريبي", L("س.ت ١٠١٠٥٥٩٣٠٤ · الرقم الضريبي ٣١٠٥٥٩٣٠٤٠٠٠٠٣", "CR 1010559304 · VAT 310559304000003")),
      color("bg_color", "لون الخلفية"),
    ],
  },
];

for (const component of components) component.fields.push(scheme());

const templates = [
  {
    name: "quwa",
    id: "22ffe254-4cb9-4d5a-92e3-444e2115ecae",
    is_default: true,
    primary_color: "#d4ff3f",
    order: ["page-bar", "volt-hero", "ticker-line", "stack-grid", "lab-steps", "plan-board", "proof-row", "offer-clock", "result-notes", "ask-list", "close-invite", "page-footer"],
  },
  {
    name: "khutta",
    id: "234185c0-ee92-44de-87f5-cc8a60b30091",
    is_default: false,
    primary_color: "#08090a",
    order: ["page-bar", "plan-board", "offer-clock", "ask-list", "close-invite", "page-footer"],
  },
];

const bundlePath = new URL("../twilight-bundle.json", import.meta.url);
let previous = { templates: [] };
if (fs.existsSync(bundlePath)) previous = JSON.parse(fs.readFileSync(bundlePath, "utf8"));
const previousTemplates = new Map((previous.templates || []).map((item) => [item.path, item]));

const bundle = {
  name: { ar: "مجموعة الرياضة", en: "Sports Collection" },
  description: {
    ar: "صفحتان لمكملات رياضية. قوّة تعرض الخطة والمنتجات والتحاليل، وخطة تختصر الطريق إلى الحاسبة والعرض.",
    en: "Two landing pages for sports supplements. Quwa shows the plan, the products, and the lab steps. Khutta goes straight to the calculator and the offer.",
  },
  author_email: "sajispprt@gmail.com",
  support_url: "https://github.com/Ashaheen892/tw-sports-landing",
  repository: "https://github.com/Ashaheen892/tw-sports-landing",
  features: ["landing-page-templates"],
  components,
  templates: templates.map((template) => {
    const path = `templates.${template.name}`;
    const saved = previousTemplates.get(path) || {};
    return {
      id: template.id,
      path,
      category_id: saved.category_id || "",
      primary_color: template.primary_color,
      thumbnail: saved.thumbnail || "",
      is_default: template.is_default,
      ...(saved.public_preview_url ? { public_preview_url: saved.public_preview_url } : {}),
    };
  }),
};

fs.writeFileSync(bundlePath, `${JSON.stringify(bundle, null, 4)}\n`);
fs.mkdirSync(new URL("../templates/", import.meta.url), { recursive: true });
fs.mkdirSync(new URL("../public/", import.meta.url), { recursive: true });
const byName = new Map(components.map((component) => [component.name, component]));
for (const template of templates) {
  const list = template.order.map((name) => structuredClone(byName.get(name)));
  fs.writeFileSync(new URL(`../templates/${template.name}.json`, import.meta.url), `${JSON.stringify({ id: template.id, components: list }, null, 2)}\n`);
}
fs.writeFileSync(new URL("../public/twilight-bundle.json", import.meta.url), `${JSON.stringify(bundle, null, 4)}\n`);
console.log("pages:", templates.map((template) => `${template.name}(${template.order.length})`).join(", "));
console.log("sections:", components.map((component) => component.name).join(", "));
