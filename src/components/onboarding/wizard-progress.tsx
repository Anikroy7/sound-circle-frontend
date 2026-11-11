import Link from "next/link";
import styles from "@/components/onboarding/onboarding.module.css";
import { SETUP_STAGES, stageFirstStep, stageLastStep } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";

interface WizardProgressProps {
  /** 1–4, the page on screen. */
  current: number;
  /** The last API step saved (`setup_step`). */
  setupStep: number;
  /** 0–100. */
  completion: number;
}

/**
 * The four pages as a row of named steps, with the overall completion. A page already reached is a
 * link, so the musician can go back and change an answer.
 */
export function WizardProgress({ current, setupStep, completion }: WizardProgressProps): React.JSX.Element {
  return (
    <nav className={styles.progress} aria-label="Profile setup progress">
      <ol className={styles.stages}>
        {SETUP_STAGES.map((stage, index) => {
          const number = index + 1;
          const state = number === current ? "current" : setupStep >= stageLastStep(stage) ? "done" : "todo";
          const reachable = number !== current && setupStep + 1 >= stageFirstStep(stage);
          const body = (
            <>
              <span className={styles.stageDot} aria-hidden="true">
                {state === "done" ? "✓" : number}
              </span>
              <span className={styles.stageName}>{stage.title}</span>
            </>
          );
          return (
            <li key={stage.slug} className={styles.stageItem} data-state={state}>
              {reachable ? (
                <Link href={routes.onboarding.step(stage.slug)} className={styles.stageLink}>
                  {body}
                </Link>
              ) : (
                <span className={styles.stageLink} aria-current={state === "current" ? "step" : undefined}>
                  {body}
                </span>
              )}
            </li>
          );
        })}
      </ol>
      <div className={styles.meter} aria-label={`Profile ${completion}% complete`}>
        <span className={styles.meterBar} style={{ width: `${completion}%` }} />
      </div>
    </nav>
  );
}
