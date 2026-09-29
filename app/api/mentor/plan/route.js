import { NextResponse } from "next/server";
import { extractJson } from "@/lib/extract-json";
import { TEXT_MODEL, callOpenRouter, guardRequest } from "@/lib/openrouter";

export const runtime = "nodejs";

// A 24-week plan with a few tasks per week needs far more room than the chat route's default.
const PLAN_MAX_TOKENS = 3000;
const ATTEMPTS = 3;
const RETRY_DELAY_MS = 600;

const KNOWN_FAILURES = new Set([
  "no-json-found",
  "weeks-missing",
  "too-many-weeks",
  "repeated-title",
  "invalid-gapNumber",
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// The model reads these far better as prose than as raw JSON, so arrays are rendered into
// plain Arabic lists before they reach the prompt.
function formatKeywords(keywords) {
  return keywords.join("، ");
}

function formatStrengths(strengths) {
  return "\n" + strengths.map((s) => `- ${s}`).join("\n");
}

function formatGaps(gaps) {
  return gaps
    .map((gap, i) =>
      [
        `${i + 1}. المهارة: ${gap.skill}`,
        `   السبب: ${gap.why}`,
        `   الخطوة المقترحة: ${gap.step}`,
      ].join("\n")
    )
    .join("\n\n");
}

function buildPrompt({ currentField, bio, keywords, strengths, gaps }) {
  return `هذا المستخدم يعمل في ${currentField}، ولديه نبذة ${bio} ومهارات ${formatKeywords(keywords)}.

نقاط قوته: ${formatStrengths(strengths)}

الفجوات التي يحتاج العمل عليها:
${formatGaps(gaps)}

المطلوب منك بناء خطة للمستخدم تساعده في تطوير نفسه وسد الفجوات تدريجيًا،
مع مراعاة مستواه الحالي بناءً على ما ذُكر أعلاه.

قسّم الخطة على شكل أسابيع مرقّمة (weekNumber) تبدأ من 1، بأسلوب سبرنت (sprint-style)
يشبه مسارات LinkedIn Learning. أعطِ كل فجوة مدة مناسبة لعمقها الفعلي.
يمكن لكل أسبوع أن يحتوي على مهام تخص أكثر من فجوة بنفس الوقت.

اجعل الخطة بأقصر مدة كافية فعلاً لسد الفجوات، دون تكرار حرفي للمهام، ولا تُطِل الخطة
لمجرد ملء المدة. كل مهمة يجب أن تضيف شيئًا جديدًا ولا تكون إعادة صياغة لمهمة سابقة.

لا توزّع المهام بالتساوي على الفجوات، بل اجعل عدد المهام لكل فجوة تابعًا لطبيعتها:
المهارة التقنية المحدودة النطاق (مثل إتقان أوامر أداة معيّنة) تكفيها مهام قليلة خلال
أسابيع متقاربة، أما المهارة التي لا تُكتسب إلا بالممارسة المتكررة (مثل التحدث أمام
الجمهور أو قيادة فريق) فتحتاج مهام أصغر موزّعة على عدد أكبر من الأسابيع حتى تتراكم
الممارسة. والمهارة النظرية تحتاج مهام دراسة يتبعها تطبيق واحد على الأقل.

قيمة gapNumber هي رقم الفجوة التي تخدمها المهمة كما هو مرقّم في قائمة الفجوات أعلاه
(من 1 إلى ${gaps.length})، ولا تربط أي مهمة بنقاط القوة أو بالمهارات الحالية. إذا كانت المهمة تخدم
أكثر من فجوة، فاختر الفجوة الأدق والأكثر تحديداً لموضوع المهمة لا الفجوة الأعم: مهمة تتعلم فيها أداة
معيّنة أو تبني بها شيئاً تتبع فجوة تلك الأداة، لا فجوة عامة تشملها.

أرجع الإجابة بصيغة JSON فقط، بدون أي نص أو شرح قبلها أو بعدها، بالشكل التالي بالضبط:
{
  "weeks": [
    {
      "weekNumber": 1,
      "tasks": [
        { "title": "...", "gapNumber": 1 }
      ]
    }
  ]
}`;
}

function isNonEmptyStringArray(value) {
  return Array.isArray(value) && value.length > 0 && value.every((v) => typeof v === "string" && v.trim());
}

function validateInput(body) {
  const { currentField, bio, keywords, strengths, gaps } = body;

  if (typeof currentField !== "string" || !currentField.trim()) return "currentField مطلوب.";
  if (typeof bio !== "string" || !bio.trim()) return "bio مطلوب.";
  if (!isNonEmptyStringArray(keywords)) return "keywords مطلوب (مصفوفة نصوص).";
  if (!isNonEmptyStringArray(strengths)) return "strengths مطلوب (مصفوفة نصوص).";
  if (!Array.isArray(gaps) || gaps.length === 0) return "gaps مطلوب (مصفوفة كائنات).";

  const badGap = gaps.some(
    (g) => !g || typeof g.skill !== "string" || typeof g.why !== "string" || typeof g.step !== "string"
  );
  if (badGap) return "كل عنصر في gaps يجب أن يحتوي skill و why و step كنصوص.";

  return null;
}

// The ceiling lives here, not in the prompt. Whenever the prompt named a number of weeks, the
// model anchored on it: plans came out at exactly 8 or exactly 24 weeks, never in between.
const MAX_PLAN_WEEKS = 24;

function hasTooManyWeeks(weeks) {
  return (
    weeks.length > MAX_PLAN_WEEKS ||
    weeks.some((week) => typeof week.weekNumber === "number" && week.weekNumber > MAX_PLAN_WEEKS)
  );
}

// Asked for a short plan, the model still sometimes pads the weeks out by cycling the same few
// tasks. Two appearances can be legitimate (revisiting a prototype, say); a third means it has
// started filling time, so the response is rejected and retried.
const MAX_TITLE_REPEATS = 2;

function findOverusedTitle(weeks) {
  const counts = new Map();
  for (const week of weeks) {
    if (!Array.isArray(week.tasks)) continue;
    for (const task of week.tasks) {
      const title = typeof task?.title === "string" ? task.title.trim() : "";
      if (!title) continue;
      counts.set(title, (counts.get(title) || 0) + 1);
    }
  }
  for (const [title, count] of counts) {
    if (count > MAX_TITLE_REPEATS) return { title, count };
  }
  return null;
}

// The model links each task to a gap by its number rather than by copying the gap's name. Gap
// names from option 5 are long ("… (مثل Airflow، dbt، Lambda)"), and asked to copy them the
// model routinely trimmed the brackets or named a strength instead, failing two attempts in
// three. A number is either in range or not; a strength or keyword has no number to give.
// gapNumber comes from model output, which the user's CV can influence, so it is treated as
// untrusted: a plain integer, or a string of ASCII digits only — Number() alone would also
// accept "0x2", "1e0" or "" (as 0).
function toGapIndex(gapNumber, gapCount) {
  const n =
    typeof gapNumber === "string" && /^\s*\d+\s*$/.test(gapNumber) ? Number(gapNumber) : gapNumber;
  return Number.isInteger(n) && n >= 1 && n <= gapCount ? n - 1 : -1;
}

function hasInvalidGapNumber(weeks, gapCount) {
  return weeks.some(
    (week) =>
      Array.isArray(week.tasks) && week.tasks.some((task) => toGapIndex(task?.gapNumber, gapCount) === -1)
  );
}

// Rebuilds each task from known fields only: relatedSkill is filled in with the gap's exact
// name, so the response shape the UI reads is unchanged. The model is never told about
// "status" — every task starts pending and the UI owns it from there.
function toResponseWeeks(weeks, gaps) {
  return weeks.map((week) => ({
    weekNumber: week.weekNumber,
    tasks: Array.isArray(week.tasks)
      ? week.tasks.map((task) => ({
          title: task.title,
          relatedSkill: gaps[toGapIndex(task.gapNumber, gaps.length)].skill,
          status: "pending",
        }))
      : [],
  }));
}

export async function POST(req) {
  const guard = await guardRequest(req);
  if (guard.response) return guard.response;
  const { body, apiKey } = guard;

  const inputError = validateInput(body);
  if (inputError) {
    return NextResponse.json({ error: inputError }, { status: 400 });
  }

  const prompt = buildPrompt(body);
  let lastError = "تعذر توليد خطة صالحة، حاول مرة ثانية.";

  for (let attempt = 0; attempt < ATTEMPTS; attempt++) {
    const result = await callOpenRouter({
      apiKey,
      model: TEXT_MODEL,
      contentBlocks: [{ type: "text", text: prompt }],
      maxTokens: PLAN_MAX_TOKENS,
    });

    if (!result.ok) {
      // A rate limit or a missing key won't fix itself on a retry, so give up immediately.
      if (result.status === 429 || result.status === 401 || result.status === 403) {
        return NextResponse.json({ error: result.error }, { status: result.status });
      }
      lastError = result.error;
    } else {
      try {
        const parsed = extractJson(result.text);
        if (!Array.isArray(parsed.weeks) || parsed.weeks.length === 0) {
          throw new Error("weeks-missing");
        }
        if (hasTooManyWeeks(parsed.weeks)) throw new Error("too-many-weeks");
        if (findOverusedTitle(parsed.weeks)) throw new Error("repeated-title");
        if (hasInvalidGapNumber(parsed.weeks, body.gaps.length)) throw new Error("invalid-gapNumber");
        return NextResponse.json({ weeks: toResponseWeeks(parsed.weeks, body.gaps) });
      } catch (err) {
        // Only the kind of failure is logged. Task titles and skill names are derived from the
        // user's CV, and a JSON.parse SyntaxError quotes a snippet of the model's output.
        const kind = KNOWN_FAILURES.has(err.message) ? err.message : "invalid-json";
        console.error(`Plan attempt ${attempt + 1} failed validation:`, kind);
        lastError = "تعذر توليد خطة صالحة، حاول مرة ثانية.";
      }
    }

    if (attempt < ATTEMPTS - 1) await sleep(RETRY_DELAY_MS);
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
