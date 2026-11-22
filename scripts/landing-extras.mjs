const SPEC = {
  schemeMode: "after",
  hasTop: true,
  waBg: "#121500",
  waInk: "#d4ff3f",
  topBg: "#d4ff3f",
  topInk: "#121500",
  waMessage: ["أبي أسأل عن الجرعة وتقرير المختبر", "I want to ask about the dose and the lab report"],
  topLabel: ["للأعلى", "Back to top"],
  phone: "01153958512",
  email: "hello@saji-tech.com",
  partnerMark: false,
  stat: {
    key: "df8ae246-37d1-4efc-8d0d-0bc5e713c5d4",
    kicker: ["المختبر", "The lab"],
    title: ["أرقام الدفعة", "Batch numbers"],
    items: [
      [["١٠٠٪", "100%"], ["دفعات مفحوصة", "Tested batches"]],
      [["١٤ يوم", "14 days"], ["استرجاع", "Returns"]],
      [["٣ نكهات", "3 flavors"], ["في الخطة", "In the plan"]],
    ],
  },
  brand: {
    key: "e09bf357-48e2-4f0d-9e1e-1cd6f824d6e5",
    kicker: ["الفحص", "Testing"],
    title: ["اعتمادات الدفعة", "Batch marks"],
    items: [
      [["آيزو ١٧٠٢٥", "ISO 17025"], ["مختبر معتمد", "Accredited lab"]],
      [["فحص المعادن", "Heavy metals"], ["كل دفعة", "Every batch"]],
      [["خالٍ من المنشطات", "Banned-substance free"], ["تقرير معلن", "Published report"]],
      [["تحليل الدفعة", "Batch analysis"], ["رقم ظاهر", "A visible number"]],
    ],
  },
  partner: {
    key: "f1ac0468-59f3-4a1e-8f2f-2de7a935e7f6",
    kicker: ["الخطة", "The plan"],
    title: ["شركاء النجاح", "Partners"],
    items: [
      [["نادي القوة", "Quwa club"], ["برامج التمرين", "Training programs"]],
      [["مختبر الدفعة", "Batch lab"], ["تقارير التحليل", "Analysis reports"]],
      [["مدرب الخطة", "Plan coach"], ["حساب الجرعة", "Dose calculation"]],
    ],
  },
  contact: {
    key: "02bd1579-6a04-4b2f-9a30-3ef8ba46f807",
    kicker: ["الجرعة", "The dose"],
    title: ["تواصل سريع", "Quick contact"],
    text: ["اسأل عن الجرعة أو تقرير المختبر قبل الاشتراك.", "Ask about the dose or the lab report before you subscribe."],
    phoneText: ["اتصل بالمختبر", "Call the lab"],
    waText: ["اسأل عن الجرعة", "Ask about the dose"],
  },
};

export function applyLandingExtras(ctx) {
  const { components, catalog, templates, L, text, color, sw, drop, line, collection, image, url, scheme, KEY } = ctx;
  const spec = SPEC;
  const footer = components.find((item) => item.name === "volt-footer");
  if (footer && !footer.fields.some((field) => field.id === "show_whatsapp")) {
    const sides = [["start", "بداية السطر", KEY.dockStart], ["end", "نهاية السطر", KEY.dockEnd]];
    const dock = [
      line("dock-line"),
      sw("show_whatsapp", "زر واتساب ثابت", true, "يبقى ظاهراً أثناء تمرير الصفحة."),
      text("whatsapp_number", "رقم واتساب", "201153958512", { multilang: false, desc: "بالصيغة الدولية بدون + أو مسافات." }),
      text("whatsapp_message", "رسالة واتساب الجاهزة", L(...spec.waMessage)),
      color("whatsapp_bg", "خلفية زر واتساب", spec.waBg),
      color("whatsapp_ink", "لون أيقونة واتساب", spec.waInk),
      drop("whatsapp_side", "جهة زر واتساب", sides, "start", "إذا اخترت الجهة نفسها لزر الرجوع، يُرفع واتساب فوقه حتى لا يتداخلا."),
    ];
    if (!spec.hasTop) {
      dock.push(
        sw("show_top", "زر العودة للأعلى", true, "يبقى ثابتاً أثناء التمرير، في الجهة المقابلة لواتساب."),
        text("top_label", "نص زر العودة", L(...spec.topLabel), { max: 24 }),
      );
    }
    dock.push(
      color("top_bg", "خلفية زر العودة", spec.topBg),
      color("top_ink", "لون زر العودة", spec.topInk),
      drop("top_side", "جهة زر العودة", sides, "end", "الافتراضي نهاية السطر، مقابل زر واتساب."),
    );
    const at = footer.fields.findIndex((field) => field.id === "bg_color");
    footer.fields.splice(at < 0 ? footer.fields.length : at, 0, ...dock);
  }

  if (!components.some((item) => item.name === "volt-stats")) {
    const made = blocks({ L, text, color, collection, image, url, scheme, sw, spec });
    const index = components.findIndex((item) => item.name === "volt-footer");
    components.splice(index < 0 ? components.length : index, 0, ...made);
    if (spec.schemeMode === "after") made.forEach((item) => item.fields.push(scheme()));
  }

  if (Array.isArray(catalog)) {
    const names = ["volt-stats", "proof-marks", "team-board", "lab-line"];
    const at = catalog.indexOf("volt-footer");
    names.slice().reverse().forEach((name) => {
      if (!catalog.includes(name)) catalog.splice(at < 0 ? catalog.length : at, 0, name);
    });
  }

  const required = ["volt-stats", "proof-marks", "team-board", "lab-line"];
  for (const template of templates) {
    const next = [];
    let added = false;
    for (const entry of template.order) {
      const name = Array.isArray(entry) ? entry[0] : entry;
      if (name === "volt-footer" && !added) {
        next.push(...required);
        added = true;
      }
      next.push(entry);
    }
    if (!added) next.push(...required);
    template.order = next;
  }
}

