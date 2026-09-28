import { NextResponse } from "next/server";
import {
  TEXT_MODEL,
  VISION_MODEL,
  callOpenRouter,
  clampMaxTokens,
  guardRequest,
} from "@/lib/openrouter";
import { MIN_PDF_TEXT_CHARS, countPdfTextChars } from "@/lib/pdf-text";

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

  // Checked before OpenRouter is called at all: a PDF without a text layer gives the model nothing
  // to read. `code` lets the browser show its own localized message and skip its retries.
  for (const block of contentBlocks) {
    if (block?.type !== "file") continue;
    const chars = await countPdfTextChars(block.file?.file_data);
    if (chars !== null && chars < MIN_PDF_TEXT_CHARS) {
      console.warn("Rejected a PDF with no readable text layer:", chars, "chars");
      return NextResponse.json(
        { error: "ملف PDF هذا صورة ممسوحة بدون نص قابل للقراءة، ارفعه كصورة بدلاً منه.", code: "scanned-pdf" },
        { status: 422 }
      );
    }
  }

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
