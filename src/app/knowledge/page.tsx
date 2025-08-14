"use client";
import { useState } from "react";
import { Card, CardContent, TextField, Button, Typography, Link, Stack, Alert } from "@mui/material";
import type { WikiResponse } from "../../lib/types";

export default function KnowledgePage() {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<WikiResponse | null>(null);
  const [ai, setAi] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setLoading(true); setAi(""); setError(""); setRes(null);
    try {
      const r = await fetch(`/api/wiki?q=${encodeURIComponent(q.trim())}`);
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "Search failed");
      setRes(data as WikiResponse);
    } catch (e:any) { setError(e.message || "Error"); }
    finally { setLoading(false); }
  };

  const summarize = async () => {
    if (!res) return;
    setAiLoading(true); setError("");
    try {
      const r = await fetch("/api/wiki/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: res.title, summary: res.summary }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data?.error || "AI failed");
      setAi(data.ai || "");
    } catch (e:any) { setError(e.message || "AI error"); }
    finally { setAiLoading(false); }
  };

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField label="Condition / term" fullWidth value={q} onChange={(e)=>setQ(e.target.value)} />
            <Button variant="contained" onClick={search} disabled={loading}>Search</Button>
          </Stack>
          {error && <Alert sx={{ mt: 2 }} severity="error">{error}</Alert>}
        </CardContent>
      </Card>

      {res && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>{res.title}</Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>{res.summary}</Typography>
            <Link href={res.url} target="_blank" rel="noreferrer">Open on Wikipedia</Link>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={summarize} disabled={aiLoading}>
                {aiLoading ? "Summarizing…" : "AI Summary"}
              </Button>
            </Stack>

            {ai && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 2 }}>AI Summary (education‑only)</Typography>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>{ai}</Typography>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </Stack>
  );
}
