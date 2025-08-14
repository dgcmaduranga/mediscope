// ---------- Labs ----------
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

// ---------- Symptoms ----------
export type SymptomsRequest = {
  age: number;
  sex: "male" | "female" | "other";
  symptoms: string[];
  duration_days: number;
};

export type Differential = { condition: string; rationale: string; likelihood: number; };

export type SymptomsResponse = {
  red_flags: string[];
  differentials: Differential[];
  care_advice: string;
};

// ---------- Knowledge ----------
export type WikiResponse = { title: string; url: string; summary: string; };

// ---------- Meds ----------
export type MedsCheckRequest = { meds: string[] };
export type MedsInteraction = { pair: [string, string]; severity: "low"|"moderate"|"high"; note: string; };
export type MedsCheckResponse = { interactions: MedsInteraction[]; disclaimer: string; };

// ---------- Skin ----------
export type SkinPrediction = { condition: string; confidence: number; description?: string; };
export type SkinResponse = { top: SkinPrediction[]; note: string; };

// ---------- AI Explain (Labs) ----------
export type AIInsight = { name: string; comment: string };
export type AIRisk = "low" | "moderate" | "high";
export type AIAnalysis = {
  summary: string;
  risk_level: AIRisk;
  insights: AIInsight[];
  cautions: string[];
};
