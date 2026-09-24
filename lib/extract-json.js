// Shared by the browser (components/CareerSkillMentor.jsx) and the API routes so both parse
// model output through exactly the same rules.
//
// Finds the first {...} object using balanced-brace matching (tracking string literals so
// braces inside quoted text don't confuse it), instead of naively pairing the first "{" with
// the last "}" in the string. Some models append a stray extra "}" or trailing commentary
// after a perfectly valid JSON object; balanced matching ignores that trailing noise instead
// of failing to parse.
export function extractJson(raw) {
  const first = raw.indexOf("{");
  if (first === -1) throw new Error("no-json-found");

  let depth = 0;
  let inString = false;
  let escaped = false;
  let out = "";
  for (let i = first; i < raw.length; i++) {
    const ch = raw[i];
    if (inString) {
      out += ch;
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      out += ch;
      continue;
    }
    if (ch === "{") depth++;
    else if (ch === "}") {
      depth--;
      if (depth === 0) return JSON.parse(out + ch);
    }
    // Writing Arabic, the model sometimes separates fields and array elements with an Arabic
    // comma, which isn't valid JSON. Correcting it is only safe out here: inside a string an
    // Arabic comma is ordinary punctuation and has to survive untouched.
    out += ch === "،" ? "," : ch;
  }
  throw new Error("no-json-found");
}
