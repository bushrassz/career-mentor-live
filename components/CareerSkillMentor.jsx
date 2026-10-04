"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { extractJson } from "@/lib/extract-json";
import {
  FileDown,
  Check,
  Compass,
  Loader2,
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
  TrendingUp,
  FileText,
  Users,
  CalendarDays,
  CloudUpload,
  CircleCheck,
  CircleAlert,
  FileUp,
  ExternalLink,
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

// The redesign's palette (from the design handoff's tokens). The journey rail keeps COLORS.pine:
// its values follow the live site, not the handoff. The handoff's
// error colours are oklch(); these are their sRGB equivalents, for browsers without oklch().
const UI = {
  page: "#F5F0E6",
  surface: "#FFFDF8",
  dropzone: "#F8F5EE",
  border: "#E4DDCF",
  borderSoft: "#EDE6D8",
  borderStrong: "#CFC6B4",
  text: "#1C2420",
  muted: "#5B655F",
  primary: "#1F4D3A",
  primaryTint: "#E3EBE4",
  primarySoft: "#9DB1A3",
  selected: "#F4F7F2",
  noticeBg: "#F1EADB",
  noticeFg: "#5B4E36",
  error: "#A03F3C",
  errorStrong: "#822B2A",
  errorBg: "#FFECE9",
  shadowDoc: "0 18px 40px -28px rgba(31,77,58,.35)",
};

// ---------- i18n ----------
const STRINGS = {
  ar: {
    dir: "rtl",
    appTitle: "مرشدك المهني",
    brandLetter: "م",
    startOver: "ابدأ من جديد",
    inputHeading: "من سيرتك الذاتية إلى خطوتك المهنية الجاية",
    inputSub: "ارفع سيرتك أو اكتب عن نفسك، ونحلّل مهاراتك ونقترح لك طريقاً واضحاً.",
    journeyUpload: "ارفع سيرتك الذاتية",
    journeyAnalyze: "نحلّل مهاراتك",
    journeyAnalyzeNote: "كلماتك المفتاحية ومجالك الحالي",
    journeyChoose: "تختار خطوتك الجاية",
    newBadge: "جديد",
    sourceLabel: "التحليل مبني على",
    typedSource: "نص كتبته",
    previewTitle: "خياراتك بعد التحليل",
    previewOptions: [
      { title: "مجالات جديدة تناسبك", desc: "بناءً على مهاراتك" },
      { title: "تعمّق في مجالك", desc: "مهارات وشهادات متقدمة" },
      { title: "سيرة ذاتية أقوى", desc: "نبذة ونصائح صياغة" },
      { title: "منتور حقيقي مجاناً", desc: "جلسات عبر ADPList" },
      { title: "خطة أسابيع لمجال تختاره", desc: "مهام أسبوعية واضحة" },
    ],
    dropTitle: "اسحب سيرتك هنا أو اختر ملفاً",
    dropTitleTouch: "اختر ملف سيرتك الذاتية",
    uploadLabel: "PDF أو صورة أو ملف Word (docx) — حتى 3\u00A0ميجابايت",
    chooseFile: "اختر ملف",
    changeFile: "اختر ملفاً آخر",
    altWritePrompt: "ما عندك ملف؟",
    altWriteLink: "اكتب عن نفسك بدلاً من ذلك",
    altUploadPrompt: "عندك ملف سيرة ذاتية؟",
    altUploadLink: "ارفعه بدلاً من ذلك",
    privacyNote: "هذه أداة تجريبية للتعلم — لا تُخزَّن بياناتك، لكنها تُعالج عبر خدمات AI خارجية.",
    writeLabel: "اكتب مهاراتك، خبرتك، ومجالك الحالي",
    writePlaceholder:
      "مثال: إدارة منتج، بناء منتجات من الصفر، تنسيق فرق، Figma، SQL أساسي. أعمل حالياً في مجال إدارة المنتجات بالقطاع الحكومي.",
    errUnsupportedFile: "صيغة الملف غير مدعومة. استخدم PDF أو صورة أو Word (docx).",
    errFileTooLarge: "حجم الملف أكبر من الحد المسموح (3 ميجابايت). جرّب ضغط ملف الـPDF أو تصغير الصورة (مثلاً لقطة شاشة لسيرتك)، أو اختر «اكتب عن نفسك بدلاً من ذلك» والصق نص سيرتك.",
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
    backToOptions: "رجوع للخيارات",
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
    noGaps: "ما لقينا فجوات واضحة لهذا المجال.",
    generatePlan: "ولّد لي خطة أسابيع",
    generatingPlan: "يولّد الخطة...",
    weeklyPlanTitle: "خطة الأسابيع",
    weekLabel: "الأسبوع",
    skillLabel: "المهارة: ",
    savePdf: "حفظ PDF",
    printBlocked: "المتصفح يمنع الطباعة المتكررة مؤقتاً بعد محاولة سابقة. انتظر بضع ثوانٍ ثم اضغط «حفظ PDF» مرة ثانية.",
    retry: "حاول مرة ثانية",
    copyBioLabel: "النبذة:\n",
    copyTipsLabel: "\nنصائح:\n",
    copyStrengthsLabel: "نقاط القوة:\n",
    copyGapsLabel: "\nالفجوات وخطة العمل:\n",
  },
  en: {
    dir: "ltr",
    appTitle: "Career Mentor",
    brandLetter: "C",
    startOver: "Start Over",
    inputHeading: "From your resume to your next career move",
    inputSub: "Upload your resume or describe yourself, and we'll analyze your skills and suggest a clear path.",
    journeyUpload: "Upload your resume",
    journeyAnalyze: "We analyze your skills",
    journeyAnalyzeNote: "Your keywords and current field",
    journeyChoose: "Pick your next step",
    newBadge: "New",
    sourceLabel: "Analysis based on",
    typedSource: "Text you wrote",
    previewTitle: "Your options after the analysis",
    previewOptions: [
      { title: "Fields that fit you", desc: "Based on your skills" },
      { title: "Go deeper in your field", desc: "Advanced skills and certificates" },
      { title: "A stronger resume", desc: "Bio and writing tips" },
      { title: "A real mentor, free", desc: "Sessions via ADPList" },
      { title: "A weekly plan for any field", desc: "Clear weekly tasks" },
    ],
    dropTitle: "Drop your resume here or choose a file",
    dropTitleTouch: "Choose your resume file",
    uploadLabel: "PDF, image, or Word file (docx) — up to 3\u00A0MB",
    chooseFile: "Choose file",
    changeFile: "Choose another file",
    altWritePrompt: "No file?",
    altWriteLink: "Describe yourself instead",
    altUploadPrompt: "Have a resume file?",
    altUploadLink: "Upload it instead",
    privacyNote: "This is an experimental learning tool — your data isn't stored, but it is processed by external AI services.",
    writeLabel: "Write your skills, experience, and current field",
    writePlaceholder:
      "Example: Product management, building products from scratch, coordinating teams, Figma, basic SQL. I currently work in product management in the public sector.",
    errUnsupportedFile: "Unsupported file format. Use PDF, an image, or Word (docx).",
    errFileTooLarge: "This file is over the 3 MB limit. Try compressing the PDF or using a smaller image (a screenshot of your resume works), or choose “Describe yourself instead” and paste your resume's text.",
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
    backToOptions: "Back to options",
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
    noGaps: "We didn't find any clear gaps for this field.",
    generatePlan: "Generate a weekly plan",
    generatingPlan: "Generating the plan...",
    weeklyPlanTitle: "Weekly plan",
    weekLabel: "Week",
    skillLabel: "Skill: ",
    savePdf: "Save PDF",
    printBlocked: "Your browser is briefly blocking repeated print requests after an earlier attempt. Wait a few seconds, then press “Save PDF” again.",
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
// Drawn with the same proportions as the preview cards' icon tiles (radius ≈ 26% of the size, icon
// half the size, 1.9 stroke), so the two read as one family at any size. The colors already match;
// at 84px the tint simply covered enough area to look far brighter than the cards' 38px tiles.
function Emblem({ type, size = 48 }) {
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
        borderRadius: Math.round(size * 0.26),
        background: p.bg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
    >
      <Icon size={Math.round(size * 0.5)} color={p.fg} strokeWidth={1.9} />
    </div>
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

// The real ceiling is Vercel's: it rejects function request bodies over ~4.3 MB with a plain-text
// 413 before our code runs (a 3 MB file, 4 MB once base64-encoded, gets through; 3.3 MB does not).
// 3 MB leaves room for the encoding and the instruction text. Keep MAX_REQUEST_BYTES in
// lib/openrouter.js in step.
const MAX_FILE_BYTES = 3 * 1024 * 1024;

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
  // Checked before parsing: Vercel's own 413 for an oversized body is plain text, not JSON.
  if (response.status === 413) {
    const err = new Error("request-too-large");
    err.code = "too-large";
    throw err;
  }
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

const VALIDATION_FAILURES = new Set(["no-json-found", "malformed-shape", "wrong-language"]);

// Tells the server which check a reply failed, so the rejection shows up in its logs: /api/mentor
// has already returned 200 by the time the browser rejects a reply. Only the source, the kind and
// the attempt number are sent — never the reply or the CV — and a failed report is ignored.
function reportValidationFailure(source, err, attempt) {
  const kind = VALIDATION_FAILURES.has(err?.message)
    ? err.message
    : err instanceof SyntaxError
      ? "invalid-json"
      : null;
  if (!kind || !source) return; // network and HTTP errors are already logged by the server
  fetch("/api/mentor/client-failure", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source, kind, attempt }),
    keepalive: true,
  }).catch(() => {});
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
//
// `proseOf` narrows the check to the fields that are sentences. Without it every string counts, so
// a reply whose summary is correctly Arabic was rejected when its keywords were English — tool
// names by design, and sometimes skill phrases the vision model copied from an English CV.
function matchesLanguage(parsed, lang, proseOf) {
  const text = collectStrings(proseOf ? proseOf(parsed) : parsed).join(" ");
  const arabicChars = (text.match(/[؀-ۿ]/g) || []).length;
  const latinLetters = (text.match(/[A-Za-z]/g) || []).length;
  if (lang === "ar") return arabicChars >= 10 && arabicChars > latinLetters;
  return arabicChars < 3;
}

// Retries a failed response or truncated/malformed JSON up to `attempts` times
// (1 initial try + up to 2 automatic retries) before giving up. Never throws synchronously —
// every failure mode (network, non-JSON body, truncated/malformed JSON, failed validation)
// is funneled through the same catch so the caller's try/catch always sees a normal rejection.
async function callClaudeAndParse(contentBlocks, maxTokens, validate, lang, source, proseOf, attempts = 3) {
  let lastErr = new Error("unknown-error");
  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      const raw = await callClaude(contentBlocks, maxTokens);
      const parsed = extractJson(raw);
      if (!validate(parsed)) throw new Error("malformed-shape");
      // Checked separately from the shape: the model sometimes returns a perfectly valid object
      // that simply mirrors an uploaded document's language instead of the requested one, and
      // reporting that as "malformed" sends anyone debugging it down the wrong path.
      if (!matchesLanguage(parsed, lang, proseOf)) throw new Error("wrong-language");
      return parsed;
    } catch (err) {
      lastErr = err;
      // The same file will fail the same way again, so these skip the retries.
      if (err.code === "scanned-pdf" || err.code === "too-large") throw err;
      reportValidationFailure(source, err, attempt + 1);
      if (attempt < attempts - 1) await sleep(600);
    }
  }
  throw lastErr;
}

