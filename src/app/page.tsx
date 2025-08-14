"use client";

import Link from "next/link";
import { useUser } from "../store/useUser";
import { useAuthModal } from "../store/useAuthModal";
import {
  Box, Container, Card, CardContent, Typography, Button, Stack, Chip,
} from "@mui/material";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";
import HealingIcon from "@mui/icons-material/Healing";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import MedicationIcon from "@mui/icons-material/Medication";
import PersonIcon from "@mui/icons-material/Person";

type CardItem = {
  href: string; title: string; desc: string;
  grad: "a"|"b"|"c"|"d"|"e"|"f"; icon: JSX.Element; tag?: string;
};

const cards: CardItem[] = [
  { href:"/analyze",   title:"Analyze Reports",  desc:"Upload lab/X‑ray/other medical reports for AI summary.", grad:"a", icon:<AnalyticsIcon/>,   tag:"OCR + AI" },
  { href:"/symptoms",  title:"Symptoms Checker", desc:"Enter symptoms to get possible categories + advice.",    grad:"b", icon:<TroubleshootIcon/>, tag:"Triage" },
  { href:"/skin",      title:"Skin Check",       desc:"Upload a skin photo for top‑k conditions (screening).", grad:"c", icon:<HealingIcon/>,     tag:"Vision" },
  { href:"/knowledge", title:"Knowledge",        desc:"Wikipedia‑backed education cards for conditions/terms.",grad:"d", icon:<MenuBookIcon/>,    tag:"Learn" },
  { href:"/meds",      title:"Meds Checker",     desc:"Check for possible medication interactions.",           grad:"e", icon:<MedicationIcon/>,  tag:"Safety" },
  { href:"/profile",   title:"Profile",          desc:"Privacy, consent, language, and data controls.",        grad:"f", icon:<PersonIcon/> },
];

export default function Home() {
  const { user } = useUser();
  const { openModal } = useAuthModal();

  const handleNav: React.MouseEventHandler<HTMLAnchorElement | HTMLButtonElement> =
    (e) => { if (!user) { e.preventDefault(); openModal(); } };

  return (
    <Box sx={{
      py: { xs: 1.5, md: 2 },
      background:
        "radial-gradient(1200px 600px at 0% 0%, rgba(114,125,255,.12), transparent 60%), " +
        "radial-gradient(1200px 600px at 100% 20%, rgba(0,220,190,.10), transparent 60%)",
    }}>
      <Container maxWidth="xl">
        {/* Heading */}
        <Stack spacing={0.5} sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{
            fontWeight: 900, letterSpacing: .2,
            background: "linear-gradient(90deg,#A5B4FC 0%, #5EEAD4 50%, #93C5FD 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Welcome to CareLens
          </Typography>
          <Typography variant="body1" component="div" sx={{ opacity: .9 }}>
            AI‑assisted health education tools
            <Chip label="Beta" size="small" sx={{ ml: 1 }} />{" "}
            <span style={{ opacity: .75 }}>(information only — not a diagnosis).</span>
          </Typography>
        </Stack>

        {/* ==== Cards grid (CSS Grid) ==== */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 2,
            alignItems: "stretch",
          }}
        >
          {cards.map((c) => (
            <Card
              key={c.href}
              className={`home-card grad-${c.grad}`}
              elevation={0}
              sx={{
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                p: 0.5,
                width: "100%",
                boxShadow: "0 1px 0 rgba(255,255,255,0.06) inset, 0 10px 30px rgba(0,0,0,0.25)",
                transition: "transform .2s ease, box-shadow .2s ease",
                "&:hover": { transform: "translateY(-4px)" },
              }}
            >
              <CardContent
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.2,
                  borderRadius: 2.5,
                  px: 2, py: 1.8,
                  background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {/* Title row */}
                <Stack direction="row" spacing={1.2} alignItems="center">
                  <Box sx={{
                    width: 34, height: 34, borderRadius: "10px",
                    display: "grid", placeItems: "center",
                    background: "rgba(255,255,255,0.12)", backdropFilter: "blur(4px)",
                  }}>
                    {c.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                    {c.title}
                  </Typography>
                  {c.tag && (
                    <Chip
                      label={c.tag}
                      size="small"
                      sx={{ ml: "auto", bgcolor: "rgba(255,255,255,0.16)" }}
                    />
                  )}
                </Stack>

                {/* Description */}
                <Typography variant="body2" sx={{ opacity: .9, lineHeight: 1.35 }}>
                  {c.desc}
                </Typography>

                {/* Button pinned to bottom */}
                <Box sx={{ mt: "auto" }}>
                  <Button
                    component={Link}
                    href={c.href}
                    onClick={handleNav}
                    variant="contained"
                    size="small"
                    sx={{ fontWeight: 700, letterSpacing: .6, px: 2 }}
                  >
                    OPEN
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>

        <Typography variant="caption" sx={{ display: "block", mt: 2, opacity: .7 }}>
          CareLens is for information only. It is not a medical diagnosis. Seek emergency care for severe symptoms.
        </Typography>
      </Container>
    </Box>
  );
}
