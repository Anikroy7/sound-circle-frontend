"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { CardSkeleton, MediaCard } from "@/components/patterns/media-card";
import styles from "@/components/patterns/patterns.module.css";
import { Shelf } from "@/components/patterns/shelf";
import { BrowseTile, QuickTile, tileColour, tileIcon } from "@/components/patterns/tiles";
import { PlusIcon, RecordIcon } from "@/components/shell/shell-icons";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import { getGenres, getMyBands, searchBands, searchMusicians } from "@/lib/api";
import { useAuthStatus, useCurrentUser } from "@/lib/auth-session";
import { routes } from "@/lib/routes";
import type { BandCard, MusicianCard, MyBand } from "@/types/discovery";
import type { CatalogItem } from "@/types/profile";

type Filter = "all" | "musicians" | "bands";

const SHELF = 10;

/** Shortcuts at the top of Home. Instrument ids are the seeded ones. */
const QUICK = [
  { label: "Drummers", href: `${routes.musicians}?instrument=5`, icon: <InstrumentIcon slug="drums" size={22} /> },
  { label: "Guitarists", href: `${routes.musicians}?instrument=3`, icon: <InstrumentIcon slug="guitar" size={22} /> },
  { label: "Vocalists", href: `${routes.musicians}?instrument=1`, icon: <InstrumentIcon slug="vocals" size={22} /> },
  { label: "Bassists", href: `${routes.musicians}?instrument=4`, icon: <InstrumentIcon slug="bass" size={22} /> },
  { label: "Keys players", href: `${routes.musicians}?instrument=6`, icon: <InstrumentIcon slug="keyboard" size={22} /> },
  { label: "Bands hiring now", href: `${routes.bands}?hiring=1`, icon: <RecordIcon size={20} /> },
  { label: "New musicians", href: `${routes.musicians}?sort=newest`, icon: <InstrumentIcon slug="note" size={22} /> },
  { label: "Create a band", href: routes.createBand, icon: <PlusIcon size={20} /> },
];

/** "Good evening", from this browser's clock. The server can't know it, so it says "Welcome". */
const greetingNow = (): string => {
  const hour = new Date().getHours();
  return hour < 5 ? "Good evening" : hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
};
const noSubscription = (): (() => void) => () => undefined;

const musicianLine = (musician: MusicianCard): string => [musician.instruments.slice(0, 2).join(", "), musician.location].filter(Boolean).join(" · ");
const bandLine = (band: BandCard): string => [band.genres.slice(0, 2).join(", "), band.location].filter(Boolean).join(" · ");

/** Loads one shelf's items; null while loading. */
function useList<T>(load: () => Promise<T[]>, enabled = true): T[] | null {
  const [items, setItems] = useState<T[] | null>(null);
  // A fresh closure every render; loading once (per sign-in change) is the intent.
  const loader = useRef(load);
  useEffect(() => {
    loader.current = load;
  });
  useEffect(() => {
    if (!enabled) return;
    let live = true;
    loader.current().then(
      (rows) => live && setItems(rows),
      () => live && setItems([]),
    );
    return () => {
      live = false;
    };
  }, [enabled]);
  return items;
}

const skeletons = (count: number): ReactNode[] => Array.from({ length: count }, (_, index) => <CardSkeleton key={index} />);

interface HomeProps {
  /** The featured banner (the record collage). */
  banner: ReactNode;
  /** The draggable genre ticker. */
  ticker: ReactNode;
}

/**
 * Home: a greeting, filter chips, quick shortcuts, the featured banner and shelves of real musicians and
 * bands, then colourful genre tiles to browse by. Signed in, "Your bands" joins the shelves.
 */
