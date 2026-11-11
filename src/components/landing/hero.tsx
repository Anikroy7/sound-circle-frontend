import Link from "next/link";
import { HeroVisual } from "@/components/landing/hero-visual";
import styles from "@/components/landing/landing.module.css";
import { Equalizer } from "@/components/ui/equalizer";
import { PlayIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";

/** Concentric rings behind the record, inside the banner. */
function Rings(): React.JSX.Element {
  return (
    <svg className={styles.heroRings} aria-hidden="true" width="1100" height="1100" viewBox="0 0 1100 1100">
      <circle cx="550" cy="550" r="180" fill="none" stroke="var(--hero-ring-teal)" strokeWidth="1.5" />
      <circle cx="550" cy="550" r="270" fill="none" stroke="var(--hero-ring-teal)" strokeWidth="1.5" />
      <circle cx="550" cy="550" r="360" fill="none" stroke="var(--hero-ring-violet)" strokeWidth="1.5" strokeDasharray="2 10" />
      <circle cx="550" cy="550" r="450" fill="none" stroke="var(--hero-ring)" strokeWidth="1.5" />
    </svg>
  );
}

/** Home's featured banner: the pitch and the two ways in on the left, the playable record collage on the right. */
export function Hero(): React.JSX.Element {
  return (
    <section className={styles.hero} aria-label="Featured">
      <Rings />
      <div className={styles.heroGrid}>
        <div className={styles.heroCopy}>
          <span className={styles.heroKicker}>
            <Equalizer bars={[12, 8, 11]} barWidth={3} gap={2} />
            Featured · Built for musicians across Bangladesh
          </span>
          <h2 className={`display ${styles.heroTitle}`}>
            Find your sound.
            <br />
            <span className={styles.heroAccent}>Build your band.</span>
          </h2>
          <p className={styles.heroLead}>
            Meet guitarists, drummers, vocalists and session players near you, then turn a rehearsal-room idea into a band that plays live.
          </p>
          <div className={styles.buttonRow}>
            <Link className={styles.heroPrimary} href={routes.musicians}>
              <PlayIcon />
              Explore musicians
            </Link>
            <Link className={styles.heroSecondary} href={routes.createBand}>
              Create a band
            </Link>
          </div>
        </div>
        <HeroVisual />
      </div>
    </section>
  );
}
