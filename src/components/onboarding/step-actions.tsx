"use client";

import { useEffect } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";

interface StepActionsProps {
  /** Runs the section's own validation and save. */
  onSave: (mode: SaveMode) => void;
  /** Disables saving while something else is in flight (an upload). */
  busy?: boolean;
  busyLabel?: string;
}

/**
 * A section's save. In setup, the page's action bar saves every section on it, so this only hands
 * the page the section's save. Editing one section from the profile page, it is Cancel · Save changes.
 */
export function StepActions({ onSave, busy = false, busyLabel = "Uploading…" }: StepActionsProps): React.JSX.Element | null {
  const { stepNumber, pending, error, editing, stage } = useWizard();
  const disabled = pending || busy;

  // A fresh closure each render, so the page always calls the latest one.
  useEffect(() => {
    stage?.register(stepNumber, onSave, busy ? busyLabel : null);
  });

  if (!editing) return null;

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
          {busy ? busyLabel : pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </>
  );
}
