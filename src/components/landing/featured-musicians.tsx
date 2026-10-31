import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { SectionHeading } from "@/components/landing/section-heading";
import { PlayIcon } from "@/components/ui/icons";
import { Waveform } from "@/components/ui/waveform";
import { featuredMusicians } from "@/demo-data/musicians";
import { routes } from "@/lib/routes";
import { tones } from "@/lib/tones";
import { waveformBars } from "@/lib/waveform";
import type { FeaturedMusician } from "@/types/landing";

function MusicianCard({ musician }: { musician: FeaturedMusician }): React.JSX.Element {
  const tone = tones[musician.tone];

  return (
    <article className={`card ${styles.musicianCard}`}>
      <div className={`photo-placeholder ${styles.musicianPhoto}`} style={{ backgroundColor: tone.tint }}>
        <span className={`display ${styles.musicianInitials}`} style={{ color: tone.ink }} aria-hidden="true">
          {musician.initials}
        </span>
        <span className={`chip chip-teal ${styles.availability}`}>{musician.availability}</span>
        <div className={styles.samplePlayer}>
          <button type="button" className={`btn btn-primary btn-round ${styles.samplePlay}`} aria-label={`Play ${musician.name}'s sample`}>
            <PlayIcon size={12} />
          </button>
          <Waveform bars={waveformBars(28, musician.waveSeed, 20, 100)} color={tone.ink} barStyle={{ opacity: 0.7 }} className={styles.sampleWave} />
          <span className={styles.sampleLength}>{musician.sampleLength}</span>
        </div>
      </div>
      <div className={styles.musicianBody}>
        <div>
          <strong className={`display ${styles.cardName}`}>{musician.name}</strong>
          <div className={styles.musicianInstrument}>{musician.instrument}</div>
        </div>
        <div className={styles.chipRow}>
          {musician.genres.map((genre) => (
            <span key={genre} className="chip">
              {genre}
            </span>
          ))}
        </div>
        <div className={`muted ${styles.metaRow}`}>
          <span>{musician.location}</span>
          <span>{musician.experience}</span>
        </div>
        <div className={styles.cardActions}>
          <Link className="btn btn-secondary btn-sm" href={routes.musician(musician.slug)}>
            View Profile
          </Link>
          <Link className="btn btn-primary btn-sm" href={routes.createBand}>
            Invite to Band
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FeaturedMusicians(): React.JSX.Element {
  return (
    <section className={`${styles.container} ${styles.sectionStack} ${styles.featured}`}>
      <SectionHeading
        track="Track 02"
        title="Featured musicians"
        lead="Press play: every featured player has a sample on their profile."
        link={{ href: routes.musicians, label: "Explore musicians" }}
      />
      <div className={styles.cardGrid}>
        {featuredMusicians.map((musician) => (
          <MusicianCard key={musician.slug} musician={musician} />
        ))}
      </div>
    </section>
  );
}
