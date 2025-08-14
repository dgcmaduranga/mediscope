"use client";
import { create } from "zustand";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../lib/firebase";

type State = {
  user: User | null;
  loading: boolean;
  init: boolean;
  logout: () => Promise<void>;
};

export const useUser = create<State>(() => ({
  user: null,
  loading: true,
  init: false,
  logout: async () => { await signOut(auth); },
}));

// Start Firebase auth listener exactly once (call in providers.tsx)
let started = false;
export function startUserListener() {
  if (started) return;
  started = true;
  const { setState } = useUser;
  onAuthStateChanged(auth, (u) => {
    setState({ user: u, loading: false, init: true });
  });
}

