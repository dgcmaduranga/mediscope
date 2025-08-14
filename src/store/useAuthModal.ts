"use client";
import { create } from "zustand";

type AuthModalState = {
  open: boolean;
  openModal: () => void;
  close: () => void;
};

export const useAuthModal = create<AuthModalState>((set) => ({
  open: false,
  openModal: () => set({ open: true }),
  close: () => set({ open: false }),
}));