// ---------- small UI atoms ----------
function PrimaryButton({ children, onClick, disabled, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={disabled ? "" : "cm-btn"}
      style={{
        fontFamily: "var(--font-cairo), sans-serif",
        fontSize: 15,
        fontWeight: 700,
        minHeight: 46,
        padding: "0 22px",
        background: disabled ? UI.primarySoft : UI.primary,
        color: "#fff",
        border: "none",
        borderRadius: 12,
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
        fontWeight: 700,
        minHeight: 46,
        padding: "0 22px",
        background: "transparent",
        color: disabled ? UI.muted : UI.primary,
        border: `1px solid ${disabled ? UI.border : UI.primary}`,
        borderRadius: 12,
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
        border: `1px solid ${UI.borderStrong}`,
        borderRadius: 999,
        minHeight: 36,
        padding: "0 14px",
        fontSize: 13,
        fontWeight: 600,
        color: active ? UI.primary : UI.muted,
        cursor: "pointer",
        fontFamily: "var(--font-cairo), sans-serif",
      }}
    >
      {icon}
      {children}
    </button>
  );
}

// One stop on the journey rail, the app's single progress indicator. The rail is the first grid
// column, so it sits on the start side in both directions — right in Arabic, left in English —
// with no per-language code. Done: filled circle with a check and a solid line after it.
// Current: filled circle with its number. Upcoming: outlined circle, dashed line.
function JourneyStep({ number, state, last, title, note, noteIsName, children }) {
  const filled = state !== "upcoming";
  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "28px minmax(0, 1fr)", columnGap: 12 }}
      aria-current={state === "current" ? "step" : undefined}
    >
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} aria-hidden="true">
        <span
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            flexShrink: 0,
            background: filled ? COLORS.pine : COLORS.panel,
            color: filled ? "#fff" : COLORS.pine,
            border: `2px solid ${COLORS.pine}`,
          }}
        >
          {state === "done" ? <Check size={14} strokeWidth={3} /> : number}
        </span>
        {!last && (
          <span
            style={{
              flex: 1,
              minHeight: 16,
              margin: "6px 0",
              borderInlineStart: state === "done" ? `2px solid ${COLORS.pine}` : "2px dashed #9DBFB1",
            }}
          />
        )}
      </div>
      <div style={{ minWidth: 0, paddingBottom: last ? 0 : 18 }}>
        <p
          style={{
            margin: children ? "3px 0 12px 0" : "3px 0 0 0",
            // A label for the step, deliberately lighter than the buttons and cards inside it;
            // the circle, not the title, carries the step's state.
            fontSize: 13,
            fontWeight: 600,
            color: COLORS.inkSoft,
            lineHeight: 1.5,
          }}
        >
          {title}
          {note && (
            <>
              {" — "}
              {/* A file name keeps its own direction (bdi + plaintext), so its extension stays at its end. */}
              <bdi style={{ fontSize: 13, fontWeight: 400, color: COLORS.inkSoft, overflowWrap: "anywhere", unicodeBidi: noteIsName ? "plaintext" : undefined }}>
                {note}
              </bdi>
            </>
          )}
        </p>
        {children}
      </div>
    </div>
  );
}

