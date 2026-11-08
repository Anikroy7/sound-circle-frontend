"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
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
  const full = picks.length >= LIMITS.instruments;
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
    void submit(mode, () => saveInstruments(picks.map((pick) => ({ instrument_id: pick.instrument_id, skill_level: pick.skill_level as SkillLevel }))));
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
      <fieldset className="fieldset" aria-describedby="instruments-hint">
        <legend className="label">Instruments you play</legend>
        <div className={styles.section}>
          <span className={styles.sectionHead}>
            <span id="instruments-hint" className="field-hint">
              Include your voice if you sing. Up to {LIMITS.instruments}.
            </span>
            <span className={styles.counter}>
              {picks.length} / {LIMITS.instruments}
            </span>
          </span>
          <div className={styles.chips}>
            {catalog.instruments.map((instrument) => {
              const on = picks.some((pick) => pick.instrument_id === instrument.id);
              return (
                <button
                  key={instrument.id}
                  type="button"
                  className="toggle-chip"
                  aria-pressed={on}
                  disabled={!on && full}
                  onClick={() => toggle(instrument.id)}
                >
                  {instrument.name}
                </button>
              );
            })}
          </div>
          {showErrors && listError && <FieldError id="instruments-error">{listError}</FieldError>}
        </div>
      </fieldset>

      {picks.length > 0 && (
        <div className={styles.section}>
          <span className="label">How well do you play each?</span>
          <ul className={`${styles.skillRows} ${styles.queue}`}>
            {picks.map((pick) => {
              const name = nameOf(pick.instrument_id);
              const invalid = showErrors && !pick.skill_level;
              return (
                <li key={pick.instrument_id} className={`inset ${styles.skillRow}`}>
                  <div className={styles.skillRowHead}>
                    <strong>{name}</strong>
                    <button type="button" className={styles.removeButton} onClick={() => toggle(pick.instrument_id)} aria-label={`Remove ${name}`}>
                      Remove
                    </button>
                  </div>
                  <div role="radiogroup" aria-label={`Skill level on ${name}`} className={styles.chips} aria-invalid={invalid}>
                    {SKILL_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        role="radio"
                        aria-checked={pick.skill_level === level.value}
                        className="toggle-chip toggle-chip-sm"
                        onClick={() => setLevel(pick.instrument_id, level.value)}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                  {invalid && <FieldError id={`skill-${pick.instrument_id}-error`}>Choose your level on {name}.</FieldError>}
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
