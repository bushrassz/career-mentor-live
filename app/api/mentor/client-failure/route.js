import { NextResponse } from "next/server";
import { createRateLimiter, getClientIp } from "@/lib/openrouter";

export const runtime = "nodejs";

// The browser validates every model reply itself (JSON present, right shape, right language) and
// retries up to three times. Those rejections happen after /api/mentor has already returned 200,
// so without this report they leave nothing in the server logs — a user could fail every attempt
// while the logs showed only successes. Only values from these fixed lists are ever logged, so
// nothing from a CV or a model reply can reach the logs through this endpoint.
const SOURCES = new Set(["analyze", "option1", "option2", "option3", "option5"]);
const KINDS = new Set(["no-json-found", "invalid-json", "malformed-shape", "wrong-language"]);
const ATTEMPTS = new Set([1, 2, 3]);

const MAX_BODY_BYTES = 512;

// A separate budget from the model routes: a user whose replies keep failing should not be
// pushed into a 429 on /api/mentor by the reports about those failures.
const checkRateLimit = createRateLimiter(5 * 60 * 1000, 60);

export async function POST(req) {
  if (checkRateLimit(getClientIp(req)).limited) {
    return new NextResponse(null, { status: 429 });
  }

  if (Number(req.headers.get("content-length")) > MAX_BODY_BYTES) {
    return new NextResponse(null, { status: 413 });
  }

  let body;
  try {
    const raw = await req.text();
    if (raw.length > MAX_BODY_BYTES) return new NextResponse(null, { status: 413 });
    body = JSON.parse(raw);
  } catch {
    return new NextResponse(null, { status: 400 });
  }

  const { source, kind, attempt } = body || {};
  if (!SOURCES.has(source) || !KINDS.has(kind) || !ATTEMPTS.has(attempt)) {
    return new NextResponse(null, { status: 400 });
  }

  console.warn(`Client validation failed: ${source} attempt ${attempt}: ${kind}`);
  return new NextResponse(null, { status: 204 });
}
