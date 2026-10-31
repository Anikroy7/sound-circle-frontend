import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { Waveform } from "@/components/ui/waveform";
import { routes } from "@/lib/routes";
import { waveformBars } from "@/lib/waveform";

const CTA_BARS = waveformBars(90, 2.2, 15, 100);

export function CtaBanner(): React.JSX.Element {
  return (
    <section className={`${styles.container} ${styles.ctaSection}`}>
      <div className={`card ${styles.cta}`}>
        <Waveform
          bars={CTA_BARS}
          color={(index) => (index % 3 ? "var(--violet)" : "var(--teal)")}
          barStyle={{ borderRadius: "3px 3px 0 0" }}
          className={styles.ctaWave}
        />
        <div className={styles.ctaContent}>
          <div className={styles.ctaCopy}>
            <span className={`track-label ${styles.ctaLabel}`}>Encore</span>
            <h2 className={`display ${styles.ctaTitle}`}>Your next bandmate might be one neighbourhood away.</h2>
            <p className={`muted ${styles.ctaLead}`}>Create a free profile, add a sample, and let bands find you.</p>
          </div>
          <div className={styles.buttonRow}>
            <Link className="btn btn-primary btn-lg" href={routes.signup}>
              Create your profile
            </Link>
            <Link className="btn btn-secondary btn-lg" href={routes.musicians}>
              Explore Musicians
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
