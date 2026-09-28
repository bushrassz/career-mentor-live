import { NextResponse } from "next/server";

// TEXT_MODEL is the stable default. It is text-only, but still handles PDF uploads because the
// file-parser plugin extracts their text at OpenRouter before the model sees it. Images have no
// such extraction step, so they are routed to a vision model instead — sending one to TEXT_MODEL
// fails with "No endpoints found that support image input".
//
// TEXT_MODEL stays on :free because north-mini-code has no paid tier on OpenRouter. The vision
// model's free tier was withdrawn (404 "unavailable for free"), so it runs on the paid slug.
export const TEXT_MODEL = "cohere/north-mini-code:free";
export const VISION_MODEL = "inclusionai/ling-3.0-flash-vl";
export const MAX_TOKENS_CAP = 4000;

// Uploads are base64-encoded into the JSON body, which inflates them by roughly a third, so
// this sits above the 5 MB per-file limit the UI enforces. The browser check is only a courtesy;
// this is the one that counts, since anything can POST here directly.
export const MAX_REQUEST_BYTES = 8 * 1024 * 1024;

// Simple in-memory rate limiter, per server process. It resets on restart and isn't shared
// across multiple instances — good enough for a single-instance deployment to stop a script
// from hammering these endpoints directly and burning the shared OpenRouter quota, but it is
// not a substitute for real auth if this ever needs to survive a multi-instance/serverless
// deploy. The budget is deliberately shared across every route that imports this module, so
// adding an endpoint doesn't hand a caller a second allowance.
const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const RATE_LIMIT_MAX_REQUESTS = 30; // per IP, per window
const RATE_LIMIT_MAX_TRACKED_IPS = 5000; // safety cap so the map itself can't grow unbounded

export function getClientIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

// Each call returns an independent limiter with its own per-IP budget.
export function createRateLimiter(windowMs, maxRequests) {
  const requestLog = new Map(); // ip -> { count, windowStart }

  return function checkRateLimit(ip) {
    const now = Date.now();
    const entry = requestLog.get(ip);

    if (!entry || now - entry.windowStart > windowMs) {
      if (requestLog.size >= RATE_LIMIT_MAX_TRACKED_IPS) requestLog.clear();
      requestLog.set(ip, { count: 1, windowStart: now });
      return { limited: false };
    }

    entry.count += 1;
    if (entry.count > maxRequests) {
      const retryAfterSeconds = Math.ceil((entry.windowStart + windowMs - now) / 1000);
      return { limited: true, retryAfterSeconds };
    }
    return { limited: false };
  };
}

const checkRateLimit = createRateLimiter(RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX_REQUESTS);

// Runs the checks every route shares, in the same order: rate limit, API key, request size,
// JSON validity. Returns { response } to send straight back, or { body, apiKey } to continue.
export async function guardRequest(req) {
  const rateLimit = checkRateLimit(getClientIp(req));
  if (rateLimit.limited) {
    return {
      response: NextResponse.json(
        { error: "طلبات كثيرة جداً، حاول بعد شوي." },
        { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
      ),
    };
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return {
      response: NextResponse.json(
        { error: "OPENROUTER_API_KEY غير مضبوط على السيرفر." },
        { status: 500 }
      ),
    };
  }

  // Reject oversized uploads before reading the body when the client declares its size.
  const declaredLength = Number(req.headers.get("content-length"));
  if (declaredLength > MAX_REQUEST_BYTES) {
    return { response: NextResponse.json({ error: "حجم الطلب كبير جداً." }, { status: 413 }) };
  }

  let rawBody;
  try {
    rawBody = await req.text();
  } catch {
    return { response: NextResponse.json({ error: "طلب غير صالح." }, { status: 400 }) };
  }

  // Backstop for requests that omit or understate content-length.
  if (rawBody.length > MAX_REQUEST_BYTES) {
    return { response: NextResponse.json({ error: "حجم الطلب كبير جداً." }, { status: 413 }) };
  }

  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return { response: NextResponse.json({ error: "طلب غير صالح." }, { status: 400 }) };
  }

  return { body: body || {}, apiKey };
}

export function clampMaxTokens(maxTokens, fallback = 800) {
  return typeof maxTokens === "number" && maxTokens > 0
    ? Math.min(maxTokens, MAX_TOKENS_CAP)
    : fallback;
}

// Calls OpenRouter and returns { ok: true, text } or { ok: false, status, error }. Callers
// decide what to do with a failure — the chat route forwards it, the plan route retries.
export async function callOpenRouter({ apiKey, model, contentBlocks, maxTokens, plugins }) {
  const payload = {
    model,
    max_tokens: maxTokens,
    temperature: 0.2,
    messages: [{ role: "user", content: contentBlocks }],
    // Some models burn their whole token budget on internal chain-of-thought (leaving the
    // actual answer empty/truncated, and occasionally drifting into other languages mid-thought).
    // Disabling reasoning forces them straight to the final answer.
    reasoning: { enabled: false },
  };
  if (plugins) payload.plugins = plugins;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      // Status only: the error body carries the provider's raw error, which could quote part
      // of the request — and the request is the user's CV.
      console.error("OpenRouter returned an error:", response.status);
      return {
        ok: false,
        status: response.status,
        error: data?.error?.message || "خطأ من OpenRouter API.",
      };
    }

    const text = data?.choices?.[0]?.message?.content || "";

    // U+FFFD means a character arrived mangled: an Arabic letter is two UTF-8 bytes, and a
    // split at a decode boundary upstream turns one letter into two replacement characters
    // ("يقترب" came back as "يقت��ب"). Nothing here can repair it — the original
    // bytes are gone — and it never appears in legitimate prose, so the response is failed
    // and the caller's existing retry picks it up. Both routes benefit: the plan route
    // retries server-side, the chat route surfaces the failure to the browser's retry loop.
    if (text.includes("�")) {
      console.error("OpenRouter returned mangled characters (U+FFFD); treating as a failure.");
      return { ok: false, status: 502, error: "تعذر قراءة رد النموذج، حاول مرة ثانية." };
    }

    return { ok: true, text };
  } catch (err) {
    console.error("OpenRouter API request failed:", err);
    return { ok: false, status: 502, error: "تعذر الاتصال بخدمة OpenRouter." };
  }
}
