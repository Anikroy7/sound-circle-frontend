"use client";

import { CascadeSelects, describeNode, pathLabel, useLocationCascade } from "@/components/onboarding/location-cascade";
import onboarding from "@/components/onboarding/onboarding.module.css";

export interface PracticeLocation {
  id: number;
  label: string;
}

interface PracticeLocationSelectProps {
  value: PracticeLocation | null;
  onChange: (location: PracticeLocation) => void;
  error?: string | null;
}

/**
 * Where the band practises: the same four cascading dropdowns as a musician's locations, but one place.
 * The deepest choice is the location ("All of …" stops at the level above); the saved one shows until
 * a new one is chosen.
 */
export function PracticeLocationSelect({ value, onChange, error }: PracticeLocationSelectProps): React.JSX.Element {
  const cascade = useLocationCascade((path) => {
    const target = path[path.length - 1];
    if (target) onChange({ id: target.id, label: pathLabel(path) });
  });
  const { path, target } = cascade;

  return (
    <fieldset className="fieldset" aria-describedby={error ? "practice-location-error" : undefined}>
      <legend className="label">Practice location</legend>
      <div className={onboarding.locationBody}>
        <span className="field-hint">Where the band rehearses. Choose a division, then narrow it down as far as you like.</span>
        <CascadeSelects cascade={cascade} />
        <div className={`card ${onboarding.locationSummary}`}>
          <div className={onboarding.summaryText}>
            <span className="field-hint">Practice location</span>
            <strong>{target ? [...path].reverse().map(describeNode).join(", ") : (value?.label ?? "Not chosen yet")}</strong>
            {target && <span className="field-hint">{cascade.describeNearby(target)}</span>}
          </div>
        </div>
        {error && (
          <span id="practice-location-error" className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </fieldset>
  );
}
