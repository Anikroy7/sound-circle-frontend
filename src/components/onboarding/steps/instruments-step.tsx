"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import { CatalogPicker } from "@/components/onboarding/catalog-picker";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { instrumentSlug } from "@/components/patterns/tiles";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import { saveInstruments } from "@/lib/api";
import { LIMITS, SKILL_LEVELS } from "@/lib/profile-steps";
import type { SkillLevel } from "@/types/profile";

type Pick = { instrument_id: number; skill_level: SkillLevel | null };

/** Step 3: instruments, each with its own skill level. */
export function InstrumentsStep(): React.JSX.Element {
  const { profile, catalog, submit } = useWizard();
  const [picks, setPicks] = useState<Pick[]>(profile.instruments);
  const [showErrors, setShowErrors] = useState(false);

  const nameOf = (id: number): string => catalog.instruments.find((instrument) => instrument.id === id)?.name ?? "Instrument";
  const listError = picks.length ? null : "Pick at least one instrument you play.";
  const missingLevel = picks.some((pick) => !pick.skill_level);

  const toggle = (id: number): void =>
    setPicks((current) =>
      current.some((pick) => pick.instrument_id === id)
        ? current.filter((pick) => pick.instrument_id !== id)
        : [...current, { instrument_id: id, skill_level: null }],
    );
  const setLevel = (id: number, level: SkillLevel): void =>
    setPicks((current) => current.map((pick) => (pick.instrument_id === id ? { ...pick, skill_level: level } : pick)));

  const save = (mode: SaveMode): void => {
    setShowErrors(true);
    if (listError || missingLevel) return;
    void submit(mode, () =>
      saveInstruments(picks.map((pick) => ({ instrument_id: pick.instrument_id, skill_level: pick.skill_level as SkillLevel }))),
    );
  };

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save("next");
      }}
    >
      <fieldset className="fieldset" aria-describedby={`instruments-hint${showErrors && listError ? " instruments-error" : ""}`}>
        <legend className="visually-hidden">Instruments you play</legend>
        <div className={styles.section}>
          <span className={styles.sectionHead}>
            <span id="instruments-hint" className="field-hint">
              Search and pick everything you play, your voice included.
            </span>
            <span className={styles.counter}>
              {picks.length} / {LIMITS.instruments}
            </span>
          </span>
          <CatalogPicker
            items={catalog.instruments}
            selected={picks.map((pick) => pick.instrument_id)}
            onToggle={toggle}
            limit={LIMITS.instruments}
            noun="instruments"
            placeholder="Search instruments, e.g. guitar, tabla, vocals"
            showTags={false}
            describedBy="instruments-hint"
            invalid={showErrors && !!listError}
          />
          {showErrors && listError && <FieldError id="instruments-error">{listError}</FieldError>}
        </div>
      </fieldset>

      {picks.length > 0 && (
        <div className={styles.section}>
          <span className="label">Your level on each</span>
          <ul className={styles.skillList}>
            {picks.map((pick) => {
              const name = nameOf(pick.instrument_id);
              const invalid = showErrors && !pick.skill_level;
              return (
                <li key={pick.instrument_id} className={styles.skillItem} data-invalid={invalid}>
                  <span className={styles.skillName}>
                    <InstrumentIcon slug={instrumentSlug(name)} size={18} />
                    <strong>{name}</strong>
                  </span>
                  <div role="radiogroup" aria-label={`Your level on ${name}`} aria-invalid={invalid} className={styles.segmented}>
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        role="radio"
                        aria-checked={pick.skill_level === level.value}
                        className={styles.segment}
                        onClick={() => setLevel(pick.instrument_id, level.value)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className={styles.removeIcon}
                    onClick={() => toggle(pick.instrument_id)}
                    aria-label={`Remove ${name}`}
                    title="Remove"
                  >
                    ×
                  </button>
                  {invalid && (
                    <span className={styles.skillError}>
                      <FieldError id={`skill-${pick.instrument_id}-error`}>Choose your level on {name}.</FieldError>
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      <StepActions onSave={save} />
    </form>
  );
}
