"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { extractJson } from "@/lib/extract-json";
import {
  FileDown,
  Check,
  Compass,
  Loader2,
  Upload,
  Pencil,
  Copy,
  CopyCheck,
  RotateCcw,
  Radar,
  Shield,
  Search,
  Wrench,
  Target,
  Map as MapIcon,
  ArrowRight as ArrowRightIcon,
} from "lucide-react";

const COLORS = {
  bg: "#F5F1E8",
  panel: "#FFFFFF",
  ink: "#1E2A2F",
  inkSoft: "#4B5A5E",
  pine: "#2F6B57",
  pineDark: "#204A3D",
  amber: "#C9863D",
  border: "#DCD5C4",
  danger: "#A6432F",
};

// ---------- i18n ----------
const STRINGS = {
  ar: {
    dir: "rtl",
    appTitle: "مرشدك المهني",
    startOver: "ابدأ من جديد",
    steps: { input: "المعلومات", profile: "ملفك الشخصي", result: "النتيجة" },
    inputHeading: "خلينا نبدأ من وين أنت الحين",
    inputSub: "ارفع سيرتك الذاتية، أو اكتب وضعك المهني الحالي بنفسك.",
    tabUpload: "رفع سيرة ذاتية",
    tabWrite: "أكتب بنفسي",
    uploadLabel: "PDF أو صورة أو ملف Word (docx)",
    uploadPlaceholder: "اضغط لاختيار ملف",
    privacyNote: "هذه أداة تجريبية للتعلم — لا تُخزَّن بياناتك، لكنها تُعالج عبر خدمات AI خارجية.",
    writeLabel: "اكتب مهاراتك، خبرتك، ومجالك الحالي",
    writePlaceholder:
      "مثال: إدارة منتج، بناء منتجات من الصفر، تنسيق فرق، Figma، SQL أساسي. أعمل حالياً في مجال إدارة المنتجات بالقطاع الحكومي.",
    errUnsupportedFile: "صيغة الملف غير مدعومة. استخدم PDF أو صورة أو Word (docx).",
    errFileTooLarge: "حجم الملف كبير. الحد الأقصى 5 ميجابايت.",
    errFileRead: "تعذر قراءة الملف، جرب ملف ثاني أو الصق النص مباشرة.",
    errNoInput: "ارفع ملف أو اكتب نص أول.",
    errAnalyze: "تعذر تحليل المحتوى، حاول مرة ثانية أو الصق النص يدوياً.",
    errScannedPdf: "ملف PDF هذا صورة ممسوحة ضوئياً بدون نص قابل للقراءة. ارفع سيرتك الذاتية كصورة (PNG أو JPG) بدلاً منه، أو الصق النص يدوياً.",
    analyzing: "يحلل...",
    next: "التالي",
    currentFieldLabel: "مجالك الحالي",
    extractedBioLabel: "نبذة مستخرجة",
    edit: "تعديل",
    currentFieldEditLabel: "المجال الحالي",
    keywordsEditLabel: "الكلمات المفتاحية (افصل بينها بفاصلة)",
    save: "حفظ",
    cancel: "إلغاء",
    keywordsLabel: "كلمات مفتاحية",
    whatNow: "وش تحب تسوي الحين؟",
    options: [
      { title: "أي مجال أتنقل له؟", desc: "اكتشف مجالات جديدة مناسبة لمهاراتك" },
      { title: "تطوير أكثر بمجالي الحالي", desc: "خطة تعميق ومهارات متقدمة" },
      { title: "إعادة صياغة سيرتي الذاتية", desc: "نبذة تعريفية محسّنة ونصائح صياغة" },
      { title: "حجز موعد مع منتور", desc: "منتورز حقيقيين مجاناً عبر ADPList" },
      { title: "اختر مسارك بنفسك", desc: "اكتب مجال محدد وابني لك خطة خاصة به" },
    ],
    fieldPickerLabel: "اكتب المجال اللي تفكر فيه",
    fieldPickerPlaceholder: "مثال: Data Analyst",
    noMatch: 'ما فيه اقتراح مطابق، بس تقدر تضغط "جهّز الخطة" وتستخدم اللي كتبته بالضبط.',
    preparePlan: "جهّز الخطة",
    preparingPlan: "يجهّز الخطة...",
    preparingRecs: "يحضّر التوصيات...",
    genericError: "صار خلل، حاول مرة ثانية.",
    backToOptions: "← رجوع للخيارات",
    copied: "تم النسخ",
    copy: "نسخ",
    newFieldsTitle: "مجالات جديدة مناسبة لك",
    deepenTitlePrefix: "خطة تعميق في مجالك الحالي: ",
    resumeTitle: "سيرتك الذاتية بصياغة محسّنة",
    transitionTitlePrefix: "خطة الانتقال إلى: ",
    stepLabel: "الخطوة: ",
    resumeTipsLabel: "نصائح لتحسين السيرة الذاتية",
    strengthsLabel: "نقاط قوتك تجاه هذا الهدف",
    gapsLabel: "الفجوات اللي تحتاج تسدّها",
    actionPlanLabel: "خطة العمل",
    generatePlan: "ولّد لي خطة أسابيع",
    generatingPlan: "يولّد الخطة...",
    weeklyPlanTitle: "خطة الأسابيع",
    weekLabel: "الأسبوع",
    skillLabel: "المهارة: ",
    savePdf: "حفظ PDF",
    retry: "حاول مرة ثانية",
    copyBioLabel: "النبذة:\n",
    copyTipsLabel: "\nنصائح:\n",
    copyStrengthsLabel: "نقاط القوة:\n",
    copyGapsLabel: "\nالفجوات وخطة العمل:\n",
  },
  en: {
    dir: "ltr",
    appTitle: "Career Mentor",
    startOver: "Start Over",
    steps: { input: "Info", profile: "Your Profile", result: "Result" },
    inputHeading: "Let's start with where you are now",
    inputSub: "Upload your resume, or describe your current career situation yourself.",
    tabUpload: "Upload Resume",
    tabWrite: "Write it myself",
    uploadLabel: "PDF, image, or Word file (docx)",
    uploadPlaceholder: "Click to choose a file",
    privacyNote: "This is an experimental learning tool — your data isn't stored, but it is processed by external AI services.",
    writeLabel: "Write your skills, experience, and current field",
    writePlaceholder:
      "Example: Product management, building products from scratch, coordinating teams, Figma, basic SQL. I currently work in product management in the public sector.",
    errUnsupportedFile: "Unsupported file format. Use PDF, an image, or Word (docx).",
    errFileTooLarge: "That file is too large. The maximum is 5 MB.",
    errFileRead: "Couldn't read the file. Try another file or paste the text directly.",
    errNoInput: "Upload a file or write some text first.",
    errAnalyze: "Couldn't analyze the content. Try again or paste the text manually.",
    errScannedPdf: "This PDF is a scanned image with no readable text. Upload your resume as an image (PNG or JPG) instead, or paste the text manually.",
    analyzing: "Analyzing...",
    next: "Next",
    currentFieldLabel: "Your current field",
    extractedBioLabel: "Extracted summary",
    edit: "Edit",
    currentFieldEditLabel: "Current field",
    keywordsEditLabel: "Keywords (comma-separated)",
    save: "Save",
    cancel: "Cancel",
    keywordsLabel: "Keywords",
    whatNow: "What would you like to do now?",
    options: [
      { title: "Which field should I move to?", desc: "Discover new fields that fit your skills" },
      { title: "Grow further in my current field", desc: "A deepening plan and advanced skills" },
      { title: "Rewrite my resume", desc: "An improved bio and writing tips" },
      { title: "Book a session with a mentor", desc: "Real mentors, free, via ADPList" },
      { title: "Choose your own path", desc: "Write a specific field and get a custom plan" },
    ],
    fieldPickerLabel: "Write the field you're considering",
    fieldPickerPlaceholder: "Example: Data Analyst",
    noMatch: 'No matching suggestion, but you can press "Prepare Plan" and use exactly what you typed.',
    preparePlan: "Prepare Plan",
    preparingPlan: "Preparing the plan...",
    preparingRecs: "Preparing recommendations...",
    genericError: "Something went wrong, try again.",
    backToOptions: "← Back to options",
    copied: "Copied",
    copy: "Copy",
    newFieldsTitle: "New fields that fit you",
    deepenTitlePrefix: "Deepening plan for your current field: ",
    resumeTitle: "Your resume, improved",
    transitionTitlePrefix: "Transition plan to: ",
    stepLabel: "Step: ",
    resumeTipsLabel: "Tips to improve your resume",
    strengthsLabel: "Your strengths toward this goal",
    gapsLabel: "Gaps you need to close",
    actionPlanLabel: "Action plan",
    generatePlan: "Generate a weekly plan",
    generatingPlan: "Generating the plan...",
    weeklyPlanTitle: "Weekly plan",
    weekLabel: "Week",
    skillLabel: "Skill: ",
    savePdf: "Save PDF",
    retry: "Try again",
    copyBioLabel: "Bio:\n",
    copyTipsLabel: "\nTips:\n",
    copyStrengthsLabel: "Strengths:\n",
    copyGapsLabel: "\nGaps and action plan:\n",
  },
};