// What the five options look like before anything is uploaded. Indexes match
// STRINGS[lang].previewOptions; the palettes are the Emblem ones, so no new colors enter the app.
const PREVIEW_CARDS = [
  { Icon: Compass, bg: "#E1F0EA", fg: "#2F6B57" },
  { Icon: TrendingUp, bg: "#E4E8F5", fg: "#4A5FA3" },
  { Icon: FileText, bg: "#EEE7F5", fg: "#7A5A9E" },
  { Icon: Users, bg: "#F6E9D9", fg: "#C9863D" },
  { Icon: CalendarDays, bg: "#E1F0EA", fg: "#2F6B57", featured: true },
];

// Deliberately not a button — no arrow, no hover lift — so it doesn't read as something to pick
// before a CV has been analyzed. The badge sits inline at the row's end, so it needs no physical
// left/right positioning to land on the correct side in either direction.
function PreviewRow({ Icon, bg, fg, featured, title, desc, badge }) {
  return (
    <div
      role="listitem"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: featured ? "12px" : "12px 2px",
        // Plain rows set no border inline, so .cm-preview-list can draw the dividers between them.
        ...(featured && {
          background: UI.selected,
          border: `1.5px solid ${COLORS.pine}`,
          borderRadius: 12,
          marginTop: 6,
        }),
      }}
    >
      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 36,
          borderRadius: 9,
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={fg} strokeWidth={1.9} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 14, fontWeight: 700, lineHeight: 1.5, color: featured ? UI.primary : UI.text }}>{title}</p>
        <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.5, color: UI.muted }}>{desc}</p>
      </div>
      {featured && (
        <span
          style={{
            flexShrink: 0,
            background: COLORS.amber,
            color: "#fff",
            fontSize: 11,
            fontWeight: 700,
            lineHeight: 1.7,
            padding: "0 10px",
            borderRadius: 999,
            whiteSpace: "nowrap",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// The privacy line, set as a notice rather than small print: it says what happens to the CV.
function SaveNotice({ children }) {
  return (
    <p
      role="note"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        margin: 0,
        padding: "10px 12px",
        background: UI.noticeBg,
        color: UI.noticeFg,
        fontSize: 13,
        lineHeight: 1.7,
        borderRadius: 12,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 18,
          height: 18,
          marginTop: 2,
          flexShrink: 0,
          borderRadius: "50%",
          border: "1.5px solid currentColor",
          boxSizing: "border-box",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        !
      </span>
      {children}
    </p>
  );
}

function ErrorNote({ children }) {
  return (
    <p
      role="alert"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 8,
        margin: 0,
        padding: "10px 12px",
        background: UI.errorBg,
        color: UI.errorStrong,
        fontSize: 14,
        lineHeight: 1.8,
        borderRadius: 12,
      }}
    >
      <CircleAlert size={18} color={UI.error} aria-hidden="true" style={{ flexShrink: 0, marginTop: 3 }} />
      {children}
    </p>
  );
}

function FieldLabel({ children, htmlFor }) {
  return (
    <label htmlFor={htmlFor} style={{ display: "block", fontSize: 14, fontWeight: 700, color: UI.text, margin: "0 0 8px 0" }}>
      {children}
    </label>
  );
}

const FIELD_STYLE = {
  width: "100%",
  minHeight: 46,
  boxSizing: "border-box",
  fontFamily: "var(--font-cairo), sans-serif",
  fontSize: 16,
  lineHeight: 1.7,
  padding: "8px 14px",
  border: `1px solid ${UI.borderStrong}`,
  borderRadius: 12,
  background: "#fff",
  color: UI.text,
};

function formatFileSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// What the analysis was built from: the uploaded file's name, type and size, or a note that the
// text was typed in.
function SourceCard({ label, name, isFile, size }) {
  const ext = isFile ? (name.split(".").pop() || "").toUpperCase() : "";
  return (
    <div style={{ background: UI.surface, border: `1px solid ${UI.border}`, borderRadius: 14, padding: 16 }}>
      <p style={{ margin: "0 0 10px 0", fontSize: 13, fontWeight: 600, color: UI.muted }}>{label}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: 9,
            background: UI.primaryTint,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          {isFile ? <FileText size={18} color={UI.primary} /> : <Pencil size={17} color={UI.primary} />}
        </span>
        <div style={{ minWidth: 0 }}>
          <p
            title={name}
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 700,
              color: UI.text,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              unicodeBidi: isFile ? "plaintext" : undefined,
            }}
          >
            {name}
          </p>
          {isFile && size > 0 && (
            <p style={{ margin: 0, fontSize: 12, color: UI.muted }}>
              <span dir="ltr">
                {ext} · {formatFileSize(size)}
              </span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Each gap's colour, by its position in the gap list: the handoff's six hues (its oklch values in
// sRGB), repeating after six. The number drawn on top is what really tells gaps apart, so the
// repeat, colour blindness and black-and-white printing don't lose anything.
const GAP_COLORS = [
  { fg: "#2C6C47", tint: "#DCF2E3" },
  { fg: "#825023", tint: "#FBE7D8" },
  { fg: "#32618E", tint: "#DDEDFF" },
  { fg: "#89474D", tint: "#FFE4E5" },
  { fg: "#665189", tint: "#EEE7FD" },
  { fg: "#006C72", tint: "#D5F2F3" },
];
const UNKNOWN_GAP_COLOR = { fg: UI.muted, tint: "#ECE8DF" };

function gapColor(index) {
  return index >= 0 ? GAP_COLORS[index % GAP_COLORS.length] : UNKNOWN_GAP_COLOR;
}

// The numbered circle that marks list items. Filled by default; `outline` for plain numbered lists.
function NumberBadge({ n, color = UI.primary, outline }) {
  return (
    <span
      style={{
        width: 32,
        height: 32,
        borderRadius: "50%",
        boxSizing: "border-box",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
        fontSize: 14,
        fontWeight: 800,
        background: outline ? UI.surface : color,
        color: outline ? color : "#fff",
        border: outline ? `1.5px solid ${color}` : "none",
      }}
    >
      {n}
    </span>
  );
}

// A badge on a vertical line, with its content beside it. The line runs on the start side in both
// directions because it is the grid's first column.
function RailItem({ badge, last, children }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "32px minmax(0, 1fr)", columnGap: 12 }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} aria-hidden="true">
        {badge}
        {!last && <span style={{ flex: 1, width: 2, margin: "4px 0", background: UI.border, borderRadius: 1 }} />}
      </div>
      <div style={{ minWidth: 0, paddingBottom: last ? 0 : 20 }}>{children}</div>
    </div>
  );
}

function SectionTitle({ children, style }) {
  return <h2 style={{ margin: "0 0 12px 0", fontSize: 17, fontWeight: 800, color: UI.text, ...style }}>{children}</h2>;
}

// One bordered list, rows divided by a hairline, each with a filled check.
function CheckList({ items }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, background: UI.surface, border: `1px solid ${UI.border}`, borderRadius: 12 }}>
      {items.map((text, i) => (
        <li
          key={i}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            borderTop: i === 0 ? "none" : `1px solid ${UI.borderSoft}`,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 22,
              height: 22,
              marginTop: 2,
              borderRadius: "50%",
              background: UI.primary,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Check size={13} color="#fff" strokeWidth={3} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 500, lineHeight: 1.7, color: UI.text }}>{text}</span>
        </li>
      ))}
    </ul>
  );
}