export function Home({ banner, ticker }: HomeProps): React.JSX.Element {
  const status = useAuthStatus();
  const user = useCurrentUser();
  const greeting = useSyncExternalStore(noSubscription, greetingNow, () => "Welcome");
  const [filter, setFilter] = useState<Filter>("all");

  const looking = useList<MusicianCard>(() => searchMusicians({ looking_for_band: true, page_size: SHELF }).then((page) => page.items));
  const hiring = useList<BandCard>(() => searchBands({ hiring: true, page_size: SHELF }).then((page) => page.items));
  const fresh = useList<MusicianCard>(() => searchMusicians({ sort: "newest", page_size: SHELF }).then((page) => page.items));
  const allBands = useList<BandCard>(() => searchBands({ page_size: SHELF }).then((page) => page.items));
  const genres = useList<CatalogItem>(() => getGenres().then((rows) => rows.slice(0, 12)));
  const mine = useList<MyBand>(() => getMyBands(), status === "signed-in");

  const showMusicians = filter !== "bands";
  const showBands = filter !== "musicians";

  return (
    <div className={styles.body}>
      <div className={styles.chips} role="group" aria-label="Show">
        {(["all", "musicians", "bands"] as const).map((value) => (
          <button key={value} type="button" className={styles.chip} aria-pressed={filter === value} onClick={() => setFilter(value)}>
            {value === "all" ? "All" : value === "musicians" ? "Musicians" : "Bands"}
          </button>
        ))}
      </div>

      <section aria-label="Shortcuts">
        <h1 className={styles.sectionTitle} style={{ fontSize: 28, marginBottom: 16 }}>
          {greeting}
          {user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <div className={styles.quickGrid}>
          {QUICK.filter((tile) =>
            filter === "bands"
              ? tile.href.startsWith(routes.bands) || tile.href === routes.createBand
              : filter === "musicians"
                ? tile.href.startsWith(routes.musicians)
                : true,
          ).map((tile, index) => (
            <QuickTile key={tile.label} href={tile.href} label={tile.label} icon={tile.icon} colour={tileColour(index)} />
          ))}
        </div>
      </section>

      {filter === "all" && (
        <>
          {banner}
          {ticker}
        </>
      )}

      {status === "signed-in" && mine && mine.length > 0 && showBands && (
        <Shelf title="Your bands" href={routes.dashboard}>
          {mine.map((band) => (
            <MediaCard
              key={band.id}
              id={band.id}
              href={band.slug ? routes.band(band.slug) : routes.createBand}
              title={band.name}
              subtitle={
                band.is_draft ? "Draft · finish setting up" : `${band.is_owner ? "You own it" : "You're a member"} · ${band.member_count} members`
              }
              photoUrl={band.logo_url}
            />
          ))}
        </Shelf>
      )}

      {showMusicians && (
        <Shelf title="Musicians looking for a band" href={`${routes.musicians}?looking=1`}>
          {looking
            ? looking.map((musician) => (
                <MediaCard
                  key={musician.user_id}
                  id={musician.user_id}
                  round
                  href={routes.musician(musician.slug)}
                  title={musician.name}
                  subtitle={musicianLine(musician)}
                  photoUrl={musician.photo_url}
                />
              ))
            : skeletons(6)}
        </Shelf>
      )}

      {showBands && (
        <Shelf title="Bands looking for players" href={`${routes.bands}?hiring=1`}>
          {hiring
            ? hiring.map((band) => (
                <MediaCard
                  key={band.id}
                  id={band.id}
                  href={routes.band(band.slug)}
                  title={band.name}
                  subtitle={bandLine(band)}
                  tag={band.open_roles.length ? `Needs ${band.open_roles.slice(0, 2).join(", ")}` : null}
                  photoUrl={band.logo_url}
                />
              ))
            : skeletons(6)}
        </Shelf>
      )}

      {showMusicians && (
        <Shelf title="Just joined" href={`${routes.musicians}?sort=newest`}>
          {fresh
            ? fresh.map((musician) => (
                <MediaCard
                  key={musician.user_id}
                  id={musician.user_id}
                  round
                  href={routes.musician(musician.slug)}
                  title={musician.name}
                  subtitle={musicianLine(musician)}
                  photoUrl={musician.photo_url}
                />
              ))
            : skeletons(6)}
        </Shelf>
      )}

      {showBands && filter === "bands" && (
        <Shelf title="All bands" href={routes.bands}>
          {allBands
            ? allBands.map((band) => (
                <MediaCard
                  key={band.id}
                  id={band.id}
                  href={routes.band(band.slug)}
                  title={band.name}
                  subtitle={bandLine(band)}
                  photoUrl={band.logo_url}
                />
              ))
            : skeletons(6)}
        </Shelf>
      )}

      {genres && genres.length > 0 && (
        <section aria-label="Browse by genre">
          <div className={styles.sectionHead}>
            <h2 className={styles.sectionTitle}>Browse by genre</h2>
          </div>
          <div className={styles.browseGrid}>
            {genres.map((genre, index) => (
              <BrowseTile
                key={genre.id}
                href={`${filter === "bands" ? routes.bands : routes.musicians}?genre=${genre.id}`}
                label={genre.name}
                colour={tileColour(index + 3)}
                icon={<InstrumentIcon slug={tileIcon(index)} size={28} />}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
