"use client";

import Link from "next/link";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Stack,
  Button,
} from "@mui/material";
import RightAuthArea from "./RightAuthArea";
import AuthDialog from "./AuthDialog";
import { useUser } from "../store/useUser";
import { useAuthModal } from "../store/useAuthModal";

const links = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Reports" },
  { href: "/symptoms", label: "Symptoms" },
  { href: "/skin", label: "Skin" },
  { href: "/knowledge", label: "Knowledge" },
  { href: "/meds", label: "Meds" },
  { href: "/profile", label: "Profile" },
];

export default function AppNavbar() {
  const { user } = useUser();
  const { openModal } = useAuthModal();

  const protectedPaths = new Set([
    "/analyze",
    "/symptoms",
    "/skin",
    "/knowledge",
    "/meds",
    "/profile",
  ]);

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{ background: "linear-gradient(90deg,#0b1b3a,#12224a)" }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Brand / left */}
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          <Link href="/" style={{ textDecoration: "none", color: "inherit" }}>
            CareLens
          </Link>
        </Typography>

        {/* center nav */}
        <Box sx={{ flexGrow: 1 }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          {links.map((l) => (
            <Button
              key={l.href}
              component={Link}
              href={l.href}
              onClick={(e) => {
                if (!user && protectedPaths.has(l.href)) {
                  e.preventDefault();
                  openModal();
                }
              }}
              color="inherit"
              sx={{ opacity: 0.9 }}
            >
              {l.label.toUpperCase()}
            </Button>
          ))}
        </Stack>
        <Box sx={{ flexGrow: 1 }} />

        {/* right auth area */}
        <RightAuthArea />

        {/* mount global auth modal */}
        <AuthDialog />
      </Toolbar>
    </AppBar>
  );
}