// Placed at the very start of every prompt so it has top priority over the rest of the instructions.
function languageDirective(lang) {
  return lang === "en"
    ? "STRICT LANGUAGE RULE (read this first, it overrides everything below): the TEXT VALUES in your response must be written ONLY in English. This holds even when the attached CV, document, or image is written in a different language: do NOT mirror the source language, translate its content and answer in English. Tool, technology, and programming language names always stay in English exactly as written (for example: Python, SQL, Figma).\n\nThis rule applies to the text values ONLY — never to the JSON structure. Field names (such as \"strengths\", \"gaps\", \"items\", \"bio\") must be copied exactly as given, never translated, and every structural character — braces, brackets, double quotes, colons, and the commas separating fields and array elements — must be the plain ASCII ones. Never use a non-ASCII comma inside the JSON structure.\n\n---\n\n"
    : "تعليمة لغة صارمة (اقرأها أولاً، ولها أولوية على كل ما يليها): يجب أن تكون النصوص في ردك مكتوبة باللغة العربية الفصحى الواضحة فقط. وهذا ينطبق حتى لو كانت السيرة الذاتية أو المستند أو الصورة المرفقة مكتوبة بلغة أخرى: لا تقلّد لغة المصدر إطلاقاً، بل ترجم محتواها واكتب ردك بالعربية. أسماء الأدوات والتقنيات ولغات البرمجة تبقى دائماً بالإنجليزية كما هي (مثل Python، SQL، Figma).\n\nهذه القاعدة تخص قيم النصوص فقط — ولا تنطبق إطلاقاً على بنية JSON. أسماء الحقول (مثل \"strengths\" و\"gaps\" و\"items\" و\"bio\") تُنسخ حرفياً كما هي بالإنجليزية وممنوع ترجمتها، وكل رموز البنية — الأقواس المعقوفة والمربعة وعلامات الاقتباس المزدوجة والنقطتان والفواصل التي تفصل بين الحقول وبين عناصر المصفوفات — يجب أن تكون لاتينية عادية. ممنوع منعاً باتاً استخدام الفاصلة العربية (،) داخل بنية JSON، استخدم الفاصلة اللاتينية (,) فقط.\n\n---\n\n";
}

// ---------- Emblem (abstract badge per field archetype) ----------
const EMBLEM_ICONS = {
  explorer: Radar,
  guardian: Shield,
  analyst: Search,
  builder: Wrench,
  strategist: Target,
  voyager: MapIcon,
};
function Emblem({ type, size = 84 }) {
  const palettes = {
    explorer: { bg: "#E1F0EA", fg: "#2F6B57" },
    strategist: { bg: "#E4E8F5", fg: "#4A5FA3" },
    analyst: { bg: "#EEE7F5", fg: "#7A5A9E" },
    builder: { bg: "#F6E9D9", fg: "#C9863D" },
    guardian: { bg: "#F5E1DD", fg: "#A6432F" },
    voyager: { bg: "#E1F0EA", fg: "#2F6B57" },
  };
  const p = palettes[type] || palettes.voyager;
  const Icon = EMBLEM_ICONS[type] || EMBLEM_ICONS.voyager;
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: 14,
        background: p.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={Math.round(size * 0.42)} color={p.fg} strokeWidth={1.8} />
    </div>
  );
}

// ---------- Decorative hero illustration ----------
function HeroTrail() {
  return (
    <svg viewBox="0 0 600 160" width="100%" height="140" style={{ display: "block", overflow: "visible" }}>
      <path d="M0 150 L120 90 L210 130 L320 40 L420 95 L520 20 L600 55" fill="none" stroke={COLORS.border} strokeWidth="10" strokeLinejoin="round" opacity="0.5" />
      <path
        d="M6 140 Q90 70 180 110 T340 55 T520 40"
        fill="none"
        stroke={COLORS.pine}
        strokeWidth="2.5"
        strokeDasharray="1 10"
        strokeLinecap="round"
        className="cm-trail-draw"
      />
      <circle cx="6" cy="140" r="6" fill={COLORS.pine} />
      <circle cx="180" cy="110" r="5" fill={COLORS.panel} stroke={COLORS.pine} strokeWidth="2.5" />
      <circle cx="340" cy="55" r="5" fill={COLORS.panel} stroke={COLORS.amber} strokeWidth="2.5" />
      <g transform="translate(514, 20)">
        <line x1="0" y1="0" x2="0" y2="26" stroke={COLORS.ink} strokeWidth="2" />
        <path d="M0 0 L18 5 L0 12 Z" fill={COLORS.amber} />
      </g>
    </svg>
  );
}

const ARCHETYPES = [
  { key: "explorer", match: ["ai", "ذكاء", "data", "بيانات", "machine", "تعلم"] },
  { key: "guardian", match: ["governance", "حوكم", "compliance", "مالي", "finance", "audit", "risk"] },
  { key: "analyst", match: ["analyst", "محلل", "business", "أعمال"] },
  { key: "builder", match: ["engineer", "مهندس", "developer", "مطور", "technical", "تقني"] },
  { key: "strategist", match: ["strategy", "استراتيج", "manager", "مدير", "product", "منتج"] },
];
function getArchetypeKey(role) {
  const lower = (role || "").toLowerCase();
  const found = ARCHETYPES.find((a) => a.match.some((m) => lower.includes(m)));
  return found ? found.key : "voyager";
}

