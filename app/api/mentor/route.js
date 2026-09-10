import { NextResponse } from "next/server";

export const runtime = "nodejs";

const OPENROUTER_MODEL = "nex-agi/nex-n2.5-mini:free";
const MAX_TOKENS_CAP = 4000;

// Simple in-memory rate limiter, per server process. It resets on restart and isn't shared
// across multiple instances — good enough for a single-instance deployment to stop a script
// from hammering this endpoint directly and burning the shared OpenRouter quota, but it is not
// a substitute for real auth if this ever needs to survive a multi-instance/serverless deploy.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 30; // per IP, per window
const RATE_LIMIT_MAX_TRACKED_IPS = 5000; // safety cap so the map itself can't grow unbounded

const requestLog = new Map(); // ip -> { count, windowStart }

function getClientIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = requestLog.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    if (requestLog.size >= RATE_LIMIT_MAX_TRACKED_IPS) requestLog.clear();
    requestLog.set(ip, { count: 1, windowStart: now });
    return { limited: false };
  }

  entry.count += 1;
  if (entry.count > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.ceil((entry.windowStart + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return { limited: true, retryAfterSeconds };
  }
  return { limited: false };
}

export async function POST(req) {
  const clientIp = getClientIp(req);
  const rateLimit = checkRateLimit(clientIp);
  if (rateLimit.limited) {
    return NextResponse.json(
      { error: "طلبات كثيرة جداً، حاول بعد شوي." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

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
