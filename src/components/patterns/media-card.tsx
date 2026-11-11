import Link from "next/link";
import styles from "@/components/patterns/patterns.module.css";
import { Avatar } from "@/components/ui/avatar";
import { initialsOf, toneFor } from "@/lib/person";

interface MediaCardProps {
  href: string;
  title: string;
  subtitle?: string;
  /** Short highlight under the subtitle, e.g. "Looking for Drums". */
  tag?: string | null;
  /** Seeds the placeholder colour. */
  id: number;
  photoUrl?: string | null;
  /** Musicians are round, bands are square. */
  round?: boolean;
}

/** A card: square (or round) art, a title and a line under it, with an optional highlight. */
export function MediaCard({ href, title, subtitle, tag, id, photoUrl, round = false }: MediaCardProps): React.JSX.Element {
  return (
    <Link href={href} className={styles.card}>
      <span className={styles.cardArtWrap}>
        <Avatar
          initials={initialsOf(title)}
          tone={toneFor(id)}
          size={180}
          shape={round ? "circle" : "square"}
          photoUrl={photoUrl}
          className={`display ${styles.cardArt} ${round ? styles.cardArtRound : ""}`}
        />
      </span>
      <span className={styles.cardTitle}>{title}</span>
      {subtitle && <span className={styles.cardSub}>{subtitle}</span>}
      {tag && <span className={styles.cardTag}>{tag}</span>}
    </Link>
  );
}

/** The shape of a card while its data loads. */
export function CardSkeleton(): React.JSX.Element {
  return <span className={styles.cardSkeleton} aria-hidden="true" />;
}
