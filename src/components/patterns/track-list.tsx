import type { CSSProperties, ReactNode } from "react";
import styles from "@/components/patterns/patterns.module.css";

interface TrackListProps {
  /** Column headings; `null` leaves a column untitled. */
  head: (string | null)[];
  /** The grid columns, e.g. `"32px 1fr 180px 120px"`; head and rows share it. */
  columns: string;
  children: ReactNode;
}

/** A numbered list in the style of a tracklist: a header row, then rows that light up on hover. */
export function TrackList({ head, columns, children }: TrackListProps): React.JSX.Element {
  return (
    <div className={styles.tracks} role="table" style={{ "--cols": columns } as CSSProperties}>
      <div className={styles.trackHead} role="row">
        {head.map((label, index) => (
          <span key={index} role="columnheader" className={index === 0 ? styles.trackIndex : undefined}>
            {label}
          </span>
        ))}
      </div>
      {children}
    </div>
  );
}

interface TrackRowProps {
  index: ReactNode;
  art?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  cells?: ReactNode[];
  /** Extra class names, e.g. while this row's audio plays. */
  className?: string;
}

/** One row: number, art, title with a line under it, then the other columns. */
export function TrackRow({ index, art, title, subtitle, cells = [], className = "" }: TrackRowProps): React.JSX.Element {
  return (
    <div className={`${styles.track} ${className}`} role="row">
      <span className={styles.trackIndex} role="cell">
        {index}
      </span>
      <span className={styles.trackMain} role="cell">
        {art}
        <span className={styles.trackTitle}>
          {title}
          {subtitle && <span className={styles.trackSub}>{subtitle}</span>}
        </span>
      </span>
      {cells.map((cell, position) => (
        <span key={position} className={styles.trackCell} role="cell">
          {cell}
        </span>
      ))}
    </div>
  );
}
