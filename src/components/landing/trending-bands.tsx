import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { SectionHeading } from "@/components/landing/section-heading";
import { Equalizer } from "@/components/ui/equalizer";
import { trendingBands } from "@/demo-data/bands";
import { routes } from "@/lib/routes";
import { chipClass, tones } from "@/lib/tones";
import type { TrendingBand } from "@/types/landing";

function BandCard({ band }: { band: TrendingBand }): React.JSX.Element {
  const tone = tones[band.tone];

  return (
    <article className={`card ${styles.bandCard}`}>
      <div className={`photo-placeholder ${styles.bandPhoto}`} style={{ backgroundColor: tone.tint }}>
        <span className={`chip ${styles.bandPhotoCaption}`}>Photo · {band.photoCaption}</span>
        <button type="button" className={`btn ${styles.listenButton}`} aria-label={`Listen to ${band.name}`}>
          <Equalizer bars={[14, 9, 12, 7]} barWidth={3} gap={2} />
          Listen
        </button>
      </div>
      <div className={styles.bandBody}>
        <div className={styles.bandIdentity}>
          <span className={`avatar ${styles.bandRecord}`} aria-hidden="true">
            <span className={`avatar ${styles.bandMonogram}`} style={{ background: tone.ink }}>
              {band.monogram}
            </span>
          </span>
          <div className={styles.bandNameGroup}>
            <strong className={`display ${styles.cardName}`}>{band.name}</strong>
            <div className={`muted ${styles.bandMeta}`}>
              {band.genre} · {band.city}
            </div>
          </div>
        </div>
        <p className={`muted ${styles.bandDescription}`}>{band.description}</p>
        <div className={styles.bandFooter}>
          <span className={`chip ${chipClass(band.statusTone)}`}>{band.status}</span>
          <Link className="btn btn-secondary btn-sm" href={routes.band(band.slug)}>
            View band
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TrendingBands(): React.JSX.Element {
  return (
    <section className={styles.bandsBand}>
      <div className={`${styles.container} ${styles.sectionStack} ${styles.bandsInner}`}>
        <SectionHeading
          track="Track 04"
          title="Trending bands"
          lead="Bands that are active, gigging or recruiting right now."
          link={{ href: routes.bands, label: "Browse bands" }}
        />
        <div className={styles.bandGrid}>
          {trendingBands.map((band) => (
            <BandCard key={band.slug} band={band} />
          ))}
        </div>
      </div>
    </section>
  );
}
