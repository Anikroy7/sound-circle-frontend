import Link from "next/link";
import styles from "@/components/auth/auth.module.css";
import { SignInMarkIcon } from "@/components/ui/icons";
import { onboardingSteps } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";
import type { ToggleOption } from "@/types/account";
import type { SelectOption } from "@/types/common";

export function SocialSignInButton(): React.JSX.Element {
  return (
    <button type="button" className="btn btn-secondary btn-block">
      <SignInMarkIcon />
      Continue with Google
    </button>
  );
}

export function SelectField({ label, name, options }: { label: string; name: string; options: SelectOption[] }): React.JSX.Element {
  return (
    <label className="field">
      <span className="label">{label}</span>
      <select className="input" name={name} defaultValue={options[0].value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ToggleChips({ options }: { options: ToggleOption[] }): React.JSX.Element {
  return (
    <div className={styles.chipList}>
      {options.map((option) => (
        <button key={option.label} type="button" className="toggle-chip" aria-pressed={option.selected}>
          {option.label}
        </button>
      ))}
    </div>
  );
}

/** "Step N of 3", the progress bars and the step names above each profile-setup screen. */
export function OnboardingProgress({ step }: { step: 1 | 2 | 3 }): React.JSX.Element {
  return (
    <div className={styles.progress}>
      <div className={styles.progressTop}>
        <span className={`label ${styles.stepCount}`}>
          Step {step} of {onboardingSteps.length}
        </span>
        <Link href={routes.onboarding.done} className={styles.skip}>
          Skip for now
        </Link>
      </div>
      <div className={styles.bars} aria-hidden="true">
        {onboardingSteps.map((item, index) => (
          <span key={item.label} className={index < step ? styles.barOn : undefined} />
        ))}
      </div>
      <ol className={styles.stepNames}>
        {onboardingSteps.map((item, index) => {
          const number = index + 1;
          const className = number === step ? styles.stepNameCurrent : number < step ? styles.stepNameDone : undefined;
          return (
            <li key={item.label} className={className} aria-current={number === step ? "step" : undefined}>
              {item.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/** Back and Continue at the foot of a setup step. */
export function StepActions({ back, next, nextLabel = "Continue" }: { back: string; next: string; nextLabel?: string }): React.JSX.Element {
  return (
    <div className={styles.actions}>
      <Link className="btn btn-secondary" href={back}>
        Back
      </Link>
      <Link className="btn btn-primary" href={next}>
        {nextLabel}
      </Link>
    </div>
  );
}
