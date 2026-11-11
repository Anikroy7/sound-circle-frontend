"use client";

import { useId, useRef, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/forms/combobox.module.css";
import type { CatalogItem } from "@/types/profile";

interface GenreSelectProps {
  label: React.ReactNode;
  genres: CatalogItem[];
  selected: number[];
  onChange: (ids: number[]) => void;
  limit: number;
  error?: string | null;
  placeholder?: string;
}

/**
 * Pick several genres: the chosen ones sit in the box as removable tags, and typing filters a dropdown
 * of the rest. Keyboard: ↑/↓ to move, Enter to add, Backspace on an empty box removes the last tag,
 * Esc closes the list.
 */
export function GenreSelect({ label, genres, selected, onChange, limit, error, placeholder = "Add a genre…" }: GenreSelectProps): React.JSX.Element {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const full = selected.length >= limit;
  const query = text.trim().toLowerCase();
  const options = full ? [] : genres.filter((genre) => !selected.includes(genre.id) && genre.name.toLowerCase().includes(query));
  const chosen = selected.map((genreId) => genres.find((genre) => genre.id === genreId)).filter((genre): genre is CatalogItem => !!genre);
  const current = Math.min(active, Math.max(0, options.length - 1));

  const add = (genreId: number): void => {
    if (full) return;
    onChange([...selected, genreId]);
    setText("");
    setActive(0);
  };
  const remove = (genreId: number): void => onChange(selected.filter((selectedId) => selectedId !== genreId));

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive(Math.min(current + 1, options.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      // Never submit the form from here.
      event.preventDefault();
      if (open && options[current]) add(options[current].id);
    } else if (event.key === "Escape") {
      setOpen(false);
    } else if (event.key === "Backspace" && !text && chosen.length) {
      remove(chosen[chosen.length - 1].id);
    }
  };

  return (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label className="label" htmlFor={`${id}-input`}>
          {label}
        </label>
        <span className={styles.count}>
          {selected.length} / {limit}
        </span>
      </div>
      <div className={styles.wrap}>
        <div className={styles.box} aria-invalid={!!error} onClick={() => input.current?.focus()}>
          {chosen.map((genre) => (
            <span key={genre.id} className={styles.tag}>
              {genre.name}
              <button type="button" className={styles.tagRemove} aria-label={`Remove ${genre.name}`} onClick={() => remove(genre.id)}>
                ×
              </button>
            </span>
          ))}
          <input
            ref={input}
            id={`${id}-input`}
            className={styles.input}
            role="combobox"
            aria-expanded={open && !full}
            aria-controls={`${id}-list`}
            aria-autocomplete="list"
            aria-activedescendant={open && options[current] ? `${id}-option-${options[current].id}` : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            placeholder={full ? `Up to ${limit} genres` : chosen.length ? "" : placeholder}
            disabled={full && !chosen.length}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              setActive(0);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onBlur={() => {
              // Half-typed text that matched nothing shouldn't linger in the box.
              setOpen(false);
              setText("");
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        {open && !full && (
          <ul id={`${id}-list`} className={styles.list} role="listbox" aria-label="Genres">
            {options.length ? (
              options.map((genre, index) => (
                <li
                  key={genre.id}
                  id={`${id}-option-${genre.id}`}
                  role="option"
                  aria-selected={index === current}
                  data-active={index === current}
                  className={styles.option}
                  // Keep focus in the input, so the list stays open for the next pick.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => add(genre.id)}
                >
                  {genre.name}
                </li>
              ))
            ) : (
              <li className={styles.status} role="presentation">
                No genres match “{text.trim()}”.
              </li>
            )}
          </ul>
        )}
      </div>
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}
