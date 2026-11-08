import type { PersonRef } from "@/types/common";

export interface Viewer extends PersonRef {
  firstName: string;
  unreadNotifications: number;
  newInvitations: number;
}
