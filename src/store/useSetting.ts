"use client";
import { create } from "zustand";

type Settings = {
  language: "en";
  consent_store_data: boolean;
  setConsent: (v: boolean) => void;
};

export const useSettings = create<Settings>((set) => ({
  language: "en",
  consent_store_data: false,
  setConsent: (v) => set({ consent_store_data: v }),
}));
