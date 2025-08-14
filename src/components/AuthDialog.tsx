"use client";
import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, Alert, ToggleButtonGroup, ToggleButton
} from "@mui/material";
import {
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { useAuthModal } from "../store/useAuthModal";

export default function AuthDialog() {
  const { open, close } = useAuthModal();
  const [mode, setMode] = useState<"login"|"signup">("login");
  const [email, setEmail] = useState(""); const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false); const [err, setErr] = useState("");

  useEffect(() => { if (!open) { setErr(""); setPw(""); } }, [open]);

  const submit = async () => {
    setBusy(true); setErr("");
    try {
      if (mode === "login") await signInWithEmailAndPassword(auth, email, pw);
      else await createUserWithEmailAndPassword(auth, email, pw);
      close();
    } catch (e:any) { setErr(e.message || "Auth error"); }
    finally { setBusy(false); }
  };
  const google = async () => {
    setBusy(true); setErr("");
    try { await signInWithPopup(auth, googleProvider); close(); }
    catch (e:any) { setErr(e.message || "Google sign-in failed"); }
    finally { setBusy(false); }
  };

  return (
    <Dialog open={open} onClose={close} fullWidth maxWidth="xs">
      <DialogTitle>Account</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <ToggleButtonGroup exclusive value={mode} onChange={(_,v)=>v && setMode(v)}>
            <ToggleButton value="login">Login</ToggleButton>
            <ToggleButton value="signup">Sign up</ToggleButton>
          </ToggleButtonGroup>
          <TextField label="Email" type="email" value={email} onChange={e=>setEmail(e.target.value)} fullWidth />
          <TextField label="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} fullWidth />
          {err && <Alert severity="error">{err}</Alert>}
          <Button variant="outlined" onClick={google} disabled={busy}>Continue with Google</Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={close}>Close</Button>
        <Button variant="contained" onClick={submit} disabled={busy}>
          {mode==="login" ? "Login" : "Create account"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
