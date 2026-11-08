import type { Tone } from "@/types/common";

const AVATAR_TONES: Tone[] = ["teal", "violet", "amber", "blue", "rose", "lime"];

/** "Anik Kumer Roy" → "AR", "Rafiq" → "R": the first and last word's first letters. */
export function initialsOf(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "?";
  const first = Array.from(words[0])[0];
  const last = words.length > 1 ? Array.from(words[words.length - 1])[0] : "";
  return `${first}${last}`.toUpperCase();
}

/** The same account always gets the same avatar colour. */
export const toneFor = (id: number): Tone => AVATAR_TONES[Math.abs(id) % AVATAR_TONES.length];
