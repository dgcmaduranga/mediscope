import type { LabReportResponse, LabValue } from "./types";

// capture formats like:
//  Hemoglobin: 13.5 g/dL (13 - 17)
//  WBC - 11.2 x10^9/L (4–11)
//  Sodium 138 mmol/L (135-145)
const LINE_RE =
  /^([A-Za-z][A-Za-z\s\-/()%]+?)\s*(?:[:\-])\s*([0-9]+(?:\.[0-9]+)?)\s*([A-Za-zµ\/%\^\-\d]+)?(?:.*?\(?\s*([0-9]+(?:\.[0-9]+)?)\s*[-–]\s*([0-9]+(?:\.[0-9]+)?)\s*\)?)?/;

export function parseLabText(text: string): LabValue[] {
  const out: LabValue[] = [];
  const cleaned = normalize(text);
  for (const raw of cleaned.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    const m = line.match(LINE_RE);
    if (!m) continue;
    const [, name, valStr, unit, lowStr, highStr] = m;
    const value = Number(valStr);
    const ref_low = lowStr ? Number(lowStr) : null;
    const ref_high = highStr ? Number(highStr) : null;
    out.push({
      name: titleCase(name),
      value: isNaN(value) ? valStr : value,
      unit,
      ref_low,
      ref_high,
    });
  }
  return dedupe(out);
}

export function interpretLab(l: LabValue): string | undefined {
  if (typeof l.value !== "number") return undefined;
  if (l.ref_low == null || l.ref_high == null) return undefined;
  if (l.value < l.ref_low) return "Below reference";
  if (l.value > l.ref_high) return "Above reference";
  return "Within reference";
}

export function buildSummary(values: LabValue[], hadText = true): string {
  if (!values.length) {
    return hadText
      ? "Could not reliably extract numeric lab lines from this image. Try a sharper photo or export the PDF as an image."
      : "No readable text detected.";
  }
  const highs = values.filter(v => interpretLab(v) === "Above reference").map(v => v.name);
  const lows  = values.filter(v => interpretLab(v) === "Below reference").map(v => v.name);
  const normals = values.filter(v => interpretLab(v) === "Within reference").map(v => v.name);

  const parts: string[] = [];
  if (normals.length) parts.push(`Within ref: ${normals.slice(0,6).join(", ")}${normals.length>6?"…":""}.`);
  if (highs.length) parts.push(`High: ${highs.join(", ")} (correlate with symptoms).`);
  if (lows.length)  parts.push(`Low: ${lows.join(", ")} (consider deficiency/other causes).`);

  return parts.join(" ") || "Values captured; limited reference ranges detected.";
}

export function toResponse(values: LabValue[], hadText = true): LabReportResponse {
  const enriched = values.map(v => ({ ...v, interpretation: interpretLab(v) }));
  return {
    extracted: enriched,
    summary: buildSummary(enriched, hadText),
    cautions: [
      "Informational only — not a medical diagnosis.",
      "If you have severe symptoms (e.g., chest pain, difficulty breathing), seek urgent care.",
    ],
  };
}

// helpers
function titleCase(s: string) {
  return s.replace(/\s+/g, " ").trim().replace(/\b\w/g, c => c.toUpperCase());
}
function dedupe(arr: LabValue[]) {
  const seen = new Set<string>();
  const out: LabValue[] = [];
  for (const v of arr) {
    const key = `${v.name}|${v.unit || ""}`;
    if (!seen.has(key)) { seen.add(key); out.push(v); }
  }
  return out;
}
function normalize(t: string) {
  return t
    .replace(/[–—]/g, "-")
    .replace(/\u00A0/g, " ")
    .replace(/\s{2,}/g, " ");
}
