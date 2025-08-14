"use client";

import { useState, useRef } from "react";
import { useUser } from "@/store/useUser";
import {
  Box, Paper, Stack, Avatar, Typography, Button, TextField, Chip, LinearProgress, Alert
} from "@mui/material";
import { auth, storage } from "@/lib/firebase";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function ProfilePage() {
  const { user } = useUser();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{type:"success"|"error"; text:string} | null>(null);

  if (!user) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">Please log in to see and edit your profile.</Alert>
      </Box>
    );
  }

  const pickFile = () => fileRef.current?.click();

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setMsg({ type:"error", text:"Please choose an image file." }); return;
    }
    try {
      setBusy(true); setMsg(null);
      const path = `users/${user.uid}/avatar.${f.name.split(".").pop() || "jpg"}`;
      const storageRef = ref(storage, path);
      await uploadBytes(storageRef, f, { contentType: f.type });
      const url = await getDownloadURL(storageRef);
      await updateProfile(auth.currentUser!, { photoURL: url });
      setMsg({ type:"success", text:"Avatar updated!" });
      // hard refresh user in UI (store listens to auth state; photoURL cached → force repaint)
      window.location.reload();
    } catch (err:any) {
      setMsg({ type:"error", text: err?.message || "Upload failed" });
    } finally {
      setBusy(false);
    }
  };

  const saveName = async () => {
    if (!displayName.trim()) {
      setMsg({ type:"error", text:"Name can’t be empty." }); return;
    }
    try {
      setBusy(true); setMsg(null);
      await updateProfile(auth.currentUser!, { displayName: displayName.trim() });
      setMsg({ type:"success", text:"Name updated!" });
      // soft refresh:
      setTimeout(()=>window.location.reload(), 500);
    } catch (e:any) {
      setMsg({ type:"error", text: e?.message || "Update failed" });
    } finally { setBusy(false); }
  };

  const initial = (user.displayName?.[0] || user.email?.[0] || "U").toUpperCase();

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, display: "grid", placeItems: "center" }}>
      <Paper
        elevation={0}
        sx={{
          width: "100%", maxWidth: 560, p: 3, borderRadius: 4,
          border: "1px solid rgba(255,255,255,0.12)",
          background:
            "linear-gradient(180deg, rgba(255,255,255,.05), rgba(255,255,255,.02))," +
            "radial-gradient(600px 180px at 0% 0%, rgba(99,102,241,.18), transparent 60%)",
        }}
      >
        <Stack spacing={3} alignItems="center">
          <Box sx={{ position: "relative" }}>
            <Avatar
              src={user.photoURL || undefined}
              alt={user.displayName || "User"}
              sx={{
                width: 120, height: 120, fontSize: 40, fontWeight: 800,
                bgcolor: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.25)"
              }}
            >
              {initial}
            </Avatar>
            <Button
              size="small"
              variant="contained"
              onClick={pickFile}
              sx={{ position: "absolute", right: -6, bottom: -6, borderRadius: 20 }}
            >
              Change
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={onFile}
            />
          </Box>

          <Stack spacing={1} alignItems="center" sx={{ width: "100%" }}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              {user.displayName || "No Name"}
            </Typography>
            <Typography variant="body2" sx={{ opacity: .85 }}>{user.email}</Typography>
            <Stack direction="row" spacing={1} sx={{ mt: .5 }}>
              <Chip size="small" label={`UID: ${user.uid.slice(0,8)}…`} />
              {user.emailVerified ? <Chip size="small" color="success" label="Verified" /> : <Chip size="small" color="warning" label="Not verified" />}
            </Stack>
          </Stack>

          {/* Edit name */}
          <Stack direction={{ xs:"column", sm:"row" }} spacing={1} sx={{ width: "100%" }}>
            <TextField
              label="Display name"
              fullWidth
              value={displayName}
              onChange={(e)=>setDisplayName(e.target.value)}
            />
            <Button variant="outlined" onClick={saveName} disabled={busy}>Save</Button>
          </Stack>

          {busy && <LinearProgress sx={{ width: "100%" }} />}
          {msg && <Alert severity={msg.type} sx={{ width: "100%" }}>{msg.text}</Alert>}

          <Typography variant="caption" sx={{ opacity:.7 }}>
            We only use your avatar & name for your account. You can delete or change them anytime.
          </Typography>
        </Stack>
      </Paper>
    </Box>
  );
}
