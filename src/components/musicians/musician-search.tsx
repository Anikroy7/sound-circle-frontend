"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LocationFilter } from "@/components/search/location-filter";
import { Results, SearchBox, useSearch } from "@/components/search/search-parts";
import styles from "@/components/search/search.module.css";
import { Avatar } from "@/components/ui/avatar";
import { getGenres, getInstruments, searchMusicians } from "@/lib/api";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import { useUrlQuery } from "@/lib/use-url-query";
import type { MusicianCard } from "@/types/discovery";
import type { CatalogItem } from "@/types/profile";

const PAGE_SIZE = 12;

/** Instruments and genres for the filter dropdowns; empty until loaded (the search works without them). */
export function useCatalog(): { instruments: CatalogItem[]; genres: CatalogItem[] } {
  const [catalog, setCatalog] = useState<{ instruments: CatalogItem[]; genres: CatalogItem[] }>({ instruments: [], genres: [] });
  useEffect(() => {
    Promise.all([getInstruments(), getGenres()]).then(
      ([instruments, genres]) => setCatalog({ instruments, genres }),
      () => undefined,
    );
  }, []);
  return catalog;
}

function MusicianResult({ musician }: { musician: MusicianCard }): React.JSX.Element {
  const looking = musician.band_interest === 2 || musician.band_interest === 3;
  return (
    <Link href={routes.musician(musician.slug)} className={`card ${styles.card}`}>
      <div className={styles.cardHead}>
        <Avatar initials={initialsOf(musician.name)} tone={toneFor(musician.user_id)} size={52} photoUrl={musician.photo_url} />
        <div className={styles.cardText}>
          <span className={styles.cardName}>{musician.name}</span>
          {musician.instruments.length > 0 && <span className={styles.cardSub}>{musician.instruments.slice(0, 3).join(" · ")}</span>}
          {musician.location && (
            <span className={styles.cardMeta}>
              {musician.location}
              {musician.more_locations > 0 && ` +${musician.more_locations}`}
            </span>
          )}
        </div>
      </div>
      {(looking || musician.genres.length > 0) && (
        <div className={styles.tags}>
          {looking && <span className="chip chip-teal">Looking for a band</span>}
          {musician.genres.slice(0, 2).map((genre) => (
            <span key={genre} className="chip">
              {genre}
            </span>
          ))}
        </div>
      )}
    </Link>
  );
}

/** Find musicians: search, filters and sort live in the URL. */
export function MusicianSearch(): React.JSX.Element {
  const query = useUrlQuery();
  const { instruments, genres } = useCatalog();
  const location = query.get("district") || query.get("division");

  const request = {
    search: query.get("q"),
    instrument_ids: query.get("instrument"),
    genre_ids: query.get("genre"),
    location_id: location,
    looking_for_band: query.get("looking") ? true : undefined,
    sort: query.get("sort"),
    page_no: query.get("page") || 1,
    page_size: PAGE_SIZE,
  };
  const { page, error, retry } = useSearch(JSON.stringify(request), () => searchMusicians(request));
  const { set } = query;
  const onSearch = useCallback((text: string) => set({ q: text }), [set]);

  return (
    <>
      <div className={styles.toolbar}>
        <SearchBox value={query.get("q")} onSearch={onSearch} placeholder="Search by name or instrument" />
        <div className={styles.filters}>
          <select className={`input ${styles.select}`} aria-label="Instrument" value={query.get("instrument")} onChange={(event) => query.set({ instrument: event.target.value })}>
            <option value="">Any instrument</option>
            {instruments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <select className={`input ${styles.select}`} aria-label="Genre" value={query.get("genre")} onChange={(event) => query.set({ genre: event.target.value })}>
            <option value="">Any genre</option>
            {genres.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
          <LocationFilter
            divisionId={query.get("division")}
            districtId={query.get("district")}
            onChange={(division, district) => query.set({ division, district })}
          />
          <button
            type="button"
            className="toggle-chip toggle-chip-sm"
            aria-pressed={!!query.get("looking")}
            onClick={() => query.set({ looking: query.get("looking") ? null : "1" })}
          >
            Looking for a band
          </button>
          {query.filtered && (
            <button type="button" className={styles.clear} onClick={query.clear}>
              Clear
            </button>
          )}
          <select className={`input ${styles.select} ${styles.sort}`} aria-label="Sort" value={query.get("sort")} onChange={(event) => query.set({ sort: event.target.value })}>
            <option value="">Most complete</option>
            <option value="newest">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <Results
        page={page}
        error={error}
        retry={retry}
        noun={["musician", "musicians"]}
        onPage={(number) => query.set({ page: String(number) })}
        empty={
          <>
            <strong>No musicians found</strong>
            <span className="muted">Try fewer filters.</span>
          </>
        }
      >
        {(musician) => <MusicianResult key={musician.user_id} musician={musician} />}
      </Results>
    </>
  );
}
