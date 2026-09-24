import { NextResponse } from "next/server";
import {
  TEXT_MODEL,
  VISION_MODEL,
  callOpenRouter,
  clampMaxTokens,
  guardRequest,
} from "@/lib/openrouter";

export const runtime = "nodejs";

export async function POST(req) {
  const guard = await guardRequest(req);
  if (guard.response) return guard.response;
  const { body, apiKey } = guard;

  const { contentBlocks, maxTokens } = body;
  if (!Array.isArray(contentBlocks) || contentBlocks.length === 0) {
    return NextResponse.json({ error: "contentBlocks مطلوب." }, { status: 400 });
  }

  const hasFileBlock = contentBlocks.some((b) => b?.type === "file");
  const hasImageBlock = contentBlocks.some((b) => b?.type === "image_url");

  const result = await callOpenRouter({
    apiKey,
    model: hasImageBlock ? VISION_MODEL : TEXT_MODEL,
    contentBlocks,
    maxTokens: clampMaxTokens(maxTokens),
    plugins: hasFileBlock ? [{ id: "file-parser", pdf: { engine: "pdf-text" } }] : undefined,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ text: result.text });
}
