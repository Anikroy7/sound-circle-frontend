import styles from "@/components/landing/landing.module.css";
import { howItWorksSteps } from "@/demo-data/how-it-works";
import { sineWavePath } from "@/lib/waveform";

const WAVE_PATH = sineWavePath();

export function HowItWorks(): React.JSX.Element {
  return (
    <section className={`${styles.container} ${styles.sectionStack} ${styles.howItWorks}`}>
      <div className={styles.centeredHead}>
        <span className="track-label">Track 03 · The setlist</span>
        <h2 className={`display ${styles.centeredTitle}`}>How it works</h2>
        <p className={`muted ${styles.centeredLead}`}>From your first profile to your first gig, in three songs.</p>
      </div>
      <div className={styles.stepsWrap}>
        <svg className={styles.stepsWave} aria-hidden="true" width="100%" height="60" viewBox="0 0 1200 60" preserveAspectRatio="none">
          <path d={WAVE_PATH} fill="none" stroke="var(--teal)" strokeWidth="2" />
        </svg>
        <ol className={styles.steps}>
          {howItWorksSteps.map((step) => (
            <li key={step.number} className={`card ${styles.step}`}>
              <div className={styles.stepTop}>
                <span className={`display ${styles.stepNumber}`}>{step.number}</span>
                <span className={`muted ${styles.timecode}`}>{step.timecode}</span>
              </div>
              <h3 className={`display ${styles.stepTitle}`}>{step.title}</h3>
              <p className={`muted ${styles.stepBody}`}>{step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
