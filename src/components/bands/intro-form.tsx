"use client";

import { useEffect, useState, type ReactNode } from "react";
import styles from "@/components/bands/chemistry.module.css";
import { apiErrorMessage, getGenres, saveIntroduction } from "@/lib/api";
import { INTERESTS, INTRO_LIMITS } from "@/lib/band-chemistry";
import type { Band, IntroductionRequest, MusicalInterest } from "@/types/band-api";
import type { CatalogItem } from "@/types/profile";

interface IntroFormProps {
  bandId: number;
  initial: IntroductionRequest;
  onSaved: (band: Band) => void;
  /** Extra buttons before Save (Skip, Cancel). */
  secondary?: ReactNode;
  saveLabel?: string;
}

const toggle = <T,>(list: T[], value: T, max: number): T[] =>
  list.includes(value) ? list.filter((item) => item !== value) : list.length < max ? [...list, value] : list;

/** A member's introduction to their band: a short note, favourite genres and interests. Every part optional. */
export function IntroForm({ bandId, initial, onSaved, secondary, saveLabel = "Save introduction" }: IntroFormProps): React.JSX.Element {
  const [genres, setGenres] = useState<CatalogItem[]>([]);
  const [intro, setIntro] = useState(initial.intro);
  const [genreIds, setGenreIds] = useState(initial.genre_ids);
  const [interests, setInterests] = useState<MusicalInterest[]>(initial.interests);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getGenres().then(setGenres, () => undefined);
  }, []);

  const save = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      onSaved(await saveIntroduction(bandId, { intro: intro.trim(), genre_ids: genreIds, interests }));
    } catch (failure) {
      setError(apiErrorMessage(failure));
      setPending(false);
    }
  };

  return (
    <form className={styles.introForm} onSubmit={save}>
      <label className="field">
        <span className="label">Say hello</span>
        <textarea
          className="input"
          rows={3}
          maxLength={INTRO_LIMITS.intro}
          placeholder="Who you are, what you bring, what you're excited to play…"
          value={intro}
          onChange={(event) => setIntro(event.target.value)}
        />
      </label>

      <fieldset className="fieldset">
        <legend className="label">
          Favourite genres <span className="muted">(up to {INTRO_LIMITS.genres})</span>
        </legend>
        <div className={styles.chipPicker}>
          {genres.map((genre) => (
            <button
              key={genre.id}
              type="button"
              className="toggle-chip toggle-chip-sm"
              aria-pressed={genreIds.includes(genre.id)}
              onClick={() => setGenreIds((current) => toggle(current, genre.id, INTRO_LIMITS.genres))}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="fieldset">
        <legend className="label">
          Musical interests <span className="muted">(up to {INTRO_LIMITS.interests})</span>
        </legend>
        <div className={styles.chipPicker}>
          {INTERESTS.map((interest) => (
            <button
              key={interest.value}
              type="button"
              className="toggle-chip toggle-chip-sm"
              aria-pressed={interests.includes(interest.value)}
              onClick={() => setInterests((current) => toggle(current, interest.value, INTRO_LIMITS.interests))}
            >
              {interest.label}
            </button>
          ))}
        </div>
      </fieldset>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      <div className={styles.formActions}>
        {secondary}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? "Saving…" : saveLabel}
        </button>
      </div>
    </form>
  );
}
