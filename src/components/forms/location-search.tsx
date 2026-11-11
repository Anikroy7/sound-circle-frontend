"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/forms/combobox.module.css";
import { PinIcon, SearchIcon } from "@/components/ui/icons";
import { apiErrorMessage, searchLocations } from "@/lib/api";
import type { LocationNode, LocationType } from "@/types/location";

export interface ChosenLocation {
  id: number;
  label: string;
}

const KINDS: Record<LocationType, string> = { 1: "Division", 2: "District", 3: "Upazila", 4: "City corp.", 5: "Thana", 6: "Area" };
const MIN_LETTERS = 2;

interface LocationSearchProps {
  label: React.ReactNode;
  value: ChosenLocation | null;
  onChange: (location: ChosenLocation | null) => void;
  error?: string | null;
  hint?: string;
  placeholder?: string;
}

/**
 * Pick one place by typing its name: every level (division, district, upazila, city corporation, thana,
 * area) in one search, each result labelled with the places above it so two "Mirpur"s can't be confused.
 * The chosen place shows in the box until it's cleared or changed.
 */
export function LocationSearch({
  label,
  value,
  onChange,
  error,
  hint,
  placeholder = "Search a place, e.g. Mirpur or Sylhet",
}: LocationSearchProps): React.JSX.Element {
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(!value);
  const [text, setText] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [found, setFound] = useState<{ query: string; items: LocationNode[]; error: string | null }>({ query: "", items: [], error: null });

  const query = text.trim();
  const searching = query.length >= MIN_LETTERS && found.query !== query;
  const items = found.query === query ? found.items : [];
  const current = Math.min(active, Math.max(0, items.length - 1));

  // Look places up a moment after typing stops.
  useEffect(() => {
    if (query.length < MIN_LETTERS) return;
    let live = true;
    const timer = setTimeout(() => {
      searchLocations(query).then(
        (rows) => live && setFound({ query, items: rows, error: null }),
        (failure: unknown) => live && setFound({ query, items: [], error: apiErrorMessage(failure) }),
      );
    }, 220);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [query]);

  const choose = (place: LocationNode): void => {
    onChange({ id: place.id, label: place.label ?? place.name });
    setEditing(false);
    setOpen(false);
    setText("");
  };

  const startEditing = (): void => {
    setEditing(true);
    setOpen(true);
    // After the input renders.
    setTimeout(() => input.current?.focus(), 0);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive(Math.min(current + 1, items.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(Math.max(current - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (items[current]) choose(items[current]);
    } else if (event.key === "Escape") {
      setOpen(false);
      if (value) setEditing(false);
    }
  };

  const [place, ...above] = (value?.label ?? "").split(", ");

  return (
    <div className={styles.field}>
      <label className="label" htmlFor={`${id}-input`}>
        {label}
      </label>
      <div className={styles.wrap}>
        <div className={styles.box} aria-invalid={!!error}>
          {!editing && value ? (
            <>
              <button type="button" className={styles.chosen} onClick={startEditing} aria-label={`${value.label}. Change practice location`}>
                <span className={styles.icon}>
                  <PinIcon size={16} />
                </span>
                <span className={styles.chosenText}>
                  <strong>{place}</strong>
                  {above.length > 0 && <span className="muted">, {above.join(", ")}</span>}
                </span>
              </button>
              <button
                type="button"
                className={styles.clear}
                aria-label="Clear location"
                onClick={() => {
                  onChange(null);
                  startEditing();
                }}
              >
                ×
              </button>
            </>
          ) : (
            <>
              <span className={styles.icon}>
                <SearchIcon size={16} />
              </span>
              <input
                ref={input}
                id={`${id}-input`}
                className={styles.input}
                role="combobox"
                aria-expanded={open && query.length >= MIN_LETTERS}
                aria-controls={`${id}-list`}
                aria-autocomplete="list"
                aria-activedescendant={open && items[current] ? `${id}-option-${items[current].id}` : undefined}
                aria-describedby={[hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined}
                placeholder={placeholder}
                autoComplete="off"
                value={text}
                onChange={(event) => {
                  setText(event.target.value);
                  setActive(0);
                  setOpen(true);
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  setOpen(false);
                  // Leaving without picking keeps the place already chosen.
                  if (value && !text.trim()) setEditing(false);
                }}
                onKeyDown={onKeyDown}
              />
            </>
          )}
        </div>
        {editing && open && query.length >= MIN_LETTERS && (
          <ul id={`${id}-list`} className={styles.list} role="listbox" aria-label="Places">
            {searching ? (
              <li className={styles.status} role="presentation">
                Searching…
              </li>
            ) : found.error ? (
              <li className={styles.status} role="presentation">
                {found.error}
              </li>
            ) : items.length ? (
              items.map((row, index) => {
                const [name, ...rest] = (row.label ?? row.name).split(", ");
                return (
                  <li
                    key={row.id}
                    id={`${id}-option-${row.id}`}
                    role="option"
                    aria-selected={index === current}
                    data-active={index === current}
                    className={styles.option}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActive(index)}
                    onClick={() => choose(row)}
                  >
                    <span className={styles.optionText}>
                      <strong>{name}</strong>
                      {rest.length > 0 && <span className={styles.optionSub}>{rest.join(", ")}</span>}
                    </span>
                    <span className={styles.kind}>{KINDS[row.type]}</span>
                  </li>
                );
              })
            ) : (
              <li className={styles.status} role="presentation">
                No places match “{query}”.
              </li>
            )}
          </ul>
        )}
      </div>
      {hint && (
        <span id={`${id}-hint`} className={styles.hint}>
          {hint}
        </span>
      )}
      {error && <FieldError id={`${id}-error`}>{error}</FieldError>}
    </div>
  );
}
