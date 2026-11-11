import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/patterns/patterns.module.css";
import { ArrowUpRightIcon } from "@/components/shell/shell-icons";

/** Tile accents; each tile shows a soft tint of its colour. */
export const TILE_COLOURS = [
  "#e8590c",
  "#c2255c",
  "#7048e8",
  "#1c7ed6",
  "#0c8599",
  "#2b8a3e",
  "#a61e4d",
  "#5f3dc4",
  "#d9480f",
  "#087f5b",
  "#364fc7",
  "#862e9c",
];

export const tileColour = (index: number): string => TILE_COLOURS[index % TILE_COLOURS.length];

const SLUGS: [string, string][] = [
  ["bass", "bass"],
  ["guitar", "guitar"],
  ["drum", "drums"],
  ["vocal", "vocals"],
  ["sing", "vocals"],
  ["key", "keyboard"],
  ["piano", "keyboard"],
  ["tabla", "tabla"],
  ["bansuri", "bansuri"],
  ["flute", "bansuri"],
  ["violin", "violin"],
];

/** The drawing for an instrument, from its name ("Bass guitar" is a bass); anything else gets the note. */
export const instrumentSlug = (name: string): string => SLUGS.find(([part]) => name.toLowerCase().includes(part))?.[1] ?? "note";

/** A drawing for the n-th browse tile that isn't an instrument (a genre). */
export const tileIcon = (index: number): string => ["guitar", "drums", "vocals", "bass", "keyboard", "violin"][index % 6];

/** A compact shortcut: a tinted icon, a label, and an arrow on hover. */
export function QuickTile({ href, label, icon, colour }: { href: string; label: string; icon: ReactNode; colour: string }): React.JSX.Element {
  return (
    <Link href={href} className={styles.quick}>
      <span className={styles.quickArt} style={{ "--c": colour } as CSSProperties} aria-hidden="true">
        {icon}
      </span>
      <span className={styles.quickLabel}>{label}</span>
      <span className={styles.quickButton} aria-hidden="true">
        <ArrowUpRightIcon size={16} />
      </span>
    </Link>
  );
}

/** A softly tinted block with a title and an icon in the corner: for browsing by genre or instrument. */
export function BrowseTile({ href, label, icon, colour }: { href: string; label: string; icon: ReactNode; colour: string }): React.JSX.Element {
  return (
    <Link href={href} className={styles.browse} style={{ "--c": colour } as CSSProperties}>
      {label}
      <span className={styles.browseIcon} aria-hidden="true">
        {icon}
      </span>
    </Link>
  );
}