// The gap a task serves: its number in a dot of the gap's colour, then its name on the gap's tint.
// A flex box that never grows past its column, so a long gap name wraps inside one rounded chip
// instead of painting ragged per-line fragments (the inline-span bug fixed earlier on phones).
function GapChip({ index, name }) {
  const c = gapColor(index);
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "flex-start",
        gap: 6,
        maxWidth: "100%",
        boxSizing: "border-box",
        verticalAlign: "top",
        paddingBlock: 3,
        paddingInline: "3px 10px",
        borderRadius: 14,
        background: c.tint,
        color: c.fg,
        fontSize: 12,
        fontWeight: 600,
        lineHeight: 1.55,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          marginTop: 1.5,
          borderRadius: "50%",
          background: c.fg,
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: 10,
          fontWeight: 800,
          lineHeight: 1,
        }}
      >
        {index >= 0 ? index + 1 : "–"}
      </span>
      <span style={{ minWidth: 0, overflowWrap: "anywhere" }}>{name}</span>
    </span>
  );
}

// The lighter, secondary way in under the upload drop zone (and back again): a text link, so the
// drop zone's green button stays the one obvious primary action.
function AltInputLink({ prompt, label, onClick, Icon }) {
  return (
    <p
      style={{
        margin: "12px 0 0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexWrap: "wrap",
        gap: 6,
        fontSize: 13.5,
        color: UI.muted,
      }}
    >
      <Icon size={14} color={UI.primary} aria-hidden="true" />
      {prompt}
      <button
        type="button"
        onClick={onClick}
        style={{
          background: "none",
          border: "none",
          padding: "6px 2px",
          color: UI.primary,
          fontSize: 13.5,
          fontWeight: 700,
          textDecoration: "underline",
          textUnderlineOffset: 3,
          cursor: "pointer",
          fontFamily: "var(--font-cairo), sans-serif",
        }}
      >
        {label}
      </button>
    </p>
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

// ---------- language toggle ----------
function LanguageToggle({ lang, setLang }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        border: `1px solid ${UI.borderStrong}`,
        borderRadius: 999,
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
            fontSize: 13,
            fontWeight: 600,
            minHeight: 28,
            padding: "0 12px",
            borderRadius: 999,
            border: "none",
            background: lang === l ? UI.primary : "transparent",
            color: lang === l ? "#fff" : UI.muted,
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
          <ErrorNote>{this.props.message}</ErrorNote>
          <div style={{ marginTop: 12 }}>
            <PrimaryButton onClick={this.props.onReset}>{this.props.backLabel}</PrimaryButton>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
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
  const [dragActive, setDragActive] = useState(false);
  const [manualText, setManualText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileSize, setFileSize] = useState(0); // shown beside the file name on the options screen
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
  const [printBlocked, setPrintBlocked] = useState(false);
  const lastPrintAttemptAt = useRef(0);
  const printCheckTimer = useRef(null);

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

  // Shared by the file picker and drag-and-drop onto the drop zone.
  async function processFile(file) {
    if (!file) return;
    setError("");
    if (file.size > MAX_FILE_BYTES) {
      setError(s.errFileTooLarge);
      setFileName("");
      setFileBlock(null);
      return;
    }
    setFileName(file.name);
    setFileSize(file.size);
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
        // Cleared so the drop zone doesn't show a rejected file with a success check.
        setError(s.errUnsupportedFile);
        setFileName("");
        setFileBlock(null);
      }
    } catch (err) {
      console.error(err);
      setError(s.errFileRead);
      setFileName("");
      setFileBlock(null);
    } finally {
      setBusy(false);
    }
  }

  function handleFile(e) {
    processFile(e.target.files[0]);
    e.target.value = ""; // lets the same file be picked again after an error
  }

  function handleDragOver(e) {
    e.preventDefault(); // required for the drop event to fire
    if (!dragActive) setDragActive(true);
  }

  function handleDragLeave(e) {
    if (!e.currentTarget.contains(e.relatedTarget)) setDragActive(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragActive(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  async function extractProfile() {
    setBusy(true);
    setError("");
    try {
      const instruction = `${languageDirective(lang)}اقرأ محتوى السيرة الذاتية أو النص المرفق، واستخرج بإيجاز شديد: 1) قائمة كلمات مفتاحية تلخص المهارات والأدوات (6-8 كلمات فقط)، 2) نبذة قصيرة جملة إلى جملتين بس عن الشخص، 3) المجال الوظيفي الحالي الأغلب بكلمتين إلى ثلاث.\n\nاكتب الكلمات المفتاحية بلغة الإجابة المطلوبة أعلاه: ترجم المهارات العامة (مثل إدارة الأداء، خدمة العملاء، قيادة الفريق) ولا تنسخها من السيرة بلغتها الأصلية، واترك بالإنجليزية فقط أسماء الأدوات والبرمجيات ولغات البرمجة (مثل Excel، SQL، Figma).\n\nأجب بصيغة JSON فقط بدون أي نص إضافي، ابدأ مباشرة بعلامة { وانتهِ بعلامة }، بهذا الشكل بالضبط: {"keywords": ["...", "..."], "bio": "...", "currentField": "..."}`;

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
        lang,
        "analyze",
        (p) => [p.bio, p.currentField]
      );
      setProfile(parsed);
      setStep("profile");
    } catch (err) {
      console.error(err);
      setError(
        err.code === "scanned-pdf" ? s.errScannedPdf : err.code === "too-large" ? s.errFileTooLarge : s.errAnalyze
      );
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
          lang,
          "option1"
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
          lang,
          "option2"
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
          lang,
          "option3"
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
        lang,
        "option5"
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
    setPrintBlocked(false);
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
      if (resultData.gaps.length === 0) out += `${s.noGaps}\n`;
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

  // Browsers fire `beforeprint` whenever the print dialog actually opens. Chrome silently ignores
  // window.print() for a while after a print dialog was cancelled (2s, doubling up to 32s), so a
  // call with no `beforeprint` after an earlier attempt means the request was held back — the
  // only signal a page gets, since the browser reports no error.
  const PRINT_OPEN_GRACE_MS = 1500;
  // Chrome's longest hold is 32s; a minute also covers the time the earlier dialog stayed open.
  const RECENT_PRINT_MS = 60 * 1000;

  function printPlan() {
    const now = Date.now();
    const hadRecentAttempt = now - lastPrintAttemptAt.current < RECENT_PRINT_MS;
    lastPrintAttemptAt.current = now;
    let opened = false;
    const onBeforePrint = () => {
      opened = true;
    };
    window.addEventListener("beforeprint", onBeforePrint, { once: true });
    window.print();
    clearTimeout(printCheckTimer.current);
    printCheckTimer.current = setTimeout(() => {
      window.removeEventListener("beforeprint", onBeforePrint);
      if (!opened && hadRecentAttempt) setPrintBlocked(true);
    }, PRINT_OPEN_GRACE_MS);
  }

  function handleSavePdf() {
    setPrintBlocked(false);
    // Called inside the click itself whenever possible: Safari ignores window.print() that runs
    // after the click has finished. Only when Cairo's Arabic or Latin subset is still loading is it
    // worth waiting, since printing then would fall back to another font.
    if (document.fonts.status === "loaded") printPlan();
    else document.fonts.ready.then(printPlan);
  }

  useEffect(() => () => clearTimeout(printCheckTimer.current), []);

  const adpListUrl = profile
    ? `https://adplist.org/mentors?search=${encodeURIComponent(profile.currentField || "product management")}`
    : "https://adplist.org";

  const sourceName = inputMode === "file" ? fileName : s.typedSource;

  const matchingFields = fieldQuery.trim()
    ? CAREER_FIELDS.filter((f) => f.toLowerCase().includes(fieldQuery.toLowerCase()))
    : [];

  return (
    <div
      dir={s.dir}
      style={{
        fontFamily: "var(--font-cairo), sans-serif",
        background: UI.page,
        minHeight: "100vh",
        color: UI.text,
      }}
    >
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }

        @keyframes cmFadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .cm-step-enter { animation: cmFadeUp 0.45s ease both; }


        .cm-btn { transition: transform 0.15s ease, box-shadow 0.15s ease, filter 0.15s ease; }
        .cm-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 10px rgba(32,74,61,0.25); filter: brightness(1.05); }
        .cm-btn:active { transform: translateY(0); }

        .cm-card { transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease; }
        .cm-card:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(30,42,47,0.08); border-color: ${UI.primary} !important; }


        .cm-input:focus { outline: none; border-color: ${UI.primary} !important; box-shadow: 0 0 0 3px rgba(31,77,58,0.12); }

        .cm-suggestion:hover:not(:disabled) { background: ${UI.surface} !important; border-color: ${UI.primary} !important; }

        .cm-drop:hover { border-color: ${UI.primary} !important; background: ${UI.selected} !important; }
        .cm-drop:focus-within { outline: 2px solid ${UI.primary}; outline-offset: 2px; }
        /* "Drop your resume here" only makes sense with a mouse; touch screens get "Choose your resume file". */
        .cm-drop-touch { display: none; }
        @media (hover: none) and (pointer: coarse) { .cm-drop-pointer { display: none; } .cm-drop-touch { display: inline; } }

        .cm-ghost:hover { background: #F1EDE0 !important; }

        .cm-secondary { transition: background 0.15s ease; }
        .cm-secondary:hover:not(:disabled) { background: #EAF1EE; }

        /* The back tab is drawn 34px tall; this invisible strip above it makes the tap target 44px. */
        .cm-back::before { content: ""; position: absolute; inset: -10px 0 0 0; }

        .cm-shell { max-width: 1040px; margin: 0 auto; padding-inline: 32px; box-sizing: border-box; }
        .cm-main { padding-block: 40px 56px; }
        .cm-upload-grid { display: grid; grid-template-columns: minmax(0, 1fr) 380px; gap: 40px; align-items: start; }
        .cm-hero-title { font-size: 40px; }
        .cm-input-card { padding: 24px; }
        .cm-drop { padding: 36px 24px; }
        .cm-preview-list > [role="listitem"]:not(:last-child):not(:nth-last-child(2)) { border-bottom: 1px solid ${UI.borderSoft}; }
        .cm-doc-grid { display: grid; grid-template-columns: minmax(0, 1fr) 288px; gap: 32px; align-items: start; }
        .cm-doc { background: ${UI.surface}; border: 1px solid ${UI.border}; border-radius: 18px; padding: 32px 36px; box-shadow: ${UI.shadowDoc}; }
        .cm-doc-aside { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 16px; }
        .cm-screen-title { font-size: 28px; }
        .cm-week { display: grid; grid-template-columns: 36px minmax(0, 1fr); column-gap: 14px; }
        .cm-week-badge { width: 36px; height: 36px; border-radius: 50%; background: ${UI.primary}; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; flex-shrink: 0; }
        .cm-week-title { font-size: 18px; }
        .cm-task-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; align-items: start; }
        @media (max-width: 899px) {
          .cm-doc-grid { grid-template-columns: minmax(0, 1fr); gap: 24px; }
          .cm-doc-aside { position: static; }
          .cm-doc { padding: 24px; }
          .cm-screen-title { font-size: 22px; }
          .cm-shell { padding-inline: 20px; }
          .cm-main { padding-block: 24px 40px; }
          .cm-upload-grid { grid-template-columns: minmax(0, 1fr); gap: 28px; }
          .cm-hero-title { font-size: 28px; }
        }
        @media (max-width: 600px) {
          .cm-input-card { padding: 16px; }
          /* Phones: the doc's content sits straight on the page, as in the handoff — except on the
             result screen, whose "Back to options" tab needs the card's edge to attach to. */
          .cm-doc { background: none; border: none; border-radius: 0; padding: 0; box-shadow: none; }
          .cm-doc.cm-doc-keep { background: ${UI.surface}; border: 1px solid ${UI.border}; border-radius: 18px; padding: 18px 14px; box-shadow: ${UI.shadowDoc}; }
          .cm-week { grid-template-columns: 32px minmax(0, 1fr); column-gap: 10px; }
          .cm-week-badge { width: 32px; height: 32px; font-size: 14px; }
          .cm-week-title { font-size: 16px; }
          .cm-task-grid { grid-template-columns: minmax(0, 1fr); }
          .cm-plan-actions { width: 100%; }
          .cm-plan-actions > button { flex: 1; justify-content: center; white-space: nowrap; padding: 0 12px !important; }
          .cm-drop { padding: 28px 16px; }
          .cm-brand-name { font-size: 15px !important; }
          .cm-brand-name-compact { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
          /* P1: on phones the five options become compact rows — icon and title; the description,
             which wrapped each card to 90px+, shows only on wider screens. */
          .cm-opt-list { gap: 8px !important; }
          .cm-opt { padding: 10px 12px !important; gap: 10px !important; min-height: 52px; }
          .cm-opt-desc { display: none; }
          .cm-opt-title { font-size: 15px !important; }
          .cm-opt-icon { width: 30px !important; height: 30px !important; border-radius: 8px !important; }
        }

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
      <header style={{ borderBottom: `1px solid ${UI.border}` }}>
        <div className="cm-shell" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap", paddingBlock: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              aria-hidden="true"
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: UI.primary,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 15,
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {s.brandLetter}
            </span>
            {/* On phones, once "Start over" joins the bar there's no room for the name: the "م" circle
                stands in for it, and the name stays readable to screen readers. */}
            <span className={`cm-brand-name${step !== "input" ? " cm-brand-name-compact" : ""}`} style={{ fontSize: 17, fontWeight: 800, color: UI.text }}>
              {s.appTitle}
            </span>
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
                  border: `1px solid ${UI.borderStrong}`,
                  borderRadius: 999,
                  minHeight: 32,
                  padding: "0 12px",
                  fontSize: 13,
                  fontWeight: 600,
                  color: UI.muted,
                  cursor: "pointer",
                  fontFamily: "var(--font-cairo), sans-serif",
                }}
              >
                <RotateCcw size={14} aria-hidden="true" /> {s.startOver}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="cm-shell cm-main">
      <div>
        {step === "input" && (
          <div className="cm-step-enter cm-upload-grid">
            <div style={{ minWidth: 0 }}>
            <h1 className="cm-hero-title" style={{ fontWeight: 800, margin: "0 0 10px 0", lineHeight: 1.4, color: UI.text }}>
              {s.inputHeading}
            </h1>
            <p style={{ color: UI.muted, fontSize: 17, lineHeight: 1.85, margin: "0 0 28px 0", maxWidth: 560 }}>
              {s.inputSub}
            </p>

            <JourneyStep number={1} state="current" title={s.journeyUpload}>
            <div
              className="cm-input-card"
              style={{
                background: UI.surface,
                border: `1px solid ${UI.border}`,
                borderRadius: 18,
                boxShadow: UI.shadowDoc,
              }}
            >
            {/* Upload is the primary path, so it gets the large drop zone and the green button;
                writing it yourself is the alternative, offered as a lighter link underneath. The
                whole zone is the file input's <label>, so a tap or click anywhere opens the picker,
                and on desktop a file can also be dropped onto it. */}
            {inputMode === "file" ? (
              <div>
                <label
                  className={`cm-drop${dragActive ? " cm-drop-active" : ""}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  style={{
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 8,
                    border: `1.5px dashed ${dragActive ? UI.primary : UI.primarySoft}`,
                    borderRadius: 14,
                    background: dragActive ? UI.selected : UI.dropzone,
                    cursor: "pointer",
                    transition: "border-color 0.15s ease, background 0.15s ease",
                  }}
                >
                  <span
                    aria-hidden="true"
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 12,
                      background: UI.primaryTint,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: 4,
                    }}
                  >
                    {fileName ? <CircleCheck size={24} color={UI.primary} /> : <CloudUpload size={24} color={UI.primary} />}
                  </span>
                  {/* plaintext: a file name keeps its own direction, so "السيرة.pdf" doesn't show its
                      extension on the wrong side in the English interface (or vice versa). */}
                  <span style={{ fontSize: 16, fontWeight: 700, color: UI.text, overflowWrap: "anywhere", unicodeBidi: fileName ? "plaintext" : undefined }}>
                    {fileName || (
                      <>
                        <span className="cm-drop-pointer">{s.dropTitle}</span>
                        <span className="cm-drop-touch">{s.dropTitleTouch}</span>
                      </>
                    )}
                  </span>
                  <span style={{ fontSize: 13, color: UI.muted }}>{s.uploadLabel}</span>
                  <span
                    className="cm-btn"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 8,
                      minHeight: 46,
                      padding: "0 22px",
                      borderRadius: 12,
                      background: UI.primary,
                      color: "#fff",
                      fontSize: 15,
                      fontWeight: 700,
                    }}
                  >
                    <FileUp size={17} aria-hidden="true" />
                    {fileName ? s.changeFile : s.chooseFile}
                  </span>
                  {/* Visually hidden rather than display:none, so keyboard users can Tab to it; the zone's
                      :focus-within outline then shows where focus is. */}
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.docx"
                    onChange={handleFile}
                    style={{ position: "absolute", width: 1, height: 1, opacity: 0, overflow: "hidden", pointerEvents: "none" }}
                  />
                </label>
                <AltInputLink Icon={Pencil} prompt={s.altWritePrompt} label={s.altWriteLink} onClick={() => setInputMode("text")} />
              </div>
            ) : (
              <div>
                <label htmlFor="cm-manual" style={{ display: "block", fontSize: 14, fontWeight: 700, color: UI.text, margin: "0 0 10px 0" }}>
                  {s.writeLabel}
                </label>
                <textarea
                  id="cm-manual"
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  rows={6}
                  placeholder={s.writePlaceholder}
                  className="cm-input"
                  style={{
                    width: "100%",
                    minHeight: 168,
                    boxSizing: "border-box",
                    resize: "vertical",
                    fontFamily: "var(--font-cairo), sans-serif",
                    fontSize: 15,
                    lineHeight: 1.8,
                    padding: "12px 14px",
                    border: `1px solid ${UI.borderStrong}`,
                    borderRadius: 12,
                    background: "#fff",
                    color: UI.text,
                  }}
                />
                <AltInputLink Icon={FileUp} prompt={s.altUploadPrompt} label={s.altUploadLink} onClick={() => setInputMode("file")} />
              </div>
            )}
            {error && (
              <div style={{ marginTop: 14 }}>
                <ErrorNote>{error}</ErrorNote>
              </div>
            )}

            <div style={{ marginTop: 18 }}>
              <PrimaryButton onClick={extractProfile} disabled={busy} loading={busy}>
                {busy ? s.analyzing : s.next}
              </PrimaryButton>
            </div>
            </div>
            </JourneyStep>

            <JourneyStep number={2} state="upcoming" title={s.journeyAnalyze} note={s.journeyAnalyzeNote} />
            <JourneyStep number={3} state="upcoming" last title={s.journeyChoose} />

            <div style={{ marginTop: 24 }}>
              <SaveNotice>{s.privacyNote}</SaveNotice>
            </div>
            </div>

            {/* What the five options look like before anything is uploaded: beside the form on wide
                screens, after it on phones. */}
            <aside
              aria-labelledby="cm-preview-title"
              style={{
                background: UI.surface,
                border: `1px solid ${UI.border}`,
                borderRadius: 18,
                padding: 24,
                boxShadow: UI.shadowDoc,
              }}
            >
              <h2
                id="cm-preview-title"
                style={{ margin: 0, paddingBottom: 14, borderBottom: `1px solid ${UI.border}`, fontSize: 17, fontWeight: 800, color: UI.text }}
              >
                {s.previewTitle}
              </h2>
              <div className="cm-preview-list" role="list" style={{ paddingTop: 6 }}>
                {PREVIEW_CARDS.map((card, i) => (
                  <PreviewRow
                    key={i}
                    {...card}
                    title={s.previewOptions[i].title}
                    desc={s.previewOptions[i].desc}
                    badge={s.newBadge}
                  />
                ))}
              </div>
            </aside>
          </div>
        )}

        {step === "profile" && profile && (
          <div className="cm-step-enter cm-doc-grid">
            <div className="cm-doc">
            <JourneyStep number={1} state="done" title={s.journeyUpload} note={sourceName} noteIsName={inputMode === "file"} />
            <JourneyStep number={2} state="done" title={s.journeyAnalyze}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
              <Emblem type={getArchetypeKey(profile.currentField)} />
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: "0 0 2px 0", fontSize: 13, color: UI.muted }}>{s.currentFieldLabel}</p>
                <h1 className="cm-screen-title" style={{ margin: 0, fontWeight: 800, lineHeight: 1.4, color: UI.text }}>
                  {profile.currentField}
                </h1>
              </div>
            </div>

            <div style={{ paddingBottom: 20, marginBottom: 20, borderBottom: `1px solid ${UI.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                <h2 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: UI.muted }}>{s.extractedBioLabel}</h2>
                {!editingProfile && (
                  <button
                    onClick={startEditProfile}
                    className="cm-ghost"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      background: "none",
                      border: `1px solid ${UI.borderStrong}`,
                      borderRadius: 999,
                      minHeight: 32,
                      padding: "0 12px",
                      fontSize: 13,
                      fontWeight: 600,
                      color: UI.primary,
                      cursor: "pointer",
                      fontFamily: "var(--font-cairo), sans-serif",
                    }}
                  >
                    <Pencil size={13} /> {s.edit}
                  </button>
                )}
              </div>

              {editingProfile ? (
                <div>
                  <textarea
                    value={editDraft.bio}
                    onChange={(e) => setEditDraft({ ...editDraft, bio: e.target.value })}
                    rows={3}
                    aria-label={s.extractedBioLabel}
                    className="cm-input"
                    style={{ ...FIELD_STYLE, resize: "vertical", marginBottom: 14 }}
                  />
                  <FieldLabel>{s.currentFieldEditLabel}</FieldLabel>
                  <input
                    value={editDraft.currentField}
                    onChange={(e) => setEditDraft({ ...editDraft, currentField: e.target.value })}
                    className="cm-input"
                    style={{ ...FIELD_STYLE, marginBottom: 14 }}
                  />
                  <FieldLabel>{s.keywordsEditLabel}</FieldLabel>
                  <input
                    value={editDraft.keywords}
                    onChange={(e) => setEditDraft({ ...editDraft, keywords: e.target.value })}
                    className="cm-input"
                    style={{ ...FIELD_STYLE, marginBottom: 16 }}
                  />
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <PrimaryButton onClick={saveEditProfile}>{s.save}</PrimaryButton>
                    <button
                      onClick={() => setEditingProfile(false)}
                      style={{
                        fontFamily: "var(--font-cairo), sans-serif",
                        fontSize: 14,
                        fontWeight: 600,
                        minHeight: 44,
                        padding: "0 12px",
                        color: UI.muted,
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
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.85, color: "#3D4540" }}>{profile.bio}</p>
              )}
            </div>

            {!editingProfile && (
              <div style={{ marginBottom: 4 }}>
                <h2 style={{ margin: "0 0 12px 0", fontSize: 17, fontWeight: 800, color: UI.text }}>{s.keywordsLabel}</h2>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    padding: 14,
                    background: UI.surface,
                    border: `1px solid ${UI.border}`,
                    borderRadius: 12,
                  }}
                >
                  {profile.keywords.map((k, i) => (
                    <span
                      key={i}
                      style={{
                        fontSize: 13,
                        fontWeight: 600,
                        lineHeight: 1.6,
                        padding: "4px 12px",
                        borderRadius: 999,
                        background: UI.primaryTint,
                        color: UI.primary,
                      }}
                    >
                      {k}
                    </span>
                  ))}
                </div>
              </div>
            )}
            </JourneyStep>

            <JourneyStep number={3} state="current" last title={s.journeyChoose}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }} className="cm-opt-list">
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
                  aria-expanded={opt.custom ? showFieldPicker : undefined}
                  className="cm-card cm-opt"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    textAlign: "start",
                    minHeight: 64,
                    padding: "12px 14px",
                    background: opt.custom ? UI.selected : UI.surface,
                    border: `1.5px solid ${opt.custom ? UI.primary : UI.border}`,
                    borderRadius: 14,
                    cursor: busy ? "default" : "pointer",
                    fontFamily: "var(--font-cairo), sans-serif",
                  }}
                >
                  {/* Same icon and palette as this option's preview row on the first screen. */}
                  <span
                    aria-hidden="true"
                    className="cm-opt-icon"
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 9,
                      background: PREVIEW_CARDS[opt.id - 1].bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {React.createElement(PREVIEW_CARDS[opt.id - 1].Icon, { size: 18, color: PREVIEW_CARDS[opt.id - 1].fg, strokeWidth: 1.9 })}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="cm-opt-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: opt.custom ? UI.primary : UI.text, lineHeight: 1.45 }}>{opt.title}</p>
                    <p className="cm-opt-desc" style={{ margin: "2px 0 0 0", fontSize: 13, color: UI.muted }}>{opt.desc}</p>
                  </div>
                  {opt.external ? (
                    <ExternalLink size={17} color={UI.primary} aria-hidden="true" style={{ flexShrink: 0 }} />
                  ) : (
                    <ArrowRightIcon size={18} color={UI.primary} aria-hidden="true" style={{ flexShrink: 0, transform: isRtl ? "scaleX(-1)" : "none" }} />
                  )}
                </button>
              ))}
            </div>

            {showFieldPicker && (
              <div
                style={{
                  marginTop: 10,
                  padding: 16,
                  background: UI.selected,
                  border: `1.5px solid ${UI.primary}`,
                  borderRadius: 14,
                }}
              >
                <FieldLabel htmlFor="cm-field">{s.fieldPickerLabel}</FieldLabel>
                <input
                  id="cm-field"
                  value={fieldQuery}
                  onChange={(e) => setFieldQuery(e.target.value)}
                  placeholder={s.fieldPickerPlaceholder}
                  className="cm-input"
                  style={{ ...FIELD_STYLE, marginBottom: 12 }}
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
                          textAlign: "start",
                          minHeight: 44,
                          padding: "0 14px",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font-cairo), sans-serif",
                          background: "#fff",
                          border: `1px solid ${UI.border}`,
                          borderRadius: 10,
                          cursor: busy ? "default" : "pointer",
                          color: UI.text,
                        }}
                      >
                        {f}
                      </button>
                    ))}
                    {matchingFields.length === 0 && (
                      <p style={{ fontSize: 13, color: UI.muted, margin: 0 }}>{s.noMatch}</p>
                    )}
                  </div>
                )}
                <PrimaryButton onClick={() => runCustomFieldPlan(fieldQuery)} disabled={busy || !fieldQuery.trim()} loading={busy}>
                  {busy ? s.preparingPlan : s.preparePlan}
                </PrimaryButton>
              </div>
            )}
            {busy && (
              <p role="status" style={{ display: "flex", alignItems: "center", gap: 8, color: UI.muted, fontSize: 14, marginTop: 14 }}>
                <Loader2 size={16} className="spin" /> {s.preparingRecs}
              </p>
            )}
            {error && (
              <div style={{ marginTop: 12 }}>
                <ErrorNote>{error}</ErrorNote>
                <div style={{ marginTop: 10 }}>
                  <SecondaryButton onClick={retryLastOption} disabled={busy} loading={busy}>
                    {s.retry}
                  </SecondaryButton>
                </div>
              </div>
            )}
            </JourneyStep>
            </div>

            <aside className="cm-doc-aside">
              <SaveNotice>{s.privacyNote}</SaveNotice>
              <SourceCard label={s.sourceLabel} name={sourceName} isFile={inputMode === "file"} size={inputMode === "file" ? fileSize : 0} />
            </aside>
          </div>
        )}

        {step === "result" && (
          <div className="cm-step-enter cm-doc-grid">
            <div style={{ minWidth: 0 }}>
            {/* A tab on the doc's top edge, so going back reads as part of the same card rather than
                a separate, heavier button. Its open bottom and -1px margin sit over the doc's border,
                which is squared off at that corner. The arrow is drawn rather than typed: "back"
                points right in Arabic and left in English, and a typed "←" read as "forward" in the
                Arabic interface. */}
            <button
              onClick={() => setStep("profile")}
              className="cm-secondary cm-back"
              style={{
                position: "relative",
                zIndex: 1,
                // Block-level (flex + fit-content), not inline-flex: as an inline box it sat on a line
                // box whose descent swallowed the -1px, leaving the doc's border visible under it.
                display: "flex",
                width: "fit-content",
                alignItems: "center",
                gap: 6,
                minHeight: 34,
                padding: "0 14px",
                marginBottom: -1,
                background: UI.surface,
                border: `1px solid ${UI.border}`,
                borderBottom: "none",
                borderRadius: "10px 10px 0 0",
                color: UI.primary,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "var(--font-cairo), sans-serif",
              }}
            >
              <ArrowRightIcon size={15} aria-hidden="true" style={{ transform: isRtl ? "none" : "scaleX(-1)" }} />
              {s.backToOptions}
            </button>
            <div className="cm-doc cm-doc-keep" style={{ borderStartStartRadius: 0 }}>
            <JourneyStep number={1} state="done" title={s.journeyUpload} note={sourceName} noteIsName={inputMode === "file"} />
            <JourneyStep number={2} state="done" title={s.journeyAnalyze} note={profile?.currentField} />
            <JourneyStep number={3} state="current" last title={s.journeyChoose}>

            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 20 }}>
              {resultTitle && (
                <h1 className="cm-screen-title" style={{ fontWeight: 800, lineHeight: 1.45, color: UI.text, margin: 0 }}>
                  {resultTitle}
                </h1>
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
              <div style={{ display: "flex", flexDirection: "column" }}>
                {resultData.items.map((it, i) => (
                  <RailItem key={i} last={i === resultData.items.length - 1} badge={<NumberBadge n={i + 1} outline />}>
                    <h2 style={{ margin: "4px 0 4px 0", fontSize: 16, fontWeight: 700, color: UI.text, lineHeight: 1.5 }}>{it.title}</h2>
                    <p style={{ margin: "0 0 6px 0", fontSize: 14, color: UI.muted, lineHeight: 1.75 }}>{it.why}</p>
                    <p style={{ margin: 0, fontSize: 14, color: UI.primary, lineHeight: 1.75 }}>
                      <strong>{s.stepLabel}</strong>
                      {it.step}
                    </p>
                  </RailItem>
                ))}
              </div>
            )}

            {resultType === "resume" && resultData && (
              <>
                <div
                  style={{
                    marginBottom: 24,
                    padding: "16px 18px",
                    background: UI.surface,
                    border: `1px solid ${UI.border}`,
                    borderInlineStart: `3px solid ${UI.primary}`,
                    borderRadius: 12,
                  }}
                >
                  <p style={{ margin: 0, fontSize: 16, lineHeight: 1.9, fontStyle: "italic", color: UI.text }}>{resultData.bio}</p>
                </div>
                <SectionTitle>{s.resumeTipsLabel}</SectionTitle>
                <CheckList items={resultData.tips} />
              </>
            )}

            {resultType === "plan" && resultData && (
              <>
                <SectionTitle>{s.strengthsLabel}</SectionTitle>
                <CheckList items={resultData.strengths} />

                <SectionTitle style={{ marginTop: 28 }}>{s.gapsLabel}</SectionTitle>
                {/* One rail per gap: number and colour here are the same ones its tasks carry in the
                    weekly plan below, so a task can be traced back to its gap at a glance. Each gap's
                    suggested step sits under its reason. */}
                {/* No gaps means nothing for a plan to close — the plan endpoint rejects an empty list —
                    so the button is replaced by saying so. */}
                {resultData.gaps.length === 0 && (
                  <p style={{ margin: 0, padding: "12px 14px", fontSize: 14, lineHeight: 1.75, color: UI.muted, background: UI.surface, border: `1px dashed ${UI.borderStrong}`, borderRadius: 12 }}>
                    {s.noGaps}
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column" }}>
                  {resultData.gaps.map((g, i) => {
                    const c = gapColor(i);
                    return (
                      <RailItem key={i} last={i === resultData.gaps.length - 1} badge={<NumberBadge n={i + 1} color={c.fg} />}>
                        <h3 style={{ margin: "4px 0 4px 0", fontSize: 16, fontWeight: 700, color: c.fg, lineHeight: 1.5 }}>{g.skill}</h3>
                        <p style={{ margin: "0 0 6px 0", fontSize: 14, color: "#3D4540", lineHeight: 1.75 }}>{g.why}</p>
                        <p style={{ margin: 0, fontSize: 13, color: UI.muted, lineHeight: 1.7 }}>
                          <strong style={{ color: UI.text }}>{s.stepLabel}</strong>
                          {g.step}
                        </p>
                      </RailItem>
                    );
                  })}
                </div>

                {resultData.gaps.length > 0 && (
                  <div style={{ marginTop: 8, paddingTop: 20, borderTop: `1px solid ${UI.border}` }}>
                    <PrimaryButton onClick={generateWeeklyPlan} disabled={planBusy} loading={planBusy}>
                      {planBusy ? s.generatingPlan : s.generatePlan}
                    </PrimaryButton>
                  </div>
                )}

                {planError && (
                  <div style={{ marginTop: 14 }}>
                    <ErrorNote>{planError}</ErrorNote>
                    <div style={{ marginTop: 10 }}>
                      <SecondaryButton onClick={generateWeeklyPlan} disabled={planBusy} loading={planBusy}>
                        {s.retry}
                      </SecondaryButton>
                    </div>
                  </div>
                )}

                {weeklyPlan && (
                  <section style={{ marginTop: 28, paddingTop: 24, borderTop: `1px solid ${UI.border}` }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 18 }}>
                      <h2 style={{ margin: 0, fontSize: 20, fontWeight: 800, color: UI.text }}>{s.weeklyPlanTitle}</h2>
                      <div className="cm-plan-actions" style={{ display: "flex", gap: 8 }}>
                        <SecondaryButton onClick={handlePlanCopy}>
                          {planCopied ? <CopyCheck size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
                          {planCopied ? s.copied : s.copy}
                        </SecondaryButton>
                        <PrimaryButton onClick={handleSavePdf}>
                          <FileDown size={16} aria-hidden="true" />
                          {s.savePdf}
                        </PrimaryButton>
                      </div>
                    </div>
                    {printBlocked && (
                      <p
                        role="status"
                        style={{
                          margin: "0 0 16px 0",
                          padding: "10px 12px",
                          fontSize: 13,
                          lineHeight: 1.7,
                          color: UI.noticeFg,
                          background: UI.noticeBg,
                          borderRadius: 12,
                        }}
                      >
                        {s.printBlocked}
                      </p>
                    )}
                    {weeklyPlan.map((week, wi) => (
                      <section key={week.weekNumber} className="cm-week">
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }} aria-hidden="true">
                          <span className="cm-week-badge">{week.weekNumber}</span>
                          {wi < weeklyPlan.length - 1 && (
                            <span style={{ flex: 1, width: 2, margin: "6px 0", background: "#B9C8BD", borderRadius: 1 }} />
                          )}
                        </div>
                        <div style={{ minWidth: 0, paddingBottom: wi < weeklyPlan.length - 1 ? 24 : 0 }}>
                          <h3 className="cm-week-title" style={{ margin: "4px 0 12px 0", fontWeight: 800, color: UI.text, lineHeight: 1.5 }}>
                            {s.weekLabel} {week.weekNumber}
                          </h3>
                          <div className="cm-task-grid">
                            {week.tasks.map((task, i) => {
                              const gi = resultData.gaps.findIndex((g) => g.skill === task.relatedSkill);
                              return (
                                <div
                                  key={i}
                                  style={{
                                    background: UI.surface,
                                    border: `1px solid ${UI.border}`,
                                    borderRadius: 12,
                                    padding: "12px 14px",
                                    minWidth: 0,
                                  }}
                                >
                                  <p style={{ margin: "0 0 10px 0", fontSize: 15, fontWeight: 600, lineHeight: 1.65, color: UI.text }}>{task.title}</p>
                                  <GapChip index={gi} name={task.relatedSkill} />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </section>
                    ))}
                  </section>
                )}
              </>
            )}
            </ResultBoundary>
            </JourneyStep>
            </div>
            </div>

            <aside className="cm-doc-aside">
              <SaveNotice>{s.privacyNote}</SaveNotice>
              <SourceCard label={s.sourceLabel} name={sourceName} isFile={inputMode === "file"} size={inputMode === "file" ? fileSize : 0} />
            </aside>
          </div>
        )}
      </div>
      </main>

      {showPrintout &&
        createPortal(
          <PlanPrintout dir={s.dir} t={s} title={planDocTitle} weeks={weeklyPlan} />,
          document.body
        )}
    </div>
  );
}
