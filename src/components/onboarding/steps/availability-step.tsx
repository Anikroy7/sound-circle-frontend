"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { saveAvailability } from "@/lib/api";
import { formatTime, LIMITS, WEEKDAYS } from "@/lib/profile-steps";
import type { AvailabilitySlot, Weekday } from "@/types/profile";

interface Row {
  key: number;
  day: Weekday | null;
  anytime: boolean;
  start: string;
  end: string;
}

/** Row keys only need to be unique on this page. */
let nextRowKey = 0;
const newRow = (row: Partial<Row> = {}): Row => ({ key: nextRowKey++, day: null, anytime: true, start: "", end: "", ...row });

const isAnyDayAnyTime = (slot: AvailabilitySlot): boolean => slot.day_of_week === null && slot.start_time === null;

function rowError(row: Row): string | null {
  if (row.anytime) return null;
  if (!row.start || !row.end) return "Set both a start and an end time, or choose Anytime.";
  if (row.start === row.end) return "The start and end time can't be the same.";
  return null;
}

/** "Friday · Anytime", "Saturday · 4:00 PM – 8:00 PM" — a row read back to the musician. */
function describe(row: Row): string {
  const day = WEEKDAYS.find((weekday) => weekday.value === row.day)?.label ?? "Any day";
  if (row.anytime) return `${day} · Anytime`;
  if (!row.start || !row.end) return day;
  return `${day} · ${formatTime(row.start)} – ${formatTime(row.end)}${row.end < row.start ? " (next day)" : ""}`;
}

/** Step 5: days and time ranges, or one "any day, any time". */
export function AvailabilityStep(): React.JSX.Element {
  const { profile, submit } = useWizard();
  const [anyTime, setAnyTime] = useState(profile.availability.some(isAnyDayAnyTime));
  const [rows, setRows] = useState<Row[]>(() => {
    const saved = profile.availability.filter((slot) => !isAnyDayAnyTime(slot));
    return saved.length
      ? saved.map((slot) =>
          newRow({ day: slot.day_of_week, anytime: slot.start_time === null, start: slot.start_time ?? "", end: slot.end_time ?? "" }),
        )
      : [newRow({ day: 5 })];
  });
  const [showErrors, setShowErrors] = useState(false);

  const update = (key: number, patch: Partial<Row>): void =>
    setRows((current) => current.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  const remove = (key: number): void => setRows((current) => current.filter((row) => row.key !== key));

  const signature = (row: Row): string => `${row.day}|${row.anytime ? "" : `${row.start}-${row.end}`}`;
  const duplicates = new Set(rows.map(signature).filter((sig, index, all) => all.indexOf(sig) !== index));
  const listError = anyTime ? null : !rows.length ? "Add at least one time, or choose Any day, any time." : null;
  const invalid = !anyTime && (rows.some(rowError) || duplicates.size > 0);

  const save = (mode: SaveMode): void => {
    setShowErrors(true);
    if (listError || invalid) return;
    const slots: AvailabilitySlot[] = anyTime
      ? [{ day_of_week: null, start_time: null, end_time: null }]
      : rows.map((row) => ({ day_of_week: row.day, start_time: row.anytime ? null : row.start, end_time: row.anytime ? null : row.end }));
    void submit(mode, () => saveAvailability(slots));
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
      <label className={styles.choice}>
        <input type="checkbox" checked={anyTime} onChange={(event) => setAnyTime(event.target.checked)} />
        <span className={styles.choiceText}>
          <strong>Any day, any time</strong>
          <span className="muted">I&apos;m flexible. Bands can reach out whenever suits them.</span>
        </span>
      </label>

      {!anyTime && (
        <div className={styles.section}>
          <span className={styles.sectionHead}>
            <span className="label">Your times</span>
            <span className={styles.counter}>
              {rows.length} / {LIMITS.availabilitySlots}
            </span>
          </span>
          <ul className={styles.queue}>
            {rows.map((row, index) => {
              const error = showErrors ? (rowError(row) ?? (duplicates.has(signature(row)) ? "This time is listed twice." : null)) : null;
              return (
                <li key={row.key} className={`inset ${styles.slot}`}>
                  <div className={styles.skillRowHead}>
                    <strong>{describe(row)}</strong>
                    {rows.length > 1 && (
                      <button type="button" className={styles.removeButton} onClick={() => remove(row.key)} aria-label={`Remove time ${index + 1}`}>
                        Remove
                      </button>
                    )}
                  </div>
                  <div className={styles.slotGrid}>
                    <label className="field">
                      <span className="label">Day</span>
                      <select
                        className="input"
                        value={row.day ?? ""}
                        onChange={(event) => update(row.key, { day: event.target.value ? (Number(event.target.value) as Weekday) : null })}
                      >
                        <option value="">Any day</option>
                        {WEEKDAYS.map((weekday) => (
                          <option key={weekday.value} value={weekday.value}>
                            {weekday.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <div className="field" role="radiogroup" aria-label={`Time for ${describe(row)}`}>
                      <span className="label">Time</span>
                      <div className={styles.chips}>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={row.anytime}
                          className="toggle-chip"
                          onClick={() => update(row.key, { anytime: true })}
                        >
                          Anytime
                        </button>
                        <button
                          type="button"
                          role="radio"
                          aria-checked={!row.anytime}
                          className="toggle-chip"
                          onClick={() => update(row.key, { anytime: false, start: row.start || "16:00", end: row.end || "20:00" })}
                        >
                          Set hours
                        </button>
                      </div>
                    </div>
                  </div>
                  {!row.anytime && (
                    <div className={styles.timeRange}>
                      <label className="field">
                        <span className="visually-hidden">From</span>
                        <input
                          className="input"
                          type="time"
                          value={row.start}
                          onChange={(event) => update(row.key, { start: event.target.value })}
                          aria-invalid={!!error}
                        />
                      </label>
                      <span className="muted">to</span>
                      <label className="field">
                        <span className="visually-hidden">To</span>
                        <input
                          className="input"
                          type="time"
                          value={row.end}
                          onChange={(event) => update(row.key, { end: event.target.value })}
                          aria-invalid={!!error}
                        />
                      </label>
                    </div>
                  )}
                  {error && <FieldError id={`slot-${row.key}-error`}>{error}</FieldError>}
                </li>
              );
            })}
          </ul>
          {showErrors && listError && <FieldError id="slots-error">{listError}</FieldError>}
          {rows.length < LIMITS.availabilitySlots && (
            <button
              type="button"
              className={`btn btn-secondary btn-sm ${styles.addButton}`}
              onClick={() => setRows((current) => [...current, newRow()])}
            >
              + Add another time
            </button>
          )}
        </div>
      )}
      <StepActions onSave={save} />
    </form>
  );
}
