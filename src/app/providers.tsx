"use client";
import { ReactNode, useEffect } from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme from "../styles/theme";
import { startUserListener } from "../store/useUser";

export default function Providers({ children }: { children: ReactNode }) {
  useEffect(() => { startUserListener(); }, []);
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

