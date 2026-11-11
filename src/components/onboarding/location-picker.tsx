"use client";

import { CascadeSelects, pathLabel, useLocationCascade } from "@/components/onboarding/location-cascade";
import styles from "@/components/onboarding/onboarding.module.css";
import type { ProfileLocation } from "@/types/profile";

/** One chosen place: what its chip says, and the places above it (so a wider pick can replace it). */
export interface LocationPick {
  id: number;
  label: string;
  ancestors: number[];
}

/** The saved locations from `GET /profiles/me`, as the picker's starting chips. */
export const toLocationPicks = (locations: ProfileLocation[]): LocationPick[] =>
  locations.map((location) => ({ id: location.id, label: location.label, ancestors: location.ancestor_ids }));

interface LocationPickerProps {
  value: LocationPick[];
  onChange: (picks: LocationPick[]) => void;
  limit: number;
  /** Shown under the picker, e.g. "Add at least one location." */
  error?: string | null;
}

/**
 * Where the musician is based or can play. The chosen places sit on top as chips; below, dropdowns
 * narrow down to one place (stopping at any level covers everything inside it), and one row says what
 * is about to be added, with the Add button. Repeat for as many places as needed.
 */
export function LocationPicker({ value, onChange, limit, error }: LocationPickerProps): React.JSX.Element {
  const cascade = useLocationCascade();
  const { path, target } = cascade;
  const ancestors = path.slice(0, -1).map((node) => node.id);
  const coveredBy = target && value.find((pick) => pick.id === target.id || ancestors.includes(pick.id));
  const full = value.length >= limit;

  const add = (): void => {
    if (!target || coveredBy || full) return;
    // A wider pick replaces the narrower ones inside it, as the API does on save.
    onChange([...value.filter((pick) => !pick.ancestors.includes(target.id)), { id: target.id, label: pathLabel(path), ancestors }]);
    cascade.setPath([]);
  };

  return (
    <fieldset className="fieldset" aria-describedby={error ? "location-error" : "location-hint"}>
      <legend className="label">Where can you play?</legend>
      <div className={styles.locationBody}>
        <span id="location-hint" className="field-hint">
          Add where you&apos;re based, and any other areas you can play.
        </span>

        {value.length > 0 && (
          <div className={styles.chipList} aria-live="polite">
            {value.map((pick) => (
              <span key={pick.id} className={`chip chip-teal ${styles.pickChip}`}>
                {pick.label}
                <button type="button" aria-label={`Remove ${pick.label}`} onClick={() => onChange(value.filter((other) => other.id !== pick.id))}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {full ? (
          <span className="field-hint">You&apos;ve added {limit} places, the most allowed.</span>
        ) : (
          <>
            <CascadeSelects cascade={cascade} />
            {target && (
              <div className={styles.addRow}>
                <span className={styles.summaryText}>
                  <strong>{pathLabel(path)}</strong>
                  <span className="field-hint">{coveredBy ? `Already covered by ${coveredBy.label}.` : cascade.describeContents(target)}</span>
                </span>
                <button type="button" className="btn btn-primary btn-sm" disabled={!!coveredBy} onClick={add}>
                  Add
                </button>
              </div>
            )}
          </>
        )}

        {error && (
          <span id="location-error" className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </fieldset>
  );
}
