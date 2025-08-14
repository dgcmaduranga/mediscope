"use client";
import { Button, Stack, Avatar, Typography } from "@mui/material";
import { useUser } from "../store/useUser";
import { useAuthModal } from "../store/useAuthModal";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";

export default function RightAuthArea() {
  const { user, logout } = useUser();
  const { openModal } = useAuthModal();

  if (user) {
    const letter = (user.displayName?.[0] || user.email?.[0] || "U").toUpperCase();
    const doLogout = logout ?? (async () => { await signOut(auth); }); // fallback
    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar sx={{ width: 28, height: 28 }}>{letter}</Avatar>
        <Typography variant="body2" sx={{ opacity: .85, maxWidth: 140 }} noWrap>
          {user.displayName || user.email}
        </Typography>
        <Button size="small" variant="outlined" onClick={doLogout}>Logout</Button>
      </Stack>
    );
  }

  return (
    <Stack direction="row" spacing={1}>
      <Button size="small" variant="outlined" onClick={openModal}>Login</Button>
      <Button size="small" variant="contained" onClick={openModal}>Sign up</Button>
    </Stack>
  );
}

