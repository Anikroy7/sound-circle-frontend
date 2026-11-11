"use client";

import { asOptions, useCatalog } from "@/components/musicians/musician-search";
import { MediaCard } from "@/components/patterns/media-card";
import patterns from "@/components/patterns/patterns.module.css";
import { BrowseTile, tileColour, tileIcon } from "@/components/patterns/tiles";
import { LocationFilter } from "@/components/search/location-filter";
import { ChipSelect, ChipToggle, ResultRow, Results, ScopeChips, TopResult, TopSection, useSearch } from "@/components/search/search-parts";
import styles from "@/components/search/search.module.css";
import { Avatar } from "@/components/ui/avatar";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import { searchBands } from "@/lib/api";
import { BAND_TYPES } from "@/lib/band-steps";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import { useUrlQuery } from "@/lib/use-url-query";
import type { BandCard } from "@/types/discovery";

const PAGE_SIZE = 18;

const membersOf = (band: BandCard): string => `${band.member_count} ${band.member_count === 1 ? "member" : "members"}`;
const needsOf = (band: BandCard): string | null => (band.open_roles.length ? `Needs ${band.open_roles.slice(0, 2).join(", ")}` : null);
const lineOf = (band: BandCard): string => [band.genres.slice(0, 2).join(", "), band.location].filter(Boolean).join(" · ") || membersOf(band);

/**
 * Search bands. The top bar's search box types into `?q=`; the chips here narrow it. With nothing typed
 * or chosen, genres to browse by sit above every band; a typed search leads with its best match.
 */
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

  return (
    <div className={patterns.body}>
      <h1 className="visually-hidden">Search bands</h1>
      <div className={styles.toolbar}>
        <ScopeChips active="bands" text={query.get("q")} />
        <div className={styles.filters}>
          <ChipSelect
            label="Looking for"
            any="Needs anyone"
            value={query.get("needs")}
            onChange={(value) => query.set({ needs: value })}
            options={asOptions(instruments, "Needs ")}
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
          <ChipSelect
            label="Band type"
            any="Any band"
            value={query.get("type")}
            onChange={(value) => query.set({ type: value })}
            options={BAND_TYPES.map((type) => ({ value: type.value, label: type.label }))}
          />
          <ChipToggle on={!!query.get("hiring")} onToggle={() => query.set({ hiring: query.get("hiring") ? null : "1" })}>
            Has open positions
          </ChipToggle>
          <span className={styles.divider} aria-hidden="true" />
          <ChipSelect
            label="Sort"
            any="Newest"
            value={query.get("sort")}
            onChange={(value) => query.set({ sort: value })}
            options={[{ value: "name", label: "Name" }]}
          />
          {query.filtered && (
            <button type="button" className={styles.clear} onClick={query.clear}>
              Clear all
            </button>
          )}
        </div>
      </div>

      {!query.filtered && genres.length > 0 && (
        <section aria-label="Browse by genre">
          <div className={patterns.sectionHead}>
            <h2 className={patterns.sectionTitle}>Browse by genre</h2>
          </div>
          <div className={patterns.browseGrid}>
            {genres.slice(0, 10).map((genre, index) => (
              <BrowseTile
                key={genre.id}
                href={`${routes.bands}?genre=${genre.id}`}
                label={genre.name}
                colour={tileColour(index + 3)}
                icon={<InstrumentIcon slug={tileIcon(index)} size={28} />}
              />
            ))}
          </div>
        </section>
      )}

      <Results
        page={page}
        error={error}
        retry={retry}
        noun={["band", "bands"]}
        query={query}
        title={query.filtered ? "Bands" : "Every band"}
        empty={
          <>
            <strong>No bands found</strong>
            <span className="muted">Check the spelling, or try fewer filters.</span>
          </>
        }
        top={(best, next) => (
          <TopSection
            rowsTitle="Bands"
            best={
              <TopResult
                href={routes.band(best.slug)}
                art={<Avatar initials={initialsOf(best.name)} tone={toneFor(best.id)} size={92} shape="square" photoUrl={best.logo_url} />}
                name={best.name}
                kind="Band"
                line={`${lineOf(best)} · ${membersOf(best)}`}
              />
            }
            rows={next.map((band) => (
              <ResultRow
                key={band.id}
                href={routes.band(band.slug)}
                art={<Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={44} shape="square" photoUrl={band.logo_url} />}
                name={band.name}
                line={lineOf(band)}
                aside={needsOf(band) ?? membersOf(band)}
              />
            ))}
          />
        )}
      >
        {(band) => (
          <MediaCard
            key={band.id}
            id={band.id}
            href={routes.band(band.slug)}
            title={band.name}
            subtitle={lineOf(band)}
            tag={needsOf(band)}
            photoUrl={band.logo_url}
          />
        )}
      </Results>
    </div>
  );
}
