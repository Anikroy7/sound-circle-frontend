"use client";

import { CascadeSelects, describeNode, pathLabel, useLocationCascade } from "@/components/onboarding/location-cascade";
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
  /** Shown under the chips, e.g. "Add at least one location." */
  error?: string | null;
}

/**
 * Where the musician is based or can play — the signup page's picker. Cascading dropdowns narrow down
 * to one place ("All of …" stops at the level above), the summary says what that covers and what is
 * nearby, and "Add location" collects it as a chip; repeat for as many places as needed.
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
    cascade.setPath(path.slice(0, 1));
  };

  return (
    <fieldset className="fieldset" aria-describedby={error ? "location-error" : undefined}>
      <legend className="label">Where can you play?</legend>
      <div className={styles.locationBody}>
        <span className="field-hint">
          Choose a division, then narrow it down or leave the rest on &ldquo;All&rdquo;. Add where you&apos;re based and any other areas you can play.
        </span>

        <CascadeSelects cascade={cascade} disabled={full} />

        <div className={`card ${styles.locationSummary}`}>
          <div className={styles.summaryText}>
            <span className="field-hint">Selected area</span>
            <strong>{target ? [...path].reverse().map(describeNode).join(", ") : "—"}</strong>
            {target && <span className="field-hint">{coveredBy ? `Already covered by ${coveredBy.label}.` : cascade.describeContents(target)}</span>}
            {target && <span className="field-hint">{cascade.describeNearby(target)}</span>}
            {full && <span className="field-hint">You&apos;ve added {limit} locations, the most allowed.</span>}
          </div>
          <button type="button" className="btn btn-primary btn-sm" disabled={!target || !!coveredBy || full} onClick={add}>
            Add location
          </button>
        </div>

        <div className={styles.chipList} aria-live="polite">
          {value.length === 0 && <span className="field-hint">No locations added yet.</span>}
          {value.map((pick) => (
            <span key={pick.id} className={`chip chip-teal ${styles.pickChip}`}>
              {pick.label}
              <button type="button" aria-label={`Remove ${pick.label}`} onClick={() => onChange(value.filter((other) => other.id !== pick.id))}>
                ×
              </button>
            </span>
          ))}
        </div>

        {error && (
          <span id="location-error" className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </fieldset>
  );
}
