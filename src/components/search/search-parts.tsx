"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { CardSkeleton } from "@/components/patterns/media-card";
import patterns from "@/components/patterns/patterns.module.css";
import styles from "@/components/search/search.module.css";
import { apiErrorMessage } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { UrlQuery } from "@/lib/use-url-query";
import type { SearchPage } from "@/types/discovery";

/** Loads a page of results whenever `key` (the query string) changes. */
export function useSearch<T>(
  key: string,
  load: () => Promise<SearchPage<T>>,
): { page: SearchPage<T> | null; error: string | null; retry: () => void } {
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

/** Musicians | Bands: switches what is searched, keeping the typed text. */
export function ScopeChips({ active, text }: { active: "musicians" | "bands"; text: string }): React.JSX.Element {
  const withText = (path: string): string => (text ? `${path}?${new URLSearchParams({ q: text })}` : path);
  return (
    <nav className={patterns.chips} aria-label="Search in">
      <Link href={withText(routes.musicians)} className={patterns.chip} aria-current={active === "musicians" ? "page" : undefined}>
        Musicians
      </Link>
      <Link href={withText(routes.bands)} className={patterns.chip} aria-current={active === "bands" ? "page" : undefined}>
        Bands
      </Link>
    </nav>
  );
}

interface ChipSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** The "no filter" option, e.g. "Any genre". */
  any: string;
  options: { value: string | number; label: string }[];
}

/** A filter dropdown shaped like a chip; filled in once something is chosen. */
export function ChipSelect({ label, value, onChange, any, options }: ChipSelectProps): React.JSX.Element {
  return (
    <select className={patterns.chip} aria-label={label} data-set={!!value} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{any}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** A filter that is simply on or off. */
export function ChipToggle({ on, onToggle, children }: { on: boolean; onToggle: () => void; children: ReactNode }): React.JSX.Element {
  return (
    <button type="button" className={patterns.chip} aria-pressed={on} onClick={onToggle}>
      {children}
    </button>
  );
}

interface ResultsProps<T> {
  page: SearchPage<T> | null;
  error: string | null;
  retry: () => void;
  noun: [singular: string, plural: string];
  query: UrlQuery;
  /** What is searched for, in the heading over the grid, e.g. "All musicians". */
  title: string;
  empty: ReactNode;
  /** Page 1 of a typed search: the best match, big, and the next few as rows beside it. */
  top?: (best: T, next: T[]) => ReactNode;
  children: (item: T) => ReactNode;
}

/** How many results sit in rows beside the top result. */
export const NEXT_TO_TOP = 4;

/** The heading and count, the grid of cards (or a loading / empty / error state) and the pager. */
export function Results<T>({ page, error, retry, noun, query, title, empty, top, children }: ResultsProps<T>): React.JSX.Element {
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
      <div className={patterns.grid} aria-busy="true" aria-label="Loading">
        {Array.from({ length: 6 }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!page.items.length) return <div className={styles.empty}>{empty}</div>;

  const { total, page: number, total_pages: pages } = page.meta;
  const typed = !!query.get("q");
  const showTop = !!top && typed && number === 1;
  const rest = showTop ? page.items.slice(1 + NEXT_TO_TOP) : page.items;

  return (
    <>
      {showTop && top(page.items[0], page.items.slice(1, 1 + NEXT_TO_TOP))}
      {rest.length > 0 && (
        <section aria-label={title}>
          <div className={patterns.sectionHead}>
            <h2 className={patterns.sectionTitle}>{showTop ? `More ${noun[1]}` : title}</h2>
            <span className={styles.count} aria-live="polite">
              {total} {total === 1 ? noun[0] : noun[1]}
            </span>
          </div>
          <div className={patterns.grid}>{rest.map(children)}</div>
        </section>
      )}
      {pages > 1 && (
        <nav aria-label="Pages" className={styles.pager}>
          <button type="button" className={patterns.secondaryAction} disabled={number <= 1} onClick={() => query.set({ page: String(number - 1) })}>
            Previous
          </button>
          <span className="muted">
            {number} of {pages}
          </span>
          <button
            type="button"
            className={patterns.secondaryAction}
            disabled={number >= pages}
            onClick={() => query.set({ page: String(number + 1) })}
          >
            Next
          </button>
        </nav>
      )}
    </>
  );
}

interface TopResultProps {
  href: string;
  art: ReactNode;
  name: string;
  kind: string;
  line?: string | null;
}

/** The best match: big art, the name, what it is. Lifts on hover, like a card. */
export function TopResult({ href, art, name, kind, line }: TopResultProps): React.JSX.Element {
  return (
    <Link href={href} className={styles.top}>
      {art}
      <span className={styles.topName}>{name}</span>
      <span className={styles.topMeta}>
        <span className={styles.topKind}>{kind}</span>
        {line}
      </span>
    </Link>
  );
}

/** Top result on the left, the next matches as rows on the right. */
export function TopSection({ best, rows, rowsTitle }: { best: ReactNode; rows: ReactNode; rowsTitle: string }): React.JSX.Element {
  return (
    <div className={styles.topGrid}>
      <section aria-label="Top result">
        <h2 className={patterns.sectionTitle}>Top result</h2>
        {best}
      </section>
      <section aria-label={rowsTitle}>
        <h2 className={patterns.sectionTitle}>{rowsTitle}</h2>
        <div className={styles.rows}>{rows}</div>
      </section>
    </div>
  );
}

/** One compact match beside the top result. */
export function ResultRow({
  href,
  art,
  name,
  line,
  aside,
}: {
  href: string;
  art: ReactNode;
  name: string;
  line?: string | null;
  aside?: string | null;
}): React.JSX.Element {
  return (
    <Link href={href} className={styles.row}>
      {art}
      <span className={styles.rowText}>
        <span className={styles.rowName}>{name}</span>
        {line && <span className={styles.rowLine}>{line}</span>}
      </span>
      {aside && <span className={styles.rowAside}>{aside}</span>}
    </Link>
  );
}
