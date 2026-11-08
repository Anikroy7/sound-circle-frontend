"use client";

import { createContext, useContext } from "react";
import type { CatalogItem, MusicianProfile } from "@/types/profile";

/** "next" goes on to the following step; "later" saves and leaves for the dashboard. */
export type SaveMode = "next" | "later";

export interface WizardContextValue {
  /** The profile as last saved; a step's form starts from it. */
  profile: MusicianProfile;
  catalog: { instruments: CatalogItem[]; genres: CatalogItem[] };
  /** For changes that save themselves (an upload, a band), without leaving the step. */
  setProfile: (profile: MusicianProfile) => void;
  /** Runs one step save, then navigates. Shows the API's error above the buttons on failure. */
  submit: (mode: SaveMode, save: () => Promise<MusicianProfile>) => Promise<void>;
  pending: boolean;
  /** The step-level error shown above the actions. */
  error: string | null;
  setError: (message: string | null) => void;
  /** 1–8. */
  stepNumber: number;
  /**
   * Set when the form is editing a finished section from the profile page rather than walking the
   * wizard: the actions become Cancel · Save changes, and saving stays on the page.
   */
  editing?: { onCancel: () => void };
}

export const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard(): WizardContextValue {
  const value = useContext(WizardContext);
  if (!value) throw new Error("useWizard() outside ProfileWizard");
  return value;
}
