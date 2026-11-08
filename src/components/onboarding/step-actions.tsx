"use client";

import Link from "next/link";
import styles from "@/components/onboarding/onboarding.module.css";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { PROFILE_STEPS } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";

interface StepActionsProps {
  /** Runs the step's own validation and save. */
  onSave: (mode: SaveMode) => void;
  /** Disables saving while something else is in flight (an upload). */
  busy?: boolean;
  busyLabel?: string;
}

/**
 * Back · Save & finish later · Continue, with the step's error above them. Continue is the form's
 * submit button, so Enter in a text field saves and moves on.
 */
export function StepActions({ onSave, busy = false, busyLabel }: StepActionsProps): React.JSX.Element {
  const { stepNumber, pending, error, editing } = useWizard();
  const last = stepNumber === PROFILE_STEPS.length;
  const disabled = pending || busy;

  if (editing) {
    return (
      <>
        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}
        <div className={`${styles.actions} ${styles.editActions}`}>
          <button type="button" className="btn btn-ghost" onClick={editing.onCancel} disabled={disabled}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={disabled}>
            {busy && busyLabel ? busyLabel : pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}
      <div className={styles.actions}>
        {stepNumber > 1 && (
          <Link className="btn btn-secondary" href={routes.onboarding.step(PROFILE_STEPS[stepNumber - 2].slug)}>
            Back
          </Link>
        )}
        <div className={styles.actionsEnd}>
          <button type="button" className="btn btn-ghost" onClick={() => onSave("later")} disabled={disabled}>
            Save &amp; finish later
          </button>
          <button type="submit" className="btn btn-primary" disabled={disabled}>
            {busy && busyLabel ? busyLabel : pending ? "Saving…" : last ? "Finish profile" : "Continue"}
          </button>
        </div>
      </div>
    </>
  );
}
