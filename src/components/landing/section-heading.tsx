import Link from "next/link";
import styles from "@/components/landing/landing.module.css";

interface SectionHeadingProps {
  track: string;
  title: string;
  lead?: string;
  link?: { href: string; label: string };
}

/** A "Track 0N" label, the section title and an optional "see all" link on the right. */
export function SectionHeading({ track, title, lead, link }: SectionHeadingProps): React.JSX.Element {
  return (
    <div className={styles.sectionHead}>
      <div className={styles.sectionTitleGroup}>
        <span className="track-label">{track}</span>
        <h2 className={`display ${styles.sectionTitle}`}>{title}</h2>
        {lead && <p className="muted">{lead}</p>}
      </div>
      {link && (
        <Link href={link.href} className={styles.sectionLink}>
          {link.label} →
        </Link>
      )}
    </div>
  );
}
