"use client";

import { useState } from "react";
import FileDrop from "../../components/FileDrop";
import type { SkinResponse } from "../../lib/types";
import {
  Card, CardContent, Typography, Stack, LinearProgress, Box, Button, Chip, Alert
} from "@mui/material";

export default function SkinPage() {
  const [res, setRes] = useState<SkinResponse | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [filename, setFilename] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiRes, setAiRes] = useState<SkinResponse | null>(null);
  const [error, setError] = useState("");

  let lastFile: File | null = null;

  const upload = async (file: File) => {
    setFilename(file.name);
    setPreview(URL.createObjectURL(file));
    setError(""); setAiRes(null);
    lastFile = file;

    // keep old mock for instant feedback
    const mock: SkinResponse = {
      top: [
        { condition: "Eczema (example)", confidence: 0.41, description: "Itchy, dry patches; worsens with irritants." },
        { condition: "Psoriasis (example)", confidence: 0.33, description: "Well‑defined plaques with silvery scales." },
        { condition: "Benign nevus (example)", confidence: 0.16, description: "Stable, symmetric mole." },
      ],
      note: "Screening only. If a lesion is new, changing, bleeding, or asymmetric with irregular borders, see a clinician promptly."
    };
    setRes(mock);
  };

  const aiAnalyze = async () => {
    try {
      setError(""); setAiRes(null); setLoading(true);
      const input = (document.querySelector('input[type=file]') as HTMLInputElement)?.files?.[0] || null;
      const file = input ?? (lastFile as File | null);
      if (!file) { setError("Please upload an image first."); setLoading(false); return; }

      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/skin/ai", { method: "POST", body: fd });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "AI request failed");
      setAiRes(data as SkinResponse);
    } catch (e: any) {
      setError(e.message || "AI error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack spacing={2}>
      <FileDrop accept="image/*" onUpload={upload} maxSizeMB={10} />

      {(preview || res || aiRes) && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>Result {filename && `for: ${filename}`}</Typography>

            {preview && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 2 }}>
                <Box sx={{ width: 240, borderRadius: 2, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="preview" style={{ width: "100%", display: "block" }} />
                </Box>
              </Box>
            )}

            {res && (
              <>
                <Typography variant="subtitle2">Quick (mock) suggestions</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {res.top.map((p, i) => (
                    <Card key={i} variant="outlined" sx={{ p: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{p.condition}</Typography>
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>{p.description}</Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        <LinearProgress variant="determinate" value={Math.round(p.confidence * 100)} />
                        <Typography variant="caption">{Math.round(p.confidence * 100)}%</Typography>
                      </Box>
                    </Card>
                  ))}
                  <Typography variant="caption" sx={{ opacity: 0.75 }}>{res.note}</Typography>
                </Stack>
              </>
            )}

            <Stack direction="row" spacing={1} sx={{ mt: 2, alignItems: "center" }}>
              <Button variant="contained" onClick={aiAnalyze} disabled={loading}>
                {loading ? "Analyzing…" : "AI Analyze"}
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>

            {aiRes && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>AI Results (education‑only)</Typography>
                <Stack spacing={1} sx={{ mt: 1 }}>
                  {aiRes.top.map((p, i) => (
                    <Card key={i} variant="outlined" sx={{ p: 1 }}>
                      <Typography sx={{ fontWeight: 600 }}>{p.condition}</Typography>
                      {p.description && <Typography variant="body2" sx={{ opacity: 0.9 }}>{p.description}</Typography>}
                      <Chip sx={{ mt: 1 }} label={`Confidence: ${Math.round(p.confidence*100)}%`} />
                    </Card>
                  ))}
                </Stack>
                <Typography variant="caption" sx={{ opacity: 0.75, mt: 1 }}>
                  {aiRes.note}
                </Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}




