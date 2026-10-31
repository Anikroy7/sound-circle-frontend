import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { NoteIcon } from "@/components/ui/icons";
import { recentMembers } from "@/demo-data/musicians";
import { routes } from "@/lib/routes";
import { tones } from "@/lib/tones";

export function RecentlyJoined(): React.JSX.Element {
  return (
    <section className={`${styles.container} ${styles.sectionStack} ${styles.recent}`}>
      <div className={styles.sectionTitleGroup}>
        <span className="track-label">Track 05</span>
        <h2 className={`display ${styles.recentTitle}`}>Recently joined</h2>
      </div>
      <div className={styles.recentGrid}>
        {recentMembers.map((member) => (
          <Link key={member.slug} href={routes.musician(member.slug)} className={`card hover-lift ${styles.recentTile}`}>
            <span className={`avatar ${styles.recentAvatar}`} style={{ background: tones[member.tone].ink }} aria-hidden="true">
              {member.initials}
            </span>
            <span className={styles.recentText}>
              <strong className={styles.recentName}>{member.name}</strong>
              <span className={`muted ${styles.recentRole}`}>
                {member.role} · {member.city}
              </span>
            </span>
            <NoteIcon />
          </Link>
        ))}
      </div>
    </section>
  );
}
