"use client";

import Link from "next/link";
import { useCallback } from "react";
import { useCatalog } from "@/components/musicians/musician-search";
import { LocationFilter } from "@/components/search/location-filter";
import { Results, SearchBox, useSearch } from "@/components/search/search-parts";
import styles from "@/components/search/search.module.css";
import { Avatar } from "@/components/ui/avatar";
import { searchBands } from "@/lib/api";
import { BAND_TYPES } from "@/lib/band-steps";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import { useUrlQuery } from "@/lib/use-url-query";
import type { BandCard } from "@/types/discovery";

const PAGE_SIZE = 12;

function BandResult({ band }: { band: BandCard }): React.JSX.Element {
  return (
    <Link href={routes.band(band.slug)} className={`card ${styles.card}`}>
      <div className={styles.cardHead}>
        <Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={52} shape="square" photoUrl={band.logo_url} />
        <div className={styles.cardText}>
          <span className={styles.cardName}>{band.name}</span>
          <span className={styles.cardMeta}>{[band.location, `${band.member_count} ${band.member_count === 1 ? "member" : "members"}`].filter(Boolean).join(" · ")}</span>
        </div>
      </div>
      {band.genres.length > 0 && (
        <div className={styles.tags}>
          {band.genres.slice(0, 3).map((genre) => (
            <span key={genre} className="chip">
              {genre}
            </span>
          ))}
        </div>
      )}
      {band.open_roles.length > 0 && (
        <span className={styles.hiring}>
          Looking for <strong>{band.open_roles.join(", ")}</strong>
        </span>
      )}
    </Link>
  );
}

/** Find bands: search, filters and sort live in the URL. */
export function BandSearch(): React.JSX.Element {
  const query = useUrlQuery();
  const { instruments, genres } = useCatalog();
  const location = query.get("district") || query.get("division");

  const request = {
    search: query.get("q"),
    genre_ids: query.get("genre"),
    location_id: location,
    hiring_instrument_ids: query.get("needs"),
    hiring: query.get("hiring") ? true : undefined,
    band_type: query.get("type"),
    sort: query.get("sort"),
    page_no: query.get("page") || 1,
    page_size: PAGE_SIZE,
  };
  const { page, error, retry } = useSearch(JSON.stringify(request), () => searchBands(request));
  const { set } = query;
  const onSearch = useCallback((text: string) => set({ q: text }), [set]);

  return (
    <>
      <div className={styles.toolbar}>
        <SearchBox value={query.get("q")} onSearch={onSearch} placeholder="Search bands by name" />
        <div className={styles.filters}>
          <select className={`input ${styles.select}`} aria-label="Looking for" value={query.get("needs")} onChange={(event) => query.set({ needs: event.target.value })}>
            <option value="">Looking for anyone</option>
            {instruments.map((item) => (
              <option key={item.id} value={item.id}>
                Needs {item.name}
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
          <select className={`input ${styles.select}`} aria-label="Band type" value={query.get("type")} onChange={(event) => query.set({ type: event.target.value })}>
            <option value="">Any band</option>
            {BAND_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="toggle-chip toggle-chip-sm"
            aria-pressed={!!query.get("hiring")}
            onClick={() => query.set({ hiring: query.get("hiring") ? null : "1" })}
          >
            Has open positions
          </button>
          {query.filtered && (
            <button type="button" className={styles.clear} onClick={query.clear}>
              Clear
            </button>
          )}
          <select className={`input ${styles.select} ${styles.sort}`} aria-label="Sort" value={query.get("sort")} onChange={(event) => query.set({ sort: event.target.value })}>
            <option value="">Newest</option>
            <option value="name">Name</option>
          </select>
        </div>
      </div>

      <Results
        page={page}
        error={error}
        retry={retry}
        noun={["band", "bands"]}
        onPage={(number) => query.set({ page: String(number) })}
        empty={
          <>
            <strong>No bands found</strong>
            <span className="muted">Try fewer filters.</span>
          </>
        }
      >
        {(band) => <BandResult key={band.id} band={band} />}
      </Results>
    </>
  );
}