function blocks({ L, text, color, collection, image, url, scheme, sw, spec }) {
  const end = (fields) => {
    fields.push(color("bg_color", "لون الخلفية"));
    if (spec.schemeMode === "field") fields.push(scheme());
    return fields;
  };
  const partnerFields = [
    ...(spec.partnerMark ? [text("mark", "العلامة", L("٢٤", "24"))] : []),
    text("name", "الاسم", L("الشريك", "Partner")),
    text("note", "السطر", L("الدور", "Role")),
  ];
  return [
    {
      title: "لوحة الأرقام (إحصائيات)",
      icon: "sicon-calculator",
      name: "volt-stats",
      key: spec.stat.key,
      image: "",
      props: { "min-height": "180px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.stat.kicker)),
        text("title", "العنوان", L(...spec.stat.title)),
        text("subtitle", "السطر تحت العنوان", L("", "")),
        sw("count_up", "حركة العد", true, "الأرقام تعدّ من الصفر أول ما يظهر القسم. النص حول الرقم يبقى كما هو."),
        collection("items", "رقم", [
          text("value", "الرقم", L("١٢", "12")),
          text("label", "الوصف", L("وصف الرقم", "What the number means")),
        ], spec.stat.items.map(([value, label]) => ({ value: L(...value), label: L(...label) })), 1, 4),
      ]),
    },
    {
      title: "شارات الاعتماد (الماركات)",
      icon: "sicon-star2",
      name: "proof-marks",
      key: spec.brand.key,
      image: "",
      props: { "min-height": "160px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.brand.kicker)),
        text("title", "العنوان", L(...spec.brand.title)),
        text("subtitle", "السطر تحت العنوان", L("", "")),
        collection("items", "ماركة", [
          image("image", "الشعار", "اختياري. المقاس المقترح 240×80 بكسل بخلفية شفافة."),
          text("name", "الاسم", L("الماركة", "Brand")),
          text("note", "السطر", L("الخامة", "Material")),
          url("url", "الرابط", ""),
        ], spec.brand.items.map(([name, note]) => ({ image: "", name: L(...name), note: L(...note), url: "" })), 1, 8),
      ]),
    },
    {
      title: "لوحة الفريق (شركاء النجاح)",
      icon: "sicon-store",
      name: "team-board",
      key: spec.partner.key,
      image: "",
      props: { "min-height": "180px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.partner.kicker)),
        text("title", "العنوان", L(...spec.partner.title)),
        text("subtitle", "السطر تحت العنوان", L("", "")),
        collection("items", "شريك", partnerFields, spec.partner.items.map((row) => (
          spec.partnerMark
            ? { mark: L(...row[0]), name: L(...row[1]), note: L(...row[2]) }
            : { name: L(...row[0]), note: L(...row[1]) }
        )), 1, 8),
      ]),
    },
    {
      title: "خط المختبر (تواصل سريع)",
      icon: "sicon-link",
      name: "lab-line",
      key: spec.contact.key,
      image: "",
      props: { "min-height": "160px" },
      fields: end([
        text("kicker", "السطر الصغير", L(...spec.contact.kicker)),
        text("title", "العنوان", L(...spec.contact.title)),
        text("subtitle", "السطر تحت العنوان", L(...(spec.contact.text || ["", ""]))),
        text("text", "جملة القسم", L(...(spec.contact.text || ["", ""]))),
        text("phone_label", "عنوان الاتصال", L("اتصال", "Call")),
        text("phone", "رقم الاتصال", spec.phone, { multilang: false }),
        text("phone_text", "نص الاتصال", L(...spec.contact.phoneText)),
        text("whatsapp_label", "عنوان واتساب", L("واتساب", "WhatsApp")),
        text("whatsapp", "رقم واتساب", "201153958512", { multilang: false }),
        text("whatsapp_text", "نص واتساب", L(...spec.contact.waText)),
        text("whatsapp_message", "الرسالة الجاهزة", L(...spec.waMessage)),
        text("email_label", "عنوان البريد", L("البريد", "Email")),
        text("email", "البريد", spec.email, { multilang: false }),
      ]),
    },
  ];
}
