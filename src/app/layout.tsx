import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import AppNavbar from "../components/Navbar";
import AuthDialog from "../components/AuthDialog";

export const metadata: Metadata = {
  title: "CareLens",
  description: "AI-assisted health education tools",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppNavbar />
          <AuthDialog /> {/* modal mounted once at root */}
          <div className="page-wrap">{children}</div>
        </Providers>
      </body>
    </html>
  );
}
