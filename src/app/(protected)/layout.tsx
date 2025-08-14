"use client";
import { ReactNode } from "react";
import RequireAuth from "../../components/RequireAuth";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  return <RequireAuth>{children}</RequireAuth>;
}

