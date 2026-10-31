import type { Metadata } from "next";
import { DiscoverFilterPanel } from "@/components/discover/discover-filters";
import styles from "@/components/discover/discover.module.css";
import { MusicianResultCard } from "@/components/discover/musician-result-card";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SearchIcon } from "@/components/ui/icons";
import { discoverFilters, discoverResults } from "@/demo-data/discover";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Discover musicians" };

const PAGES = [1, 2, 3];

/** Static demo of the results state; loading, empty and error states are in the design but not built yet. */
export default function DiscoverPage(): React.JSX.Element {
  const filters = discoverFilters;

  return (
    <>
      <SiteHeader activeHref={routes.musicians} viewer={currentViewer} />
      <main className={page.page}>
        <div className={page.titleGroup}>
          <h1 className={`display ${page.title}`}>Discover musicians</h1>
          <p className="muted">Find players by instrument, genre and area, then invite them to your band.</p>
        </div>

        <form className={styles.searchRow} role="search" action={routes.musicians} method="get">
          <label className={styles.searchField}>
            <span className="visually-hidden">Search musicians</span>
            <span className={styles.searchIcon}>
              <SearchIcon />
            </span>
            <input
              className={`input ${styles.searchInput}`}
              name="q"
              defaultValue={filters.query}
              placeholder="Search by name or instrument, e.g. 'drummer' or 'Rafiq'"
            />
          </label>
          <label className={styles.sortField}>
            <span className="label">Sort by</span>
            <select className={`input ${styles.sortSelect}`} name="sort" defaultValue={filters.sortOptions[0].value}>
              {filters.sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </form>

        <div className={styles.activeFilters}>
          <span className="muted">Active filters:</span>
          {filters.active.map((filter) => (
            <span key={filter} className="chip chip-teal">
              {filter}
              <button type="button" className={styles.removeFilter} aria-label={`Remove ${filter} filter`}>
                ×
              </button>
            </span>
          ))}
          <button type="button" className={`btn btn-ghost ${styles.clearAll}`}>
            Clear all
          </button>
        </div>

        <div className={page.split}>
          <DiscoverFilterPanel filters={filters} />
          <section aria-label="Results" className={styles.results}>
            <p className={styles.resultCount}>
              <strong>{filters.resultCount} musicians</strong> <span className="muted">{filters.resultScope}</span>
            </p>
            <div className={styles.grid}>
              {discoverResults.map((musician) => (
                <MusicianResultCard key={musician.slug} musician={musician} />
              ))}
            </div>
            <nav aria-label="Pagination" className={styles.pagination}>
              <button type="button" className="btn btn-secondary btn-sm" disabled>
                Previous
              </button>
              {PAGES.map((number) => (
                <button
                  key={number}
                  type="button"
                  className={`btn btn-sm ${number === 1 ? "btn-primary" : "btn-secondary"}`}
                  aria-current={number === 1 ? "page" : undefined}
                >
                  {number}
                </button>
              ))}
              <button type="button" className="btn btn-secondary btn-sm">
                Next
              </button>
            </nav>
          </section>
        </div>
      </main>
    </>
  );
}