const CAREER_FIELDS = [
  "AI Product Manager",
  "Data Analyst",
  "Data Scientist",
  "Business Analyst",
  "Scrum Master",
  "Technical Program Manager",
  "Product Operations Manager",
  "Growth Product Manager",
  "UX Researcher",
  "UI/UX Designer",
  "Solutions Consultant",
  "Digital Transformation Consultant",
  "Financial Analyst",
  "Risk & Compliance Analyst",
  "Marketing Manager",
  "Customer Success Manager",
  "Software Engineer",
  "DevOps Engineer",
  "Cybersecurity Analyst",
  "HR Business Partner",
  "Project Manager",
  "Operations Manager",
];

// ---------- helpers ----------

// Keep in step with MAX_REQUEST_BYTES in app/api/mentor/route.js, which enforces the real
// limit — this check only spares the user a slow base64 encode before the server rejects it.
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = () => reject(new Error("read-failed"));
    reader.readAsDataURL(file);
  });
}

async function callClaude(contentBlocks, maxTokens = 800) {
  const response = await fetch("/api/mentor", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentBlocks, maxTokens }),
  });
  let data;
  try {
    data = await response.json();
  } catch {
    // Server returned something that isn't JSON (e.g. an HTML error page) — normalize to a plain Error.
    throw new Error("invalid-response");
  }
  if (!response.ok) {
    const err = new Error(data?.error || "request-failed");
    err.code = data?.code; // e.g. "scanned-pdf", which no retry can fix
    throw err;
  }
  return data.text || "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function collectStrings(value, out = []) {
  if (typeof value === "string") out.push(value);
  else if (Array.isArray(value)) value.forEach((v) => collectStrings(v, out));
  else if (value && typeof value === "object") Object.values(value).forEach((v) => collectStrings(v, out));
  return out;
}

// The model sometimes ignores the language instruction entirely (replies in English or even a
// third language) instead of just mixing in a stray word. Checking the actual script of the
// response — not just its JSON shape — lets callClaudeAndParse retry those cases automatically
// instead of showing the wrong language to the user.
function matchesLanguage(parsed, lang) {
  const text = collectStrings(parsed).join(" ");
  const arabicChars = (text.match(/[؀-ۿ]/g) || []).length;
  const latinLetters = (text.match(/[A-Za-z]/g) || []).length;
  if (lang === "ar") return arabicChars >= 10 && arabicChars > latinLetters;
  return arabicChars < 3;
}

// Retries a failed response or truncated/malformed JSON up to `attempts` times
// (1 initial try + up to 2 automatic retries) before giving up. Never throws synchronously —
// every failure mode (network, non-JSON body, truncated/malformed JSON, failed validation)
// is funneled through the same catch so the caller's try/catch always sees a normal rejection.
async function callClaudeAndParse(contentBlocks, maxTokens, validate, lang, attempts = 3) {
  let lastErr = new Error("unknown-error");
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const raw = await callClaude(contentBlocks, maxTokens);
      const parsed = extractJson(raw);
      if (!validate(parsed)) throw new Error("malformed-shape");
      // Checked separately from the shape: the model sometimes returns a perfectly valid object
      // that simply mirrors an uploaded document's language instead of the requested one, and
      // reporting that as "malformed" sends anyone debugging it down the wrong path.
      if (!matchesLanguage(parsed, lang)) throw new Error("wrong-language");
      return parsed;
    } catch (err) {
      lastErr = err;
      if (err.code === "scanned-pdf") throw err; // the same file will fail the same way again
      if (attempt < attempts - 1) await sleep(600);
    }
  }
  throw lastErr;
}

// ---------- small UI atoms ----------
function Label({ children }) {
  return (
    <p style={{ fontFamily: "var(--font-cairo), sans-serif", fontSize: 14, color: COLORS.inkSoft, margin: "0 0 10px 0", lineHeight: 1.6 }}>
      {children}
    </p>
  );
}

function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={disabled ? "" : "cm-btn"}
      style={{
        fontFamily: "var(--font-cairo), sans-serif",
        fontSize: 15,
        fontWeight: 600,
        padding: "11px 22px",
        background: disabled ? COLORS.inkSoft : COLORS.pine,
        color: "#fff",
        border: "none",
        borderRadius: 3,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {loading && <Loader2 size={16} className="spin" />}
      {children}
    </button>
  );
}

