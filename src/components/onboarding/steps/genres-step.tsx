"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import { CatalogPicker } from "@/components/onboarding/catalog-picker";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { saveGenres } from "@/lib/api";
import { LIMITS } from "@/lib/profile-steps";

/**
 * The genres a musician plays (at least one), picked from one searchable list. Genres they listen to
 * aren't asked for any more; any saved earlier are kept as they are.
 */
export function GenresStep(): React.JSX.Element {
  const { profile, catalog, submit } = useWizard();
  const [performs, setPerforms] = useState(profile.performs_genre_ids);
  const [showError, setShowError] = useState(false);

  const error = performs.length ? null : "Pick at least one genre you play.";
  const toggle = (genreId: number): void =>
    setPerforms((current) => (current.includes(genreId) ? current.filter((selectedId) => selectedId !== genreId) : [...current, genreId]));

  const save = (mode: SaveMode): void => {
    setShowError(true);
    if (!error) void submit(mode, () => saveGenres(performs, profile.listens_genre_ids));
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
      <fieldset className="fieldset" aria-describedby={`genres-hint${showError && error ? " genres-error" : ""}`}>
        <legend className="visually-hidden">Genres you play</legend>
        <div className={styles.section}>
          <span className={styles.sectionHead}>
            <span id="genres-hint" className="field-hint">
              Search and pick the styles you play. Up to {LIMITS.genresPerList}.
            </span>
            <span className={styles.counter}>
              {performs.length} / {LIMITS.genresPerList}
            </span>
          </span>
          <CatalogPicker
            items={catalog.genres}
            selected={performs}
            onToggle={toggle}
            limit={LIMITS.genresPerList}
            noun="genres"
            placeholder="Search genres, e.g. rock, baul, jazz"
            describedBy="genres-hint"
            invalid={showError && !!error}
          />
          {showError && error && <FieldError id="genres-error">{error}</FieldError>}
        </div>
      </fieldset>
      <StepActions onSave={save} />
    </form>
  );
}
