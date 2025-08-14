"use client";
import { useState } from "react";
import {
  Card, CardContent, TextField, Button, Typography, Stack, Chip, Alert, LinearProgress
} from "@mui/material";

type Severity = "low"|"moderate"|"high";
type Interaction = { pair: [string,string]; severity: Severity; note: string };
type MedsCheckResponse = { interactions: Interaction[]; disclaimer: string };

export default function MedsPage() {
  const [text, setText] = useState("");
  const [res, setRes] = useState<MedsCheckResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔹 AI state
  const [ai, setAi] = useState<{summary:string; key_risks:string[]; general_advice:string} | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  async function safeJson(r: Response) {
    const ct = r.headers.get("content-type") || "";
    const body = await r.text();
    if (!ct.includes("application/json")) throw new Error(`${r.status} ${r.statusText} — expected JSON`);
    return JSON.parse(body);
  }

  const check = async () => {
    setLoading(true); setError(""); setRes(null); setAi(null);
    try {
      const meds = text.split(",").map(s=>s.trim().toLowerCase()).filter(Boolean);
      if (!meds.length) throw new Error("Enter at least one medication.");
      // 1) rules
      const r = await fetch("/api/meds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meds }),
      });
      const data = await safeJson(r);
      if (!r.ok) throw new Error(data?.error || "Rules check failed");
      setRes(data as MedsCheckResponse);

      // 2) AI (auto-call)
      setAiLoading(true);
      const r2 = await fetch("/api/meds/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ meds, interactions: (data as MedsCheckResponse).interactions }),
      });
      const a = await safeJson(r2);
      if (!r2.ok) throw new Error(a?.error || "AI failed");
      setAi(a);
    } catch (e:any) {
      setError(e.message || "Error");
    } finally {
      setAiLoading(false);
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField
              label="Medications (comma-separated)"
              placeholder="ibuprofen, warfarin"
              fullWidth
              value={text}
              onChange={(e)=>setText(e.target.value)}
            />
            <Button variant="contained" onClick={check} disabled={loading || aiLoading}>
              {loading ? "Checking…" : "Check"}
            </Button>
          </Stack>
          {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
        </CardContent>
      </Card>

      {res && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Interactions</Typography>
            {res.interactions.length ? (
              <Stack spacing={1}>
                {res.interactions.map((i, idx)=>(
                  <Card key={idx} variant="outlined" sx={{ p:1 }}>
                    <Typography sx={{ fontWeight: 600 }}>{i.pair.join(" + ")}</Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1, alignItems: "center" }}>
                      <Chip
                        label={i.severity.toUpperCase()}
                        color={i.severity==="high"?"error":i.severity==="moderate"?"warning":"default"}
                      />
                      <Typography variant="body2">{i.note}</Typography>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            ) : (
              <Typography>No rule matched in demo set.</Typography>
            )}
            <Typography variant="caption" sx={{ display:"block", opacity:0.7, mt:1 }}>
              {res.disclaimer}
            </Typography>

            {aiLoading && <LinearProgress sx={{ mt: 2 }} />}
            {ai && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>AI Education</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{ai.summary}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                  {ai.key_risks?.map((k, i)=><Chip key={i} label={k} />)}
                </Stack>
                <Typography variant="body2" sx={{ mt: 1, opacity: 0.9 }}>{ai.general_advice}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
