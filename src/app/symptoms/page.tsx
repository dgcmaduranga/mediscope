"use client";

import { useState } from "react";
import {
  Card, CardContent, TextField, MenuItem, Button, Typography,
  Stack, Chip, LinearProgress, Box, Alert
} from "@mui/material";
import type { SymptomsRequest, SymptomsResponse } from "../../lib/types";

export default function SymptomsPage() {
  const [age, setAge] = useState<number>(24);
  const [sex, setSex] = useState<"male"|"female"|"other">("male");
  const [symptoms, setSymptoms] = useState<string>("");
  const [duration, setDuration] = useState<number>(3);

  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<SymptomsResponse | null>(null);

  // 👉 AI free-text (optional) from backend (if your route returns aiAnalysis)
  const [aiText, setAiText] = useState<string | null>(null);
  const [error, setError] = useState<string>("");

  const submit = async () => {
    setLoading(true);
    setRes(null);
    setAiText(null);
    setError("");

    try {
      const payload: SymptomsRequest = {
        age,
        sex,
        symptoms: symptoms.split(",").map(s => s.trim()).filter(Boolean),
        duration_days: duration,
      };

      const r = await fetch("/api/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await r.json();
      if (!r.ok) throw new Error(json?.error || "Request failed");

      // Backend may return the structured SymptomsResponse and optionally aiAnalysis text
      setRes(json as SymptomsResponse);
      setAiText((json as any).aiAnalysis ?? null);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack spacing={2} direction={{ xs: "column", sm: "row" }}>
            <TextField
              label="Age"
              type="number"
              value={age}
              onChange={(e) => setAge(Number(e.target.value))}
              fullWidth
            />
            <TextField
              select
              label="Sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as any)}
              fullWidth
            >
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <TextField
              label="Duration (days)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              fullWidth
            />
          </Stack>

          <TextField
            sx={{ mt: 2 }}
            label="Symptoms (comma-separated)"
            placeholder="fever, sore throat, cough, runny nose, body aches"
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            fullWidth
          />

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button variant="contained" onClick={submit} disabled={loading}>
              {loading ? "Checking..." : "Check"}
            </Button>
            <Button variant="outlined" onClick={() => { setRes(null); setAiText(null); }} disabled={loading}>
              Clear
            </Button>
          </Stack>

          {loading && <LinearProgress sx={{ mt: 2 }} />}
          {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
        </CardContent>
      </Card>

      {res && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Results</Typography>

            <Typography variant="subtitle2">Red-flags</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
              {res.red_flags?.length
                ? res.red_flags.map((f, i) => <Chip key={i} color="warning" label={f} />)
                : <Chip label="No red-flag matched" />}
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Differential categories</Typography>
            <Stack spacing={1} sx={{ mt: 1 }}>
              {res.differentials?.map((d, i) => (
                <Card key={i} variant="outlined" sx={{ p: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{d.condition}</Typography>
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>{d.rationale}</Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                    <Box sx={{ flex: 1 }}>
                      <LinearProgress variant="determinate" value={Math.round((d.likelihood ?? 0)*100)} />
                    </Box>
                    <Typography variant="caption">{Math.round((d.likelihood ?? 0)*100)}%</Typography>
                  </Box>
                </Card>
              ))}
            </Stack>

            <Typography variant="subtitle2" sx={{ mt: 2 }}>Advice</Typography>
            <Typography variant="body2">{res.care_advice}</Typography>

            {/* 🔹 Optional AI free-text (if your backend returns aiAnalysis) */}
            {aiText && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>AI Analysis</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{aiText}</Typography>
              </>
            )}

            <Typography variant="caption" sx={{ display: "block", opacity: 0.7, mt: 2 }}>
              This tool is for information only; not a diagnosis. Seek emergency care for severe symptoms.
            </Typography>
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
