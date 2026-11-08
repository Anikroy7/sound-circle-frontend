"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { saveGenres } from "@/lib/api";
import { LIMITS } from "@/lib/profile-steps";
import type { CatalogItem } from "@/types/profile";

interface GenrePickerProps {
  id: string;
  legend: string;
  hint: string;
  genres: CatalogItem[];
  selected: number[];
  /** Given an update to apply to the latest list (a `setState` fits), so quick clicks never lose one. */
  onChange: (update: (ids: number[]) => number[]) => void;
  error?: string | null;
  /** How many may be picked; defaults to the profile lists' limit. */
  limit?: number;
}

/** Toggle chips; at the limit, the unselected ones disable rather than silently ignoring a click. */
export function GenrePicker({ id, legend, hint, genres, selected, onChange, error, limit = LIMITS.genresPerList }: GenrePickerProps): React.JSX.Element {
  const full = selected.length >= limit;
  const toggle = (genreId: number): void =>
    onChange((current) => (current.includes(genreId) ? current.filter((selectedId) => selectedId !== genreId) : [...current, genreId]));

  return (
    <fieldset className="fieldset" aria-describedby={`${id}-hint${error ? ` ${id}-error` : ""}`}>
      <legend className={`label ${styles.sectionHead}`}>{legend}</legend>
      <div className={styles.section}>
        <span className={styles.sectionHead}>
          <span id={`${id}-hint`} className="field-hint">
            {hint}
          </span>
          <span className={styles.counter}>
            {selected.length} / {limit}
          </span>
        </span>
        <div className={styles.chips}>
          {genres.map((genre) => {
            const on = selected.includes(genre.id);
            return (
              <button key={genre.id} type="button" className="toggle-chip" aria-pressed={on} disabled={!on && full} onClick={() => toggle(genre.id)}>
                {genre.name}
              </button>
            );
          })}
        </div>
        {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
      </div>
    </fieldset>
  );
}

/** Step 2: genres performed (at least one) and genres listened to (optional). */
export function GenresStep(): React.JSX.Element {
  const { profile, catalog, submit } = useWizard();
  const [performs, setPerforms] = useState(profile.performs_genre_ids);
  const [listens, setListens] = useState(profile.listens_genre_ids);
  const [showError, setShowError] = useState(false);

  const error = performs.length ? null : "Pick at least one genre you perform.";

  const save = (mode: SaveMode): void => {
    setShowError(true);
    if (!error) void submit(mode, () => saveGenres(performs, listens));
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
      <GenrePicker
        id="performs"
        legend="Genres you perform"
        hint={`Pick up to ${LIMITS.genresPerList}.`}
        genres={catalog.genres}
        selected={performs}
        onChange={setPerforms}
        error={showError ? error : null}
      />
      <GenrePicker
        id="listens"
        legend="Genres you enjoy listening to"
        hint="Optional. Helps you find musicians with the same taste."
        genres={catalog.genres}
        selected={listens}
        onChange={setListens}
      />
      <StepActions onSave={save} />
    </form>
  );
}
