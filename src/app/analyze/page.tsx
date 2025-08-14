"use client";
// ADD at top with others
import { ocrPdf } from "../../lib/pdf-ocr";

import { useState } from "react";
import FileDrop from "../../components/FileDrop";
import { LabReportResponse, AIAnalysis } from "../../lib/types";
import { ocrImage } from "../../lib/ocr";
import { parseLabText, toResponse } from "../../lib/labs";
import {
  Card, CardContent, Typography, Chip, Stack, Divider, Box,
  LinearProgress, TextField, Button, Alert,
} from "@mui/material";

export default function AnalyzePage() {
  const [res, setRes] = useState<LabReportResponse | null>(null);
  const [ai, setAi] = useState<AIAnalysis | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [ocrProgress, setOcrProgress] = useState<number>(0);
  const [raw, setRaw] = useState<string>("");        // raw OCR text
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const upload = async (file: File) => {
    setRes(null); setAi(null); setRaw(""); setError(""); setOcrProgress(0);
    setFilename(file.name);

    if (file.type.startsWith("image/")) {
      // Client-side OCR for images
      const text = await ocrImage(file, (p) => setOcrProgress(p));
      setRaw(text);
      const values = parseLabText(text);
      const response = toResponse(values, !!text.trim());
      setRes(response);
      return;
    }

    // PDFs: still using mock endpoint for now
    const fd = new FormData();
    fd.append("file", file);
    const r = await fetch("/api/analyze", { method: "POST", body: fd });
    const data = await r.json();
    if (!r.ok) { setError(data?.error || "Upload failed"); return; }
    setRes(data as LabReportResponse);
  };

  const runAI = async () => {
    if (!res) return;
    setAi(null); setError(""); setAiLoading(true);
    try {
      const r = await fetch("/api/analyze/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw_text: raw, values: res.extracted }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "AI request failed");
      setAi(data as AIAnalysis);
    } catch (e: any) {
      setError(e.message || "AI error");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <FileDrop onUpload={upload} />

      {error && <Alert severity="error">{error}</Alert>}

      {ocrProgress > 0 && ocrProgress < 100 && (
        <Card variant="outlined">
          <CardContent>
            <Typography>OCR in progress… {ocrProgress}%</Typography>
            <LinearProgress variant="determinate" value={ocrProgress} sx={{ mt: 1 }} />
          </CardContent>
        </Card>
      )}

      {raw && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>Raw OCR text</Typography>
            <TextField value={raw} onChange={(e)=>setRaw(e.target.value)} fullWidth multiline minRows={6} />
          </CardContent>
        </Card>
      )}

      {res && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Result for: {filename}</Typography>
            <Typography variant="subtitle2" gutterBottom>Summary</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>{res.summary}</Typography>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle2" gutterBottom>Extracted values</Typography>
            {res.extracted.length ? (
              <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px,1fr))", gap: 1 }}>
                {res.extracted.map((x, i) => (
                  <Card key={i} sx={{ p: 1 }} variant="outlined">
                    <Typography sx={{ fontWeight: 600 }}>{x.name}</Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {x.value} {x.unit ?? ""}
                    </Typography>
                    {x.ref_low != null && x.ref_high != null && (
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        Range: {x.ref_low} – {x.ref_high}
                      </Typography>
                    )}
                    {x.interpretation && (
                      <Chip size="small" label={x.interpretation} sx={{ mt: 1 }} />
                    )}
                  </Card>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ opacity: 0.85 }}>
                No structured values detected. Check the “Raw OCR text” above to confirm the text was read.
              </Typography>
            )}

            <Divider sx={{ my: 2 }} />
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <Typography variant="subtitle2">AI analysis</Typography>
              <Button variant="contained" onClick={runAI} disabled={aiLoading}>
                {aiLoading ? "Analyzing…" : "AI Explain"}
              </Button>
            </Stack>

            {ai && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" sx={{ mb: 1 }}>{ai.summary}</Typography>
                <Chip
                  label={`Risk: ${ai.risk_level.toUpperCase()}`}
                  color={ai.risk_level === "high" ? "error" : ai.risk_level === "moderate" ? "warning" : "default"}
                  sx={{ mb: 1 }}
                />
                <Typography variant="subtitle2">Insights</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {ai.insights.map((it, idx) => (
                    <Card key={idx} variant="outlined" sx={{ p: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{it.name}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>{it.comment}</Typography>
                    </Card>
                  ))}
                </Stack>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>Cautions</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
                  {ai.cautions.map((c, i) => <Chip key={i} label={c} />)}
                </Stack>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
const upload = async (file: File) => {
  setRes(null); setAi(null); setRaw(""); setError(""); setOcrProgress(0);
  setFilename(file.name);

  if (file.type.startsWith("image/")) {
    // Client-side OCR for images
    const text = await ocrImage(file, (p) => setOcrProgress(p));
    setRaw(text);
    const values = parseLabText(text);
    const response = toResponse(values, !!text.trim());
    setRes(response);
    return;
  }

  if (file.type === "application/pdf") {
    // 🔹 NEW: Client-side PDF OCR
    const text = await ocrPdf(file, (p) => setOcrProgress(p), 3);
    setRaw(text);
    const values = parseLabText(text);
    const response = toResponse(values, !!text.trim());
    setRes(response);
    return;
  }

  // fallback (unknown types) → old mock API
  const fd = new FormData();
  fd.append("file", file);
  const r = await fetch("/api/analyze", { method: "POST", body: fd });
  const data = await r.json();
  if (!r.ok) { setError(data?.error || "Upload failed"); return; }
  setRes(data as LabReportResponse);
};




