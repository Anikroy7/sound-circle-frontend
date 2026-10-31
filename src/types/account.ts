import type { PersonRef } from "@/types/common";

export interface Viewer extends PersonRef {
  firstName: string;
  unreadNotifications: number;
  newInvitations: number;
}

export interface OnboardingStep {
  label: string;
  href: string;
}

export interface ToggleOption {
  label: string;
  selected: boolean;
}

export interface PrivacySetting {
  title: string;
  hint: string;
  options: string[];
}
