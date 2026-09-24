import { NextResponse } from "next/server";
import { extractJson } from "@/lib/extract-json";
import { TEXT_MODEL, callOpenRouter, guardRequest } from "@/lib/openrouter";

export const runtime = "nodejs";

// A 24-week plan with a few tasks per week needs far more room than the chat route's default.
const PLAN_MAX_TOKENS = 3000;
const ATTEMPTS = 3;
const RETRY_DELAY_MS = 600;

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

قسّم الخطة على شكل أسابيع مرقّمة (weekNumber) تبدأ من 1. كل فجوة تُعالج خلال
ما لا يتجاوز 8 أسابيع، بأسلوب سبرنت (sprint-style) يشبه مسارات LinkedIn Learning.
يمكن لكل أسبوع أن يحتوي على مهام تخص أكثر من فجوة بنفس الوقت.

اجعل الخطة بأقصر مدة كافية فعلاً لسد الفجوات، دون تكرار حرفي للمهام. 24 أسبوعًا هو
الحد الأقصى المسموح وليس هدفًا يجب الوصول إليه: إن كانت ست أسابيع تكفي فاجعلها ست
أسابيع، ولا تُطِل الخطة لمجرد ملء المدة. كل مهمة يجب أن تضيف شيئًا جديدًا ولا تكون
إعادة صياغة لمهمة سابقة.

لا توزّع المهام بالتساوي على الفجوات، بل اجعل عدد المهام لكل فجوة تابعًا لطبيعتها:
المهارة التقنية المحدودة النطاق (مثل إتقان أوامر أداة معيّنة) تكفيها مهام قليلة خلال
أسابيع متقاربة، أما المهارة التي لا تُكتسب إلا بالممارسة المتكررة (مثل التحدث أمام
الجمهور أو قيادة فريق) فتحتاج مهام أصغر موزّعة على عدد أكبر من الأسابيع حتى تتراكم
الممارسة. والمهارة النظرية تحتاج مهام دراسة يتبعها تطبيق واحد على الأقل.

قيمة relatedSkill يجب أن تكون نسخة حرفية من اسم إحدى المهارات المذكورة في قائمة
الفجوات أعلاه، ولا تخترع مهارات أخرى ولا تستخدم نقاط القوة كمهارة مرتبطة.

أرجع الإجابة بصيغة JSON فقط، بدون أي نص أو شرح قبلها أو بعدها، بالشكل التالي بالضبط:
{
  "weeks": [
    {
      "weekNumber": 1,
      "tasks": [
        { "title": "...", "relatedSkill": "..." }
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

// The plan is only useful if every task maps back to a gap the caller actually sent. Left
// unchecked the model drifts, attaching tasks to a strength or to a skill it invented, which
// would silently widen the plan beyond what was asked for.
function findUnknownSkill(weeks, gaps) {
  const allowed = new Set(gaps.map((g) => g.skill.trim()));
  for (const week of weeks) {
    if (!Array.isArray(week.tasks)) continue;
    for (const task of week.tasks) {
      const skill = typeof task?.relatedSkill === "string" ? task.relatedSkill.trim() : "";
      if (!allowed.has(skill)) return skill || "(فارغ)";
    }
  }
  return null;
}

// The model is never told about "status" — every task starts pending and the UI owns it from there.
function withPendingStatus(weeks) {
  return weeks.map((week) => ({
    ...week,
    tasks: Array.isArray(week.tasks)
      ? week.tasks.map((task) => ({ ...task, status: "pending" }))
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
        const overused = findOverusedTitle(parsed.weeks);
        if (overused) {
          throw new Error(`repeated-title ×${overused.count}: ${overused.title}`);
        }
        const unknownSkill = findUnknownSkill(parsed.weeks, body.gaps);
        if (unknownSkill) {
          throw new Error(`unknown-relatedSkill: ${unknownSkill}`);
        }
        return NextResponse.json({ weeks: withPendingStatus(parsed.weeks) });
      } catch (err) {
        console.error(`Plan attempt ${attempt + 1} failed validation:`, err.message);
        lastError = "تعذر توليد خطة صالحة، حاول مرة ثانية.";
      }
    }

    if (attempt < ATTEMPTS - 1) await sleep(RETRY_DELAY_MS);
  }

  return NextResponse.json({ error: lastError }, { status: 502 });
}
