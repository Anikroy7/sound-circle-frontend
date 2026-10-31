import Link from "next/link";
import styles from "@/components/discover/discover.module.css";
import { Avatar } from "@/components/ui/avatar";
import { PinIcon, PlayIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import { chipClass } from "@/lib/tones";
import type { DiscoverResult } from "@/types/musician";

export function MusicianResultCard({ musician }: { musician: DiscoverResult }): React.JSX.Element {
  return (
    <article className={`card ${styles.card}`}>
      <div className={styles.cardTop}>
        <Avatar initials={musician.initials} tone={musician.tone} size={72} shape="square" variant="tinted" className="display" />
        <div className={styles.identity}>
          <strong className={`display ${styles.name}`}>{musician.name}</strong>
          <span className={styles.instrument}>{musician.instrument}</span>
          <div className={`muted ${styles.location}`}>
            <PinIcon size={13} color="currentColor" />
            {musician.location} · {musician.distance}
          </div>
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.chipList}>
          {musician.genres.map((genre) => (
            <span key={genre} className="chip">
              {genre}
            </span>
          ))}
        </div>
        <dl className={styles.stats}>
          <div>
            <dt className="muted">Experience</dt>
            <dd>{musician.experience}</dd>
          </div>
          <div>
            <dt className="muted">Available</dt>
            <dd>{musician.available}</dd>
          </div>
        </dl>
        <div className={styles.cardRow}>
          <span className={`chip ${chipClass(musician.preference.tone)}`}>{musician.preference.label}</span>
          <button type="button" className={`btn btn-ghost ${styles.sampleButton}`} aria-label={`Play ${musician.name}'s sample`}>
            <span className={styles.sampleIcon}>
              <PlayIcon size={10} />
            </span>
            Sample
          </button>
        </div>
        <div className={styles.cardActions}>
          <Link className="btn btn-secondary btn-sm" href={routes.musician(musician.slug)}>
            View Profile
          </Link>
          <Link className="btn btn-primary btn-sm" href={routes.createBandStep.invite}>
            Invite to Band
          </Link>
        </div>
      </div>
    </article>
  );
}
