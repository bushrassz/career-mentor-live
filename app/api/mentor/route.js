import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_MODEL = "nex-agi/nex-n2.5-mini:free";
const MAX_TOKENS_CAP = 4000;

export async function POST(req) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENROUTER_API_KEY غير مضبوط على السيرفر." },
      { status: 500 }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "طلب غير صالح." }, { status: 400 });
  }

  const { contentBlocks, maxTokens } = body || {};
  if (!Array.isArray(contentBlocks) || contentBlocks.length === 0) {
    return NextResponse.json({ error: "contentBlocks مطلوب." }, { status: 400 });
  }

  const safeMaxTokens =
    typeof maxTokens === "number" && maxTokens > 0
      ? Math.min(maxTokens, MAX_TOKENS_CAP)
      : 800;

  const hasFileBlock = contentBlocks.some((b) => b?.type === "file");

  const requestPayload = {
    model: OPENROUTER_MODEL,
    max_tokens: safeMaxTokens,
    temperature: 0.2,
    messages: [{ role: "user", content: contentBlocks }],
    // This model can burn its whole token budget on internal chain-of-thought (leaving the
    // actual answer empty/truncated, and occasionally drifting into other languages mid-thought).
    // Disabling reasoning forces it straight to the final answer.
    reasoning: { enabled: false },
  };

  if (hasFileBlock) {
    requestPayload.plugins = [{ id: "file-parser", pdf: { engine: "pdf-text" } }];
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error?.message || "خطأ من OpenRouter API." },
        { status: response.status }
      );
    }

    const text = data?.choices?.[0]?.message?.content || "";
    return NextResponse.json({ text });
  } catch (err) {
    console.error("OpenRouter API request failed:", err);
    return NextResponse.json(
      { error: "تعذر الاتصال بخدمة OpenRouter." },
      { status: 502 }
    );
  }
}