// Lower-weight sibling of PrimaryButton for corrective actions — retrying after an error is a
// constructive step, not a destructive one, so it keeps the primary hue and drops the fill
// rather than turning red, which would read as "delete".
function SecondaryButton({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={disabled ? "" : "cm-secondary"}
      style={{
        fontFamily: "var(--font-cairo), sans-serif",
        fontSize: 15,
        fontWeight: 600,
        padding: "11px 22px",
        background: "transparent",
        color: disabled ? COLORS.inkSoft : COLORS.pineDark,
        border: `1px solid ${disabled ? COLORS.border : COLORS.pine}`,
        borderRadius: 3,
        cursor: disabled ? "default" : "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      {loading && <Loader2 size={16} className="spin" />}
      {children}
    </button>
  );
}

// Small outlined action that sits beside a heading (copy, save). `active` tints it while it
// confirms an action it just took, such as "Copied".
function GhostButton({ children, onClick, icon, active }) {
  return (
    <button
      onClick={onClick}
      className="cm-ghost"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 6,
        flexShrink: 0,
        background: "none",
        border: `1px solid ${COLORS.border}`,
        borderRadius: 3,
        padding: "7px 12px",
        fontSize: 13,
        color: active ? COLORS.pine : COLORS.inkSoft,
        cursor: "pointer",
        fontFamily: "var(--font-cairo), sans-serif",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// Print-only copy of the weekly plan, portalled straight into <body> so the print stylesheet can
// hide every other top-level node. It renders in the browser's own layout engine, which is what
// joins Arabic letters and orders mixed Arabic/English text correctly — the PDF libraries tested
// for this (jsPDF, react-pdf) got one or the other wrong. `dir` and the labels come from the
// current interface language, not from the plan's own text.
function PlanPrintout({ dir, t, title, weeks }) {
  return (
    <div className="cm-print-root" dir={dir}>
      <h1>{title}</h1>
      {weeks.map((week) => (
        <section key={week.weekNumber} className="cm-print-week">
          <h2>
            <span className="cm-print-num">{week.weekNumber}</span>
            {t.weekLabel} {week.weekNumber}
          </h2>
          <ul>
            {week.tasks.map((task, i) => (
              <li key={i}>
                <div>{task.title}</div>
                <div className="cm-print-skill">
                  {t.skillLabel}
                  {task.relatedSkill}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}

function Panel({ children, style }) {
  return (
    <div
      style={{
        background: COLORS.panel,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 4,
        padding: 24,
        boxShadow: "0 1px 2px rgba(30,42,47,0.04)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

const INPUT_STYLE = {
  width: "100%",
  fontFamily: "var(--font-cairo), sans-serif",
  fontSize: 16,
  padding: "10px 12px",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 3,
  color: COLORS.ink,
  background: "#FCFAF5",
  boxSizing: "border-box",
};

// ---------- language toggle ----------
function LanguageToggle({ lang, setLang }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 20,
        padding: 2,
        flexShrink: 0,
      }}
    >
      {["ar", "en"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            fontFamily: "var(--font-cairo), sans-serif",
            fontSize: 12,
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 16,
            border: "none",
            background: lang === l ? COLORS.pine : "transparent",
            color: lang === l ? "#fff" : COLORS.inkSoft,
            cursor: "pointer",
          }}
        >
          {l === "ar" ? "عربي" : "English"}
        </button>
      ))}
    </div>
  );
}

// ---------- render-time safety net ----------
// Catches crashes while rendering AI-generated content (unexpected shapes the validator
// missed) so a bad response shows the normal in-app error message instead of taking down
// the whole page. A plain try/catch around the fetch can never catch these — only an
// Error Boundary can, since the exception happens during React's render, not while awaiting.
class ResultBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error) {
    console.error(error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <p style={{ color: COLORS.danger, fontSize: 14, marginBottom: 12 }}>{this.props.message}</p>
          <PrimaryButton onClick={this.props.onReset}>{this.props.backLabel}</PrimaryButton>
        </div>
      );
    }
    return this.props.children;
  }
}

// ---------- progress indicator ----------
const STEP_ORDER = ["input", "profile", "result"];
function ProgressSteps({ step, s }) {
  const currentIndex = STEP_ORDER.indexOf(step);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 24 }}>
      {STEP_ORDER.map((st, i) => (
        <React.Fragment key={st}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
                background: i <= currentIndex ? COLORS.pine : "transparent",
                border: `1.5px solid ${i <= currentIndex ? COLORS.pine : COLORS.border}`,
                color: i <= currentIndex ? "#fff" : COLORS.inkSoft,
              }}
            >
              {i < currentIndex ? <Check size={12} strokeWidth={3} /> : i + 1}
            </div>
            <span style={{ fontSize: 13, color: i === currentIndex ? COLORS.pineDark : COLORS.inkSoft, fontWeight: i === currentIndex ? 700 : 400 }}>
              {s.steps[st]}
            </span>
          </div>
          {i < STEP_ORDER.length - 1 && <div style={{ flex: 1, height: 1, background: COLORS.border, minWidth: 16 }} />}
        </React.Fragment>
      ))}
    </div>
  );
}

// ---------- main component ----------
export default function CareerSkillMentor() {
  const [lang, setLang] = useState("ar"); // ar | en
  const s = STRINGS[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = s.dir;
  }, [lang, s.dir]);

  const [step, setStep] = useState("input"); // input | profile | result
  const [inputMode, setInputMode] = useState("file"); // file | text
  const [manualText, setManualText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileBlock, setFileBlock] = useState(null); // {type, source} for image/document
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const [profile, setProfile] = useState(null); // {keywords, bio, currentField}
  const [editingProfile, setEditingProfile] = useState(false);
  const [editDraft, setEditDraft] = useState({ bio: "", keywords: "", currentField: "" });

  const [selectedOption, setSelectedOption] = useState(null);
  const [resultTitle, setResultTitle] = useState("");
  const [resultType, setResultType] = useState(null); // 'items' | 'resume' | 'plan'
  const [resultData, setResultData] = useState(null);
  const [copied, setCopied] = useState(false);

  const [showFieldPicker, setShowFieldPicker] = useState(false);
  const [fieldQuery, setFieldQuery] = useState("");

  // Kept separate from `busy` so the rest of the result screen — the back link especially —
  // stays usable while a weekly plan is being generated.
  // The option (and, for the custom path, the exact field) the retry button should re-run.
  const [lastPlanField, setLastPlanField] = useState("");

  const [planBusy, setPlanBusy] = useState(false);
  const [weeklyPlan, setWeeklyPlan] = useState(null);
  const [planError, setPlanError] = useState("");
  const [planCopied, setPlanCopied] = useState(false);

  function resetAll() {
    setStep("input");
    setInputMode("file");
    setManualText("");
    setFileName("");
    setFileBlock(null);
    setError("");
    setProfile(null);
    setEditingProfile(false);
    setSelectedOption(null);
    setResultTitle("");
    setResultType(null);
    setResultData(null);
    setShowFieldPicker(false);
    setFieldQuery("");
    setWeeklyPlan(null);
    setPlanError("");
  }

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError(s.errFileTooLarge);
      setFileName("");
      setFileBlock(null);
      return;
    }
    setFileName(file.name);
    setBusy(true);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      if (ext === "docx") {
        const mammoth = await import("mammoth");
        const arrayBuffer = await file.arrayBuffer();
        const res = await mammoth.extractRawText({ arrayBuffer });
        setFileBlock({ type: "text", text: res.value });
      } else if (ext === "pdf") {
        const base64 = await fileToBase64(file);
        setFileBlock({
          type: "file",
          file: { filename: file.name, file_data: `data:application/pdf;base64,${base64}` },
        });
      } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
        const base64 = await fileToBase64(file);
        setFileBlock({
          type: "image_url",
          image_url: { url: `data:${file.type || "image/png"};base64,${base64}` },
        });
      } else {
        setError(s.errUnsupportedFile);
        setFileBlock(null);
      }
    } catch (err) {
      console.error(err);
      setError(s.errFileRead);
    } finally {
      setBusy(false);
    }
  }

  async function extractProfile() {
    setBusy(true);
    setError("");
    try {
      const instruction = `${languageDirective(lang)}اقرأ محتوى السيرة الذاتية أو النص المرفق، واستخرج بإيجاز شديد: 1) قائمة كلمات مفتاحية تلخص المهارات والأدوات (6-8 كلمات فقط)، 2) نبذة قصيرة جملة إلى جملتين بس عن الشخص، 3) المجال الوظيفي الحالي الأغلب بكلمتين إلى ثلاث.\n\nأجب بصيغة JSON فقط بدون أي نص إضافي، ابدأ مباشرة بعلامة { وانتهِ بعلامة }، بهذا الشكل بالضبط: {"keywords": ["...", "..."], "bio": "...", "currentField": "..."}`;

      let content;
      if (inputMode === "text") {
        content = [{ type: "text", text: `${instruction}\n\nالنص:\n${manualText}` }];
      } else if (fileBlock?.type === "text") {
        content = [{ type: "text", text: `${instruction}\n\nالنص:\n${fileBlock.text}` }];
      } else if (fileBlock) {
        content = [fileBlock, { type: "text", text: instruction }];
      } else {
        setError(s.errNoInput);
        setBusy(false);
        return;
      }

      const parsed = await callClaudeAndParse(
        content,
        400,
        (p) => Array.isArray(p.keywords) && !!p.bio,
        lang
      );
      setProfile(parsed);
      setStep("profile");
    } catch (err) {
      console.error(err);
      setError(err.code === "scanned-pdf" ? s.errScannedPdf : s.errAnalyze);
    } finally {
      setBusy(false);
    }
  }

  function startEditProfile() {
    setEditDraft({
      bio: profile.bio,
      keywords: profile.keywords.join("، "),
      currentField: profile.currentField,
    });
    setEditingProfile(true);
  }

  function saveEditProfile() {
    setProfile({
      bio: editDraft.bio.trim(),
      keywords: editDraft.keywords.split(/[،,]/).map((k) => k.trim()).filter(Boolean),
      currentField: editDraft.currentField.trim(),
    });
    setEditingProfile(false);
  }

  function profileSummary() {
    return `الكلمات المفتاحية: ${profile.keywords.join("، ")}\nالنبذة: ${profile.bio}\nالمجال الحالي: ${profile.currentField}`;
  }

  async function runOption(optionId) {
    setSelectedOption(optionId);
    setWeeklyPlan(null);
    setPlanError("");
    setResultData(null);
    setBusy(true);
    setError("");
    try {
      const base = profileSummary();

      if (optionId === 1) {
        const prompt = `${languageDirective(lang)}${base}\n\nاعتمد فقط على المعلومات أعلاه، لا تفترض مهارات غير مذكورة. اقترح مجالات وظيفية جديدة مناسبة للتنقل إليها بناءً على المهارات أعلاه، بالعدد اللي يستحقه فعلاً (لا تفرض رقماً ثابتاً). لكل مجال: اسمه، سبب مناسبته بجملة، وأول خطوة عملية للبدء بجملة.\n\nأجب بصيغة JSON فقط، ابدأ مباشرة بعلامة { وانتهِ بعلامة }، بهذا الشكل: {"items": [{"title": "...", "why": "...", "step": "..."}]}`;
        const parsed = await callClaudeAndParse(
          [{ type: "text", text: prompt }],
          900,
          (p) => Array.isArray(p.items),
          lang
        );
        setResultTitle(s.newFieldsTitle);
        setResultType("items");
        setResultData(parsed);
      } else if (optionId === 2) {
        const prompt = `${languageDirective(lang)}${base}\n\nاعتمد فقط على المعلومات أعلاه، لا تفترض مهارات غير مذكورة. اقترح خطة تطوير أعمق بنفس المجال الحالي: مهارات متقدمة أو شهادات تستحق التركيز عليها فعلاً بناءً على الفجوة الحقيقية، بالعدد اللي يستحقه (لا تفرض رقماً ثابتاً)، مع خطوة عملية واحدة بجملة لكل واحدة.\n\nأجب بصيغة JSON فقط، ابدأ مباشرة بعلامة { وانتهِ بعلامة }، بهذا الشكل: {"items": [{"title": "...", "why": "...", "step": "..."}]}`;
        const parsed = await callClaudeAndParse(
          [{ type: "text", text: prompt }],
          900,
          (p) => Array.isArray(p.items),
          lang
        );
        setResultTitle(`${s.deepenTitlePrefix}${profile.currentField}`);
        setResultType("items");
        setResultData(parsed);
      } else if (optionId === 3) {
        const prompt = `${languageDirective(lang)}${base}\n\nاكتب فقرة "نبذة تعريفية" محسّنة لسيرة ذاتية بصيغة احترافية (3-4 أسطر) بناءً فقط على المعلومات أعلاه، ثم نصائح محددة لتحسين صياغة السيرة الذاتية (بالعدد اللي يستحقه الموقف فعلاً).\n\nأجب بصيغة JSON فقط، ابدأ مباشرة بعلامة { وانتهِ بعلامة }، بهذا الشكل: {"bio": "...", "tips": ["...", "..."]}`;
        const parsed = await callClaudeAndParse(
          [{ type: "text", text: prompt }],
          700,
          (p) => !!p.bio && Array.isArray(p.tips),
          lang
        );
        setResultTitle(s.resumeTitle);
        setResultType("resume");
        setResultData(parsed);
      }
      setStep("result");
    } catch (err) {
      console.error(err);
      setError(s.genericError);
    } finally {
      setBusy(false);
    }
  }

  async function runCustomFieldPlan(field) {
    setSelectedOption(5);
    setLastPlanField(field);
    setWeeklyPlan(null);
    setPlanError("");
    setResultData(null);
    setShowFieldPicker(false);
    setBusy(true);
    setError("");
    try {
      const base = profileSummary();
      const prompt = `${languageDirective(lang)}${base}\n\nالشخص يفكر تحديداً بالانتقال إلى مجال: ${field}\n\nاعتمد فقط على المعلومات المزوّدة أعلاه - لا تفترض مهارات أو خبرات غير مذكورة. حدد: 1) نقاط القوة الفعلية الموجودة أعلاه واللي تخدم هذا الهدف تحديداً (بالعدد اللي يستحقه فعلاً)، 2) الفجوات المهارية الحقيقية بين المذكور أعلاه ومتطلبات هذا الدور، بالعدد اللي يعكس الفجوة الفعلية فقط. لكل فجوة: سبب أهميتها بجملة قصيرة، وخطوة عملية واحدة ملموسة (تفضّل موارد مجانية).\n\nأجب بصيغة JSON فقط، ابدأ مباشرة بعلامة { وانتهِ بعلامة }، بهذا الشكل: {"strengths": ["...", "..."], "gaps": [{"skill": "...", "why": "...", "step": "..."}]}`;
      const parsed = await callClaudeAndParse(
        [{ type: "text", text: prompt }],
        1200,
        (p) => Array.isArray(p.strengths) && Array.isArray(p.gaps),
        lang
      );
      setResultTitle(`${s.transitionTitlePrefix}${field}`);
      setResultType("plan");
      setResultData(parsed);
      setStep("result");
    } catch (err) {
      console.error(err);
      setError(s.genericError);
    } finally {
      setBusy(false);
    }
  }

  function retryLastOption() {
    if (selectedOption === 5) runCustomFieldPlan(lastPlanField);
    else if (selectedOption) runOption(selectedOption);
  }

  async function generateWeeklyPlan() {
    setPlanBusy(true);
    setPlanError("");
    try {
      const response = await fetch("/api/mentor/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentField: profile.currentField,
          bio: profile.bio,
          keywords: profile.keywords,
          strengths: resultData.strengths,
          gaps: resultData.gaps,
        }),
      });
      const data = await response.json();
      // The endpoint already retries the model internally, so a failure here is final.
      if (!response.ok) throw new Error(data?.error || "request-failed");
      if (!Array.isArray(data.weeks) || data.weeks.length === 0) throw new Error("no-weeks");
      setWeeklyPlan(data.weeks);
    } catch (err) {
      console.error(err);
      setPlanError(s.genericError);
    } finally {
      setPlanBusy(false);
    }
  }

  function buildCopyText() {
    let out = resultTitle + "\n\n";
    if (resultType === "items" && resultData) {
      resultData.items.forEach((it, i) => {
        out += `${i + 1}. ${it.title}\n   ${it.why}\n   ${s.stepLabel}${it.step}\n\n`;
      });
    } else if (resultType === "resume" && resultData) {
      out += `${s.copyBioLabel}${resultData.bio}${s.copyTipsLabel}`;
      resultData.tips.forEach((t, i) => (out += `${i + 1}. ${t}\n`));
    } else if (resultType === "plan" && resultData) {
      out += s.copyStrengthsLabel;
      resultData.strengths.forEach((st) => (out += `- ${st}\n`));
      out += s.copyGapsLabel;
      resultData.gaps.forEach((g, i) => (out += `${i + 1}. ${g.skill} — ${g.why}\n   ${s.stepLabel}${g.step}\n`));
    }
    return out;
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(buildCopyText());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  const planDocTitle = `${s.weeklyPlanTitle} — ${lastPlanField}`;

  function buildPlanCopyText() {
    let out = `${planDocTitle}\n\n`;
    weeklyPlan.forEach((week) => {
      out += `${s.weekLabel} ${week.weekNumber}\n`;
      week.tasks.forEach((task) => (out += `- ${task.title}\n  ${s.skillLabel}${task.relatedSkill}\n`));
      out += "\n";
    });
    return out.trimEnd() + "\n";
  }

  async function handlePlanCopy() {
    try {
      await navigator.clipboard.writeText(buildPlanCopyText());
      setPlanCopied(true);
      setTimeout(() => setPlanCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }

  // The printout stays mounted for as long as the plan is on screen, rather than being added when
  // "Save PDF" is pressed and removed on `afterprint`. On Android, window.print() returns before
  // the page is captured and afterprint can fire straight away, which removed the printout first
  // and produced a blank PDF; printing from the browser's own menu never mounted it at all.
  const showPrintout = step === "result" && !!weeklyPlan;

  // The browser offers document.title as the PDF's file name. Holding it for as long as the
  // printout is mounted covers every way of printing, whatever order the print events fire in.
  useEffect(() => {
    if (!showPrintout) return;
    const previousTitle = document.title;
    document.title = planDocTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [showPrintout, planDocTitle]);

  function handleSavePdf() {
    // Cairo's Arabic and Latin subsets load on demand; waiting keeps the print from falling back.
    document.fonts.ready.then(() => window.print());
  }

  const adpListUrl = profile
    ? `https://adplist.org/mentors?search=${encodeURIComponent(profile.currentField || "product management")}`
    : "https://adplist.org";

  const START = isRtl ? "right" : "left";

  const matchingFields = fieldQuery.trim()
    ? CAREER_FIELDS.filter((f) => f.toLowerCase().includes(fieldQuery.toLowerCase()))
    : [];

  return (
    <div
      dir={s.dir}
      style={{
        fontFamily: "var(--font-cairo), sans-serif",
        background: `radial-gradient(rgba(47,107,87,0.09) 1px, transparent 1.4px) 0 0/20px 20px, ${COLORS.bg}`,
        minHeight: "100%",
        padding: "40px 20px",
        color: COLORS.ink,
      }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @keyframes cmFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .cm-step-enter { animation: cmFadeUp 0.45s ease both; }

        @keyframes cmTrailDraw { from { stroke-dashoffset: 500; } to { stroke-dashoffset: 0; } }
        .cm-trail-draw { stroke-dashoffset: 500; animation: cmTrailDraw 1.6s ease-out forwards 0.15s; }

        .cm-btn { transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease; }
        .cm-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(32,74,61,0.25); filter: brightness(1.05); }
        .cm-btn:active { transform: translateY(0); }

        .cm-card { transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
        .cm-card:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(30,42,47,0.08); border-color: ${COLORS.amber} !important; }

        .cm-tab { transition: transform 0.15s ease, background 0.15s ease; }
        .cm-tab:hover:not(:disabled) { transform: translateY(-1px); }

        .cm-input:focus { outline: none; border-color: ${COLORS.pine} !important; box-shadow: 0 0 0 3px rgba(47,107,87,0.12); }

        .cm-suggestion:hover:not(:disabled) { background: #F1EDE0 !important; border-color: ${COLORS.pine} !important; }

        .cm-upload:hover { border-color: ${COLORS.pine} !important; background: #F1EDE0 !important; }

        .cm-ghost:hover { background: #F1EDE0 !important; }

        .cm-secondary { transition: background 0.15s ease; }
        .cm-secondary:hover:not(:disabled) { background: #EAF1EE; }

        .cm-print-root { display: none; }
        @media print {
          @page { size: A4; margin: 16mm 14mm; }
          html, body { background: #fff !important; }
          body:has(> .cm-print-root) > *:not(.cm-print-root) { display: none !important; }
          .cm-print-root {
            display: block;
            font-family: var(--font-cairo), sans-serif;
            color: ${COLORS.ink};
            font-size: 11.5pt;
            line-height: 1.7;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .cm-print-root h1 {
            font-size: 17pt;
            color: ${COLORS.pineDark};
            margin: 0 0 5mm;
            padding-bottom: 2mm;
            border-bottom: 2px solid ${COLORS.pine};
          }
          .cm-print-week { break-inside: avoid; margin: 0 0 5mm; }
          .cm-print-root h2 {
            display: flex;
            align-items: center;
            gap: 2.5mm;
            font-size: 12.5pt;
            color: ${COLORS.pine};
            margin: 0 0 1.5mm;
          }
          .cm-print-num {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            width: 6.5mm;
            height: 6.5mm;
            border-radius: 50%;
            background: ${COLORS.pine};
            color: #fff;
            font-size: 9.5pt;
          }
          .cm-print-root ul { margin: 0; padding-inline-start: 5mm; }
          .cm-print-root li { margin: 0 0 1.5mm; }
          .cm-print-skill { font-size: 9.5pt; color: ${COLORS.inkSoft}; }
        }
      `}</style>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, gap: 10, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Compass size={22} color={COLORS.pine} strokeWidth={2} />
            <span style={{ fontSize: 14, color: COLORS.pine, fontWeight: 600 }}>{s.appTitle}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <LanguageToggle lang={lang} setLang={setLang} />
            {step !== "input" && (
              <button
                onClick={resetAll}
                className="cm-ghost"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  background: "none",
                  border: `1px solid ${COLORS.border}`,
                  borderRadius: 3,
                  padding: "6px 12px",
                  fontSize: 13,
                  color: COLORS.inkSoft,
                  cursor: "pointer",
                  fontFamily: "var(--font-cairo), sans-serif",
                }}
              >
                <RotateCcw size={14} /> {s.startOver}
              </button>
            )}
          </div>
        </div>

        <ProgressSteps step={step} s={s} />

        {step === "input" && (
          <div className="cm-step-enter">
            <HeroTrail />
            <h1 style={{ fontFamily: "var(--font-amiri), serif", fontSize: 34, fontWeight: 700, margin: "4px 0 8px 0", lineHeight: 1.3, color: COLORS.pineDark }}>
              {s.inputHeading}
            </h1>
            <p style={{ color: COLORS.inkSoft, fontSize: 16, lineHeight: 1.8, margin: "0 0 28px 0", maxWidth: 480 }}>
              {s.inputSub}
            </p>

            <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
              {[
                { id: "file", label: s.tabUpload },
                { id: "text", label: s.tabWrite },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setInputMode(tab.id)}
                  className="cm-tab"
                  style={{
                    fontFamily: "var(--font-cairo), sans-serif",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: "9px 18px",
                    borderRadius: 3,
                    border: `1px solid ${inputMode === tab.id ? COLORS.pine : COLORS.border}`,
                    background: inputMode === tab.id ? COLORS.pine : "transparent",
                    color: inputMode === tab.id ? "#fff" : COLORS.inkSoft,
                    cursor: "pointer",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <Panel style={{ marginBottom: 24 }}>
              {inputMode === "file" ? (
                <div>
                  <Label>{s.uploadLabel}</Label>
                  <label
                    className="cm-upload"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      border: `1.5px dashed ${COLORS.border}`,
                      borderRadius: 4,
                      padding: "20px 16px",
                      cursor: "pointer",
                      background: "#FCFAF5",
                      transition: "border-color 0.15s ease, background 0.15s ease",
                    }}
                  >
                    <Upload size={20} color={COLORS.pine} />
                    <span style={{ fontSize: 14, color: COLORS.inkSoft }}>
                      {fileName || s.uploadPlaceholder}
                    </span>
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.docx" onChange={handleFile} style={{ display: "none" }} />
                  </label>
                </div>
              ) : (
                <div>
                  <Label>{s.writeLabel}</Label>
                  <textarea
                    value={manualText}
                    onChange={(e) => setManualText(e.target.value)}
                    rows={5}
                    placeholder={s.writePlaceholder}
                    style={{ ...INPUT_STYLE, resize: "vertical" }}
                  />
                </div>
              )}
              {error && <p style={{ color: COLORS.danger, fontSize: 14, marginTop: 12 }}>{error}</p>}
            </Panel>

            <p style={{ fontSize: 12, color: COLORS.inkSoft, opacity: 0.7, lineHeight: 1.7, margin: "-14px 0 22px 0" }}>
              {s.privacyNote}
            </p>

            <PrimaryButton onClick={extractProfile} disabled={busy} loading={busy}>
              {busy ? s.analyzing : s.next}
            </PrimaryButton>
          </div>
        )}

        {step === "profile" && profile && (
          <div className="cm-step-enter">
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
              <Emblem type={getArchetypeKey(profile.currentField)} />
              <div>
                <p style={{ margin: "0 0 4px 0", fontSize: 13, color: COLORS.inkSoft }}>{s.currentFieldLabel}</p>
                <p style={{ margin: 0, fontFamily: "var(--font-amiri), serif", fontSize: 22, fontWeight: 700, color: COLORS.pineDark }}>
                  {profile.currentField}
                </p>
              </div>
            </div>

            <Panel style={{ marginBottom: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <Label>{s.extractedBioLabel}</Label>
                {!editingProfile && (
                  <button
                    onClick={startEditProfile}
                    className="cm-ghost"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "none",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 3,
                      padding: "4px 10px",
                      fontSize: 12,
                      color: COLORS.pine,
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo), sans-serif",
                    }}
                  >
                    <Pencil size={12} /> {s.edit}
                  </button>
                )}
              </div>

              {editingProfile ? (
                <div>
                  <textarea
                    value={editDraft.bio}
                    onChange={(e) => setEditDraft({ ...editDraft, bio: e.target.value })}
                    rows={3}
                    className="cm-input"
                    style={{ ...INPUT_STYLE, resize: "vertical", marginBottom: 12 }}
                  />
                  <Label>{s.currentFieldEditLabel}</Label>
                  <input
                    value={editDraft.currentField}
                    onChange={(e) => setEditDraft({ ...editDraft, currentField: e.target.value })}
                    className="cm-input"
                    style={{ ...INPUT_STYLE, marginBottom: 12 }}
                  />
                  <Label>{s.keywordsEditLabel}</Label>
                  <input
                    value={editDraft.keywords}
                    onChange={(e) => setEditDraft({ ...editDraft, keywords: e.target.value })}
                    className="cm-input"
                    style={{ ...INPUT_STYLE, marginBottom: 14 }}
                  />
                  <div style={{ display: "flex", gap: 8 }}>
                    <PrimaryButton onClick={saveEditProfile}>{s.save}</PrimaryButton>
                    <button
                      onClick={() => setEditingProfile(false)}
                      style={{
                        fontFamily: "var(--font-cairo), sans-serif",
                        fontSize: 14,
                        color: COLORS.inkSoft,
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      {s.cancel}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p style={{ margin: "0 0 16px 0", fontSize: 15, lineHeight: 1.8 }}>{profile.bio}</p>
                  <Label>{s.keywordsLabel}</Label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {profile.keywords.map((k, i) => (
                      <span
                        key={i}
                        style={{
                          fontSize: 13,
                          padding: "5px 12px",
                          borderRadius: 20,
                          background: "#EEF0E5",
                          color: COLORS.pineDark,
                          border: `1px solid ${COLORS.border}`,
                        }}
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </Panel>

            <p style={{ fontSize: 15, fontWeight: 600, margin: "0 0 14px 0", color: COLORS.ink }}>{s.whatNow}</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { id: 1, ...s.options[0] },
                { id: 2, ...s.options[1] },
                { id: 3, ...s.options[2] },
                { id: 4, ...s.options[3], external: true },
                { id: 5, ...s.options[4], custom: true },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => {
                    if (opt.external) window.open(adpListUrl, "_blank");
                    else if (opt.custom) setShowFieldPicker((v) => !v);
                    else runOption(opt.id);
                  }}
                  disabled={busy}
                  className="cm-card"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textAlign: isRtl ? "right" : "left",
                    padding: "16px 18px",
                    background: COLORS.panel,
                    border: `1px solid ${showFieldPicker && opt.custom ? COLORS.pine : COLORS.border}`,
                    borderRadius: 4,
                    cursor: busy ? "default" : "pointer",
                    fontFamily: "var(--font-cairo), sans-serif",
                  }}
                >
                  <div>
                    <p style={{ margin: "0 0 3px 0", fontSize: 15, fontWeight: 700, color: COLORS.ink }}>{opt.title}</p>
                    <p style={{ margin: 0, fontSize: 13, color: COLORS.inkSoft }}>{opt.desc}</p>
                  </div>
                  <ArrowRightIcon size={18} color={COLORS.pine} style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
                </button>
              ))}
            </div>

            {showFieldPicker && (
              <Panel style={{ marginTop: 14 }}>
                <Label>{s.fieldPickerLabel}</Label>
                <input
                  value={fieldQuery}
                  onChange={(e) => setFieldQuery(e.target.value)}
                  placeholder={s.fieldPickerPlaceholder}
                  className="cm-input"
                  style={{ ...INPUT_STYLE, marginBottom: 12 }}
                />
                {fieldQuery.trim() && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {matchingFields.slice(0, 6).map((f) => (
                      <button
                        key={f}
                        onClick={() => runCustomFieldPlan(f)}
                        disabled={busy}
                        className="cm-suggestion"
                        style={{
                          textAlign: isRtl ? "right" : "left",
                          padding: "9px 12px",
                          fontSize: 14,
                          fontFamily: "var(--font-cairo), sans-serif",
                          background: "#FCFAF5",
                          border: `1px solid ${COLORS.border}`,
                          borderRadius: 3,
                          cursor: busy ? "default" : "pointer",
                          color: COLORS.ink,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                    {matchingFields.length === 0 && (
                      <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: 0 }}>{s.noMatch}</p>
                    )}
                  </div>
                )}
                <PrimaryButton onClick={() => runCustomFieldPlan(fieldQuery)} disabled={busy || !fieldQuery.trim()} loading={busy}>
                  {busy ? s.preparingPlan : s.preparePlan}
                </PrimaryButton>
              </Panel>
            )}
            {busy && (
              <p style={{ display: "flex", alignItems: "center", gap: 8, color: COLORS.inkSoft, fontSize: 14, marginTop: 14 }}>
                <Loader2 size={16} className="spin" /> {s.preparingRecs}
              </p>
            )}
            {error && (
              <div style={{ marginTop: 12 }}>
                <p style={{ color: COLORS.danger, fontSize: 14, margin: "0 0 10px 0" }}>{error}</p>
                <SecondaryButton onClick={retryLastOption} disabled={busy} loading={busy}>
                  {s.retry}
                </SecondaryButton>
              </div>
            )}
          </div>
        )}

        {step === "result" && (
          <div className="cm-step-enter">
            <button
              onClick={() => setStep("profile")}
              style={{ background: "none", border: "none", color: COLORS.pine, fontSize: 14, cursor: "pointer", padding: 0, marginBottom: 18, fontFamily: "var(--font-cairo), sans-serif" }}
            >
              {s.backToOptions}
            </button>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
              {resultTitle && (
                <h2 style={{ fontFamily: "var(--font-amiri), serif", fontSize: 24, fontWeight: 700, color: COLORS.pineDark, margin: 0 }}>
                  {resultTitle}
                </h2>
              )}
              {resultData && (
                <GhostButton
                  onClick={handleCopy}
                  active={copied}
                  icon={copied ? <CopyCheck size={14} /> : <Copy size={14} />}
                >
                  {copied ? s.copied : s.copy}
                </GhostButton>
              )}
            </div>

            <ResultBoundary key={selectedOption} message={s.genericError} backLabel={s.backToOptions} onReset={() => setStep("profile")}>
            {resultType === "items" && resultData && (
              <Panel>
                <div style={{ position: "relative", [isRtl ? "paddingRight" : "paddingLeft"]: 4 }}>
                  <div style={{ position: "absolute", [START]: 13, top: 8, bottom: 8, width: 2, background: COLORS.border }} />
                  {resultData.items.map((it, i) => (
                    <div key={i} style={{ position: "relative", display: "flex", gap: 14, marginBottom: i === resultData.items.length - 1 ? 0 : 20 }}>
                      <div
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: COLORS.panel,
                          border: `2px solid ${COLORS.amber}`,
                          color: COLORS.amber,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          zIndex: 1,
                        }}
                      >
                        {i + 1}
                      </div>
                      <div>
                        <p style={{ margin: "3px 0 4px 0", fontSize: 15, fontWeight: 700 }}>{it.title}</p>
                        <p style={{ margin: "0 0 6px 0", fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.7 }}>{it.why}</p>
                        <p style={{ margin: 0, fontSize: 14, color: COLORS.pineDark, lineHeight: 1.7 }}>
                          <strong>{s.stepLabel}</strong>
                          {it.step}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {resultType === "resume" && resultData && (
              <>
                <Panel style={{ marginBottom: 20, [isRtl ? "borderRight" : "borderLeft"]: `3px solid ${COLORS.pine}` }}>
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.9, fontStyle: "italic", color: COLORS.ink }}>{resultData.bio}</p>
                </Panel>
                <Panel>
                  <Label>{s.resumeTipsLabel}</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {resultData.tips.map((t, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.pine, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </div>
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }}>{t}</p>
                      </div>
                    ))}
                  </div>
                </Panel>
              </>
            )}

            {resultType === "plan" && resultData && (
              <>
                <Panel style={{ marginBottom: 20 }}>
                  <Label>{s.strengthsLabel}</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {resultData.strengths.map((st, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", background: COLORS.pine, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          <Check size={12} color="#fff" strokeWidth={3} />
                        </div>
                        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7 }}>{st}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel style={{ marginBottom: 20 }}>
                  <Label>{s.gapsLabel}</Label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {resultData.gaps.map((g, i) => (
                      <div key={i}>
                        <p style={{ margin: "0 0 3px 0", fontSize: 15, fontWeight: 700 }}>{g.skill}</p>
                        <p style={{ margin: 0, fontSize: 14, color: COLORS.inkSoft, lineHeight: 1.7 }}>{g.why}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <Panel>
                  <Label>{s.actionPlanLabel}</Label>
                  <div style={{ position: "relative", [isRtl ? "paddingRight" : "paddingLeft"]: 4 }}>
                    <div style={{ position: "absolute", [START]: 13, top: 8, bottom: 8, width: 2, background: COLORS.border }} />
                    {resultData.gaps.map((g, i) => (
                      <div key={i} style={{ position: "relative", display: "flex", gap: 14, marginBottom: i === resultData.gaps.length - 1 ? 0 : 16 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: "50%",
                            background: COLORS.panel,
                            border: `2px solid ${COLORS.amber}`,
                            color: COLORS.amber,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 13,
                            fontWeight: 700,
                            flexShrink: 0,
                            zIndex: 1,
                          }}
                        >
                          {i + 1}
                        </div>
                        <p style={{ margin: "3px 0 0 0", fontSize: 15, lineHeight: 1.7 }}>{g.step}</p>
                      </div>
                    ))}
                  </div>
                </Panel>

                <div style={{ marginTop: 20 }}>
                  <PrimaryButton onClick={generateWeeklyPlan} disabled={planBusy} loading={planBusy}>
                    {planBusy ? s.generatingPlan : s.generatePlan}
                  </PrimaryButton>
                </div>

                {planError && (
                  <div style={{ marginTop: 14 }}>
                    <p style={{ color: COLORS.danger, fontSize: 14, margin: "0 0 10px 0" }}>{planError}</p>
                    <SecondaryButton onClick={generateWeeklyPlan} disabled={planBusy} loading={planBusy}>
                      {s.retry}
                    </SecondaryButton>
                  </div>
                )}

                {weeklyPlan && (
                  <Panel style={{ marginTop: 20 }}>
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                      <Label>{s.weeklyPlanTitle}</Label>
                      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                        <GhostButton
                          onClick={handlePlanCopy}
                          active={planCopied}
                          icon={planCopied ? <CopyCheck size={14} /> : <Copy size={14} />}
                        >
                          {planCopied ? s.copied : s.copy}
                        </GhostButton>
                        <GhostButton onClick={handleSavePdf} icon={<FileDown size={14} />}>
                          {s.savePdf}
                        </GhostButton>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                      {weeklyPlan.map((week) => (
                        <div key={week.weekNumber} style={{ display: "flex", gap: 14 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: "50%",
                              background: COLORS.panel,
                              border: `2px solid ${COLORS.amber}`,
                              color: COLORS.amber,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 13,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {week.weekNumber}
                          </div>
                          <div style={{ flex: 1 }}>
                            <p style={{ margin: "4px 0 8px 0", fontSize: 13, color: COLORS.inkSoft }}>
                              {s.weekLabel} {week.weekNumber}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                              {week.tasks.map((task, i) => (
                                <div key={i}>
                                  <p style={{ margin: "0 0 4px 0", fontSize: 15, lineHeight: 1.7 }}>{task.title}</p>
                                  <span
                                    style={{
                                      fontSize: 12,
                                      padding: "3px 10px",
                                      borderRadius: 20,
                                      background: "#EEF0E5",
                                      color: COLORS.pineDark,
                                      border: `1px solid ${COLORS.border}`,
                                    }}
                                  >
                                    {task.relatedSkill}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Panel>
                )}
              </>
            )}
            </ResultBoundary>
          </div>
        )}
      </div>

      {showPrintout &&
        createPortal(
          <PlanPrintout dir={s.dir} t={s} title={planDocTitle} weeks={weeklyPlan} />,
          document.body
        )}
    </div>
  );
}
