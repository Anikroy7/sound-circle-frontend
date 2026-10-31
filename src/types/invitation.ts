import type { PersonRef, Status, Tone } from "@/types/common";

export interface ReceivedInvitation {
  id: string;
  band: string;
  bandSlug: string;
  monogram: string;
  tone: Tone;
  role: string;
  city: string;
  genre: string;
  bandType: string;
  rehearsals: string;
  expires: string;
  status: Status;
  owner: PersonRef;
  sent: string;
  message: string;
  members: (PersonRef & { role: string })[];
}
