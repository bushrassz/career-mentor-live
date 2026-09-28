import { extractText, getDocumentProxy } from "unpdf";

// Below this many non-whitespace characters a PDF is treated as having no readable text: in
// practice a scanned page or a photo saved as PDF. OpenRouter's free pdf-text parser only reads
// a text layer, so with none the model received nothing but the file's metadata and invented a
// profile that the user would have taken as a reading of their own CV.
export const MIN_PDF_TEXT_CHARS = 50;

const PDF_DATA_PREFIX = "data:application/pdf;base64,";

// Returns the number of non-whitespace characters in the PDF's text layer, or null when the file
// can't be parsed here (corrupt, encrypted, not a PDF data URI) — the caller then lets OpenRouter
// try, rather than rejecting a file that its parser might still read.
export async function countPdfTextChars(fileData) {
  if (typeof fileData !== "string" || !fileData.startsWith(PDF_DATA_PREFIX)) return null;
  try {
    const bytes = Buffer.from(fileData.slice(PDF_DATA_PREFIX.length), "base64");
    const pdf = await getDocumentProxy(new Uint8Array(bytes));
    const { text } = await extractText(pdf, { mergePages: true });
    return text.replace(/\s/g, "").length;
  } catch (err) {
    // Only the error's type: its message can quote parts of the file.
    console.error("PDF text check failed:", err?.name || "Error");
    return null;
  }
}
