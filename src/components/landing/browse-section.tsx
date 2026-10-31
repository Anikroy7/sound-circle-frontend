import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { SectionHeading } from "@/components/landing/section-heading";
import { PinIcon } from "@/components/ui/icons";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import { cities, genres, instruments } from "@/demo-data/browse";
import { routes } from "@/lib/routes";
import { tones } from "@/lib/tones";

const discoverBy = (filter: string, value: string): string => `${routes.musicians}?${new URLSearchParams({ [filter]: value })}`;

export function BrowseSection(): React.JSX.Element {
  return (
    <section className={`${styles.container} ${styles.sectionStack} ${styles.browse}`}>
      <SectionHeading
        track="Track 01"
        title="Browse by instrument"
        lead="Start with the role your band is missing."
        link={{ href: routes.musicians, label: "See all musicians" }}
      />
      <div className={styles.instrumentGrid}>
        {instruments.map((instrument) => (
          <Link key={instrument.slug} href={discoverBy("instrument", instrument.slug)} className={`card hover-lift ${styles.instrumentTile}`}>
            <span className={styles.instrumentIcon} style={{ background: tones[instrument.tone].tint, color: tones[instrument.tone].ink }}>
              <InstrumentIcon slug={instrument.slug} />
            </span>
            <span className={styles.instrumentName}>{instrument.name}</span>
          </Link>
        ))}
      </div>
      <div className={styles.filterGroups}>
        <div className={styles.filterGroup}>
          <h3 className={`label ${styles.filterTitle}`}>By genre</h3>
          <div className={styles.chipList}>
            {genres.map((genre) => (
              <Link key={genre} className="chip chip-lg" href={discoverBy("genre", genre)}>
                {genre}
              </Link>
            ))}
          </div>
        </div>
        <div className={styles.filterGroup}>
          <h3 className={`label ${styles.filterTitle}`}>By location</h3>
          <div className={styles.chipList}>
            {cities.map((city) => (
              <Link key={city} className="chip chip-lg" href={discoverBy("area", city)}>
                <PinIcon />
                {city}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
