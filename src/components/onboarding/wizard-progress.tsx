import Link from "next/link";
import styles from "@/components/onboarding/onboarding.module.css";
import { PROFILE_STEPS } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";

interface WizardProgressProps {
  /** 1–8, the step on screen. */
  current: number;
  /** The last completed step (`setup_step`). */
  completed: number;
  /** 0–100. */
  completion: number;
}

/**
 * "Step 3 of 8 · Instruments", eight segments and the overall completion. Any step already reached is
 * a link, so the musician can go back and change an answer without walking through the others.
 */
export function WizardProgress({ current, completed, completion }: WizardProgressProps): React.JSX.Element {
  return (
    <nav className={styles.progress} aria-label="Profile setup progress">
      <div className={styles.progressTop}>
        <span className={`label ${styles.stepCount}`}>
          Step {current} of {PROFILE_STEPS.length} · {PROFILE_STEPS[current - 1].title}
        </span>
        <span className="muted">
          <strong>{completion}%</strong> complete
        </span>
      </div>
      <ol className={styles.segments}>
        {PROFILE_STEPS.map((step, index) => {
          const number = index + 1;
          const state = number === current ? "current" : number <= completed ? "done" : "todo";
          const bar = (
            <span
              className={`${styles.segment} ${state === "done" ? styles.segmentDone : ""} ${state === "current" ? styles.segmentCurrent : ""}`}
              aria-hidden="true"
            />
          );
          const label = `Step ${number}: ${step.title}${state === "done" ? " (done)" : state === "current" ? " (current)" : ""}`;

          // Reachable = done, or the next one to do.
          return (
            <li key={step.slug} title={step.title}>
              {number !== current && number <= completed + 1 ? (
                <Link href={routes.onboarding.step(step.slug)} className={styles.segmentLink} aria-label={label}>
                  {bar}
                </Link>
              ) : (
                <span aria-label={label} aria-current={state === "current" ? "step" : undefined}>
                  {bar}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
