"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/components/search/search.module.css";
import { SearchIcon } from "@/components/ui/icons";
import { apiErrorMessage } from "@/lib/api";
import type { SearchPage } from "@/types/discovery";

/** Typing updates the URL after a short pause, not on every key. */
export function SearchBox({ value, onSearch, placeholder }: { value: string; onSearch: (text: string) => void; placeholder: string }): React.JSX.Element {
  const [text, setText] = useState(value);
  const [seen, setSeen] = useState(value);

  // The URL changed from outside (Clear, the back button): follow it, unless it is just what was typed.
  if (value !== seen) {
    setSeen(value);
    if (value !== text.trim()) setText(value);
  }

  useEffect(() => {
    if (text.trim() === value) return;
    const timer = setTimeout(() => onSearch(text.trim()), 300);
    return () => clearTimeout(timer);
  }, [text, value, onSearch]);

  return (
    <label className={styles.searchField}>
      <span className="visually-hidden">Search</span>
      <span className={styles.searchIcon}>
        <SearchIcon />
      </span>
      <input className={`input ${styles.searchInput}`} type="search" value={text} onChange={(event) => setText(event.target.value)} placeholder={placeholder} />
    </label>
  );
}

/** Loads a page of results whenever `key` (the query string) changes. */
export function useSearch<T>(key: string, load: () => Promise<SearchPage<T>>): { page: SearchPage<T> | null; error: string | null; retry: () => void } {
  const [state, setState] = useState<{ key: string; page: SearchPage<T> | null; error: string | null }>({ key: "", page: null, error: null });
  const [attempt, setAttempt] = useState(0);
  const loader = useRef(load);

  // Declared before the fetch effect, so it always runs first and the fetch uses this render's query.
  useEffect(() => {
    loader.current = load;
  });

  useEffect(() => {
    let live = true;
    loader.current().then(
      (page) => live && setState({ key, page, error: null }),
      (failure: unknown) => live && setState({ key, page: null, error: apiErrorMessage(failure) }),
    );
    return () => {
      live = false;
    };
  }, [key, attempt]);

  const current = state.key === key;
  return { page: current ? state.page : null, error: current ? state.error : null, retry: () => setAttempt((count) => count + 1) };
}

interface ResultsProps<T> {
  page: SearchPage<T> | null;
  error: string | null;
  retry: () => void;
  noun: [singular: string, plural: string];
  empty: ReactNode;
  onPage: (page: number) => void;
  children: (item: T) => ReactNode;
}

/** The count, the grid (or a loading / empty / error state) and the pager. */
export function Results<T>({ page, error, retry, noun, empty, onPage, children }: ResultsProps<T>): React.JSX.Element {
  if (error) {
    return (
      <div role="alert" className="alert alert-error">
        {error}{" "}
        <button type="button" className="link-button" onClick={retry}>
          Try again
        </button>
      </div>
    );
  }

  if (!page) {
    return (
      <div className={styles.grid} aria-busy="true" aria-label="Loading">
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <div key={index} className={`card ${styles.skeleton}`} />
        ))}
      </div>
    );
  }

  if (!page.items.length) return <div className={`card ${styles.empty}`}>{empty}</div>;

  const { total, page: number, total_pages: pages } = page.meta;
  return (
    <>
      <p className={styles.count} aria-live="polite">
        {total} {total === 1 ? noun[0] : noun[1]}
      </p>
      <div className={styles.grid}>{page.items.map(children)}</div>
      {pages > 1 && (
        <nav aria-label="Pages" className={styles.pager}>
          <button type="button" className="btn btn-secondary btn-sm" disabled={number <= 1} onClick={() => onPage(number - 1)}>
            Previous
          </button>
          <span className="muted">
            {number} of {pages}
          </span>
          <button type="button" className="btn btn-secondary btn-sm" disabled={number >= pages} onClick={() => onPage(number + 1)}>
            Next
          </button>
        </nav>
      )}
    </>
  );
}
