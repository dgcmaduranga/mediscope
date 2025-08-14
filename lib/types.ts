export type LabValue = {
  name: string;
  value: string | number;
  unit?: string;
  ref_low?: number | null;
  ref_high?: number | null;
  interpretation?: string;
};

export type LabReportResponse = {
  extracted: LabValue[];
  summary: string;
  cautions: string[];
};
export type SkinPrediction = {
  condition: string;
  confidence: number; // 0–1
  description?: string;
};
export type SkinResponse = {
  top: SkinPrediction[];
  note: string;
};
export type MedsCheckRequest = { meds: string[] };
export type MedsInteraction = { pair: [string, string]; severity: "low"|"moderate"|"high"; note: string; };
export type MedsCheckResponse = { interactions: MedsInteraction[]; disclaimer: string; };