import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: { main: "#60A5FA" },
    secondary: { main: "#22D3EE" },
    background: {
      default: "#0e1528",   // slightly lighter deep blue
      paper: "rgba(14,21,40,0.55)", // translucent “glass”
    },
    text: {
      primary: "rgba(255,255,255,.92)",
      secondary: "rgba(255,255,255,.78)",
    },
  },
  zIndex: { appBar: 1100, drawer: 1200, modal: 20000 },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backdropFilter: "blur(12px)",           // glass blur
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,.08), rgba(255,255,255,.03))",
          border: "1px solid rgba(255,255,255,.12)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { textTransform: "none", fontWeight: 700, borderRadius: 10 },
        contained: {
          background: "linear-gradient(90deg, #60A5FA 0%, #22D3EE 100%)",
        },
      },
    },
  },
});

export default theme;
