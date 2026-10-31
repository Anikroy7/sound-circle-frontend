import type { Instrument } from "@/types/landing";

export const instruments: Instrument[] = [
  { slug: "guitar", name: "Guitar", tone: "teal" },
  { slug: "drums", name: "Drums", tone: "violet" },
  { slug: "bass", name: "Bass", tone: "amber" },
  { slug: "vocals", name: "Vocals", tone: "blue" },
  { slug: "keyboard", name: "Keyboard", tone: "rose" },
  { slug: "tabla", name: "Tabla & percussion", tone: "teal" },
  { slug: "bansuri", name: "Bansuri / flute", tone: "violet" },
  { slug: "violin", name: "Violin & strings", tone: "amber" },
];

export const genres: string[] = [
  "Rock",
  "Metal",
  "Bangla folk",
  "Fusion",
  "Indie",
  "Pop",
  "Blues",
  "Jazz",
  "Baul",
  "Nazrul Sangeet",
  "Hip-hop",
  "Classical",
];

export const cities: string[] = ["Dhaka", "Chattogram", "Sylhet", "Rajshahi", "Khulna", "Barishal", "Rangpur", "Mymensingh"];
