"use client";
import { ReactNode } from "react";
import { useUser } from "../store/useUser";
import { useAuthModal } from "../store/useAuthModal";
import { CircularProgress, Box, Button, Typography } from "@mui/material";

export default function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useUser();
  const { openModal } = useAuthModal();

  if (loading) {
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }
  if (!user) {
    return (
      <Box sx={{ py: 8, textAlign: "center" }}>
        <Typography variant="h6" sx={{ mb: 1 }}>Please sign in to continue</Typography>
        <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
          You need an account to use reports, symptoms, skin, knowledge and meds tools.
        </Typography>
        <Button variant="contained" onClick={openModal}>Login / Sign up</Button>
      </Box>
    );
  }
  return <>{children}</>;
}
