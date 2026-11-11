"use client";

import { useEffect, useId, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { CheckIcon, SearchIcon } from "@/components/ui/icons";
import type { CatalogItem } from "@/types/profile";

interface CatalogPickerProps {
  items: CatalogItem[];
  selected: number[];
  onToggle: (id: number) => void;
  /** How many may be picked; at the limit, unpicked ones can't be added. */
  limit: number;
  /** "instruments", "genres": used in the placeholder and the empty message. */
  noun: string;
  placeholder?: string;
  /** Show the picks as removable tags inside the field (off when the page lists them elsewhere). */
  showTags?: boolean;
  /** Describes the field for screen readers, e.g. the hint's id. */
  describedBy?: string;
  invalid?: boolean;
}

/**
 * A searchable multi-select. Focusing the field opens the whole list; typing narrows it. Each option
 * toggles with a click or Enter and the list stays open, so several can be picked in a row. Picks show
 * as tags in the field (Backspace on an empty search removes the last one).
 */
export function CatalogPicker({
  items,
  selected,
  onToggle,
  limit,
  noun,
  placeholder,
  showTags = true,
  describedBy,
  invalid = false,
}: CatalogPickerProps): React.JSX.Element {
  const id = useId();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const full = selected.length >= limit;
  const text = query.trim().toLowerCase();
  const matches = text ? items.filter((item) => item.name.toLowerCase().includes(text)) : items;
  const nameOf = (itemId: number): string => items.find((item) => item.id === itemId)?.name ?? "";
  const optionId = (item: CatalogItem): string => `${id}-option-${item.id}`;

  // Keep the highlighted option in view while moving through the list with the arrow keys.
  const activeId = open && matches[active] ? optionId(matches[active]) : undefined;
  useEffect(() => {
    if (activeId) document.getElementById(activeId)?.scrollIntoView({ block: "nearest" });
  }, [activeId]);

  // Closing the list clears the search, so the field is ready for the next one.
  const close = (): void => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const toggle = (item: CatalogItem): void => {
    if (!selected.includes(item.id) && full) return;
    onToggle(item.id);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      if (matches.length) setActive((current) => (current + (event.key === "ArrowDown" ? 1 : matches.length - 1)) % matches.length);
    } else if (event.key === "Enter") {
      // Enter toggles the highlighted option instead of submitting the page.
      event.preventDefault();
      if (open && matches[active]) toggle(matches[active]);
      else setOpen(true);
    } else if (event.key === "Escape") {
      close();
    } else if (event.key === "Backspace" && !query && showTags && selected.length) {
      onToggle(selected[selected.length - 1]);
    }
  };

  return (
    <div className={styles.picker}>
      <div className={styles.pickerField} data-open={open} data-invalid={invalid}>
        <span className={styles.pickerIcon} aria-hidden="true">
          <SearchIcon size={18} />
        </span>
        {showTags &&
          selected.map((itemId) => (
            <span key={itemId} className={styles.pickerTag}>
              {nameOf(itemId)}
              <button
                type="button"
                aria-label={`Remove ${nameOf(itemId)}`}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onToggle(itemId)}
              >
                ×
              </button>
            </span>
          ))}
        <input
          className={styles.pickerInput}
          type="text"
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-list`}
          aria-activedescendant={activeId}
          aria-autocomplete="list"
          aria-describedby={describedBy}
          aria-invalid={invalid}
          placeholder={showTags && selected.length ? "Add more…" : (placeholder ?? `Search ${noun}`)}
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
            setActive(0);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onBlur={close}
          onKeyDown={onKeyDown}
        />
      </div>

      {open && (
        <ul id={`${id}-list`} role="listbox" aria-multiselectable="true" aria-label={noun} className={styles.pickerList}>
          {matches.length ? (
            matches.map((item, index) => {
              const on = selected.includes(item.id);
              return (
                <li
                  key={item.id}
                  id={optionId(item)}
                  role="option"
                  aria-selected={on}
                  aria-disabled={!on && full}
                  className={styles.pickerOption}
                  data-active={index === active}
                  // Keep focus in the field, so the list stays open for the next pick.
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => toggle(item)}
                >
                  <span className={styles.pickerCheck} aria-hidden="true">
                    {on && <CheckIcon size={12} />}
                  </span>
                  {item.name}
                </li>
              );
            })
          ) : (
            <li className={styles.pickerEmpty}>
              No {noun} match &ldquo;{query.trim()}&rdquo;.
            </li>
          )}
          {full && <li className={styles.pickerEmpty}>You&apos;ve picked {limit}, the most allowed.</li>}
        </ul>
      )}
    </div>
  );
}
