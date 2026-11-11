"use client";

import { useEffect, useState } from "react";
import { MediaCard } from "@/components/patterns/media-card";
import patterns from "@/components/patterns/patterns.module.css";
import { BrowseTile, instrumentSlug, tileColour } from "@/components/patterns/tiles";
import { LocationFilter } from "@/components/search/location-filter";
import { ChipSelect, ChipToggle, ResultRow, Results, ScopeChips, TopResult, TopSection, useSearch } from "@/components/search/search-parts";
import styles from "@/components/search/search.module.css";
import { Avatar } from "@/components/ui/avatar";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import { getGenres, getInstruments, searchMusicians } from "@/lib/api";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import { useUrlQuery } from "@/lib/use-url-query";
import type { MusicianCard } from "@/types/discovery";
import type { CatalogItem } from "@/types/profile";

const PAGE_SIZE = 18;

/** Instruments and genres for the filters; empty until loaded (the search works without them). */
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

/** Catalog rows as dropdown options, e.g. with the prefix "Needs ". */
export const asOptions = (items: CatalogItem[], prefix = ""): { value: number; label: string }[] =>
  items.map((item) => ({ value: item.id, label: `${prefix}${item.name}` }));

const lookingForBand = (musician: MusicianCard): boolean => musician.band_interest === 2 || musician.band_interest === 3;
const placeOf = (musician: MusicianCard): string | null =>
  musician.location ? `${musician.location}${musician.more_locations > 0 ? ` +${musician.more_locations}` : ""}` : null;
const lineOf = (musician: MusicianCard): string => [musician.instruments.slice(0, 2).join(", "), placeOf(musician)].filter(Boolean).join(" · ");

/**
 * Search musicians. The top bar's search box types into `?q=`; the chips here narrow it. With nothing
 * typed or chosen, instruments to browse by sit above everyone; a typed search leads with its best match.
 */
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

  return (
    <div className={patterns.body}>
      <h1 className="visually-hidden">Search musicians</h1>
      <div className={styles.toolbar}>
        <ScopeChips active="musicians" text={query.get("q")} />
        <div className={styles.filters}>
          <ChipSelect
            label="Instrument"
            any="Any instrument"
            value={query.get("instrument")}
            onChange={(value) => query.set({ instrument: value })}
            options={asOptions(instruments)}
          />
          <ChipSelect
            label="Genre"
            any="Any genre"
            value={query.get("genre")}
            onChange={(value) => query.set({ genre: value })}
            options={asOptions(genres)}
          />
          <LocationFilter
            divisionId={query.get("division")}
            districtId={query.get("district")}
            onChange={(division, district) => query.set({ division, district })}
          />
          <ChipToggle on={!!query.get("looking")} onToggle={() => query.set({ looking: query.get("looking") ? null : "1" })}>
            Looking for a band
          </ChipToggle>
          <span className={styles.divider} aria-hidden="true" />
          <ChipSelect
            label="Sort"
            any="Most complete"
            value={query.get("sort")}
            onChange={(value) => query.set({ sort: value })}
            options={[
              { value: "newest", label: "Newest" },
              { value: "name", label: "Name" },
            ]}
          />
          {query.filtered && (
            <button type="button" className={styles.clear} onClick={query.clear}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {!query.filtered && instruments.length > 0 && (
        <section aria-label="Browse by instrument">
          <div className={patterns.sectionHead}>
            <h2 className={patterns.sectionTitle}>Browse by instrument</h2>
          </div>
          <div className={patterns.browseGrid}>
            {instruments.slice(0, 10).map((instrument, index) => (
              <BrowseTile
                key={instrument.id}
                href={`${routes.musicians}?instrument=${instrument.id}`}
                label={instrument.name}
                colour={tileColour(index)}
                icon={<InstrumentIcon slug={instrumentSlug(instrument.name)} size={28} />}
              />
            ))}
          </div>
        </section>
      )}

      <Results
        page={page}
        error={error}
        retry={retry}
        noun={["musician", "musicians"]}
        query={query}
        title={query.filtered ? "Musicians" : "Everyone"}
        empty={
          <>
            <strong>No musicians found</strong>
            <span className="muted">Check the spelling, or try fewer filters.</span>
          </>
        }
        top={(best, next) => (
          <TopSection
            rowsTitle="Musicians"
            best={
              <TopResult
                href={routes.musician(best.slug)}
                art={<Avatar initials={initialsOf(best.name)} tone={toneFor(best.user_id)} size={92} photoUrl={best.photo_url} />}
                name={best.name}
                kind="Musician"
                line={lineOf(best)}
              />
            }
            rows={next.map((musician) => (
              <ResultRow
                key={musician.user_id}
                href={routes.musician(musician.slug)}
                art={<Avatar initials={initialsOf(musician.name)} tone={toneFor(musician.user_id)} size={44} photoUrl={musician.photo_url} />}
                name={musician.name}
                line={musician.instruments.slice(0, 3).join(", ")}
                aside={placeOf(musician)}
              />
            ))}
          />
        )}
      >
        {(musician) => (
          <MediaCard
            key={musician.user_id}
            id={musician.user_id}
            round
            href={routes.musician(musician.slug)}
            title={musician.name}
            subtitle={lineOf(musician)}
            tag={lookingForBand(musician) ? "Looking for a band" : null}
            photoUrl={musician.photo_url}
          />
        )}
      </Results>
    </div>
  );
}
