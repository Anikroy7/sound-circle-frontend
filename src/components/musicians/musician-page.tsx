"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { InviteDialog } from "@/components/musicians/invite-dialog";
import styles from "@/components/musicians/musicians.module.css";
import { AudioTracks } from "@/components/patterns/audio-tracks";
import { EntityHeader } from "@/components/patterns/entity-header";
import patterns from "@/components/patterns/patterns.module.css";
import { instrumentSlug } from "@/components/patterns/tiles";
import { TrackList, TrackRow } from "@/components/patterns/track-list";
import { PhotoGrid, VideoTiles } from "@/components/profile/media-tiles";
import profile from "@/components/profile/profile.module.css";
import { announceInboxChange } from "@/components/requests/request-status";
import search from "@/components/search/search.module.css";
import { Avatar } from "@/components/ui/avatar";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import {
  answerRequest,
  ApiError,
  apiErrorMessage,
  getCurrentUser,
  getGenres,
  getInstruments,
  getInviteOptions,
  getMusician,
  searchBands,
} from "@/lib/api";
import { initialsOf, toneFor } from "@/lib/person";
import { BAND_INTEREST_LABELS, describeSlot, SKILL_LEVELS, sortSlots } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { BandCard, InviteOption, PublicMusician, RequestAnswer } from "@/types/discovery";
import type { CatalogItem } from "@/types/profile";

interface Loaded {
  musician: PublicMusician;
  signedIn: boolean;
  /** My published bands and where each stands with this musician; empty for a visitor or myself. */
  options: InviteOption[];
  bands: BandCard[];
  genres: Map<number, string>;
  instruments: Map<number, string>;
}

const toMap = (items: CatalogItem[]): Map<number, string> => new Map(items.map((item) => [item.id, item.name]));

/**
 * Anyone's public profile, from `GET /musicians/:slug`. A band owner can invite them from here, and
 * answer a join request they sent. Contact shows only what the musician made public.
 */
export function MusicianPage({ slug }: { slug: string }): React.JSX.Element {
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [inviting, setInviting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const loadOptions = useCallback(async (userId: number): Promise<InviteOption[]> => getInviteOptions(userId).catch(() => []), []);

  useEffect(() => {
    let live = true;
    (async () => {
      // First, so an expired access cookie is refreshed before the profile asks who is looking.
      const user = await getCurrentUser().catch(() => null);
      const [musician, genres, instruments] = await Promise.all([getMusician(slug), getGenres(), getInstruments()]);
      const [options, bands] = await Promise.all([
        user && !musician.is_self ? loadOptions(musician.user_id) : Promise.resolve([]),
        searchBands({ member_user_id: musician.user_id, page_size: 24 }).then(
          (result) => result.items,
          () => [],
        ),
      ]);
      if (live) setData({ musician, signedIn: !!user, options, bands, genres: toMap(genres), instruments: toMap(instruments) });
    })().catch((failure: unknown) => {
      if (live) setError({ status: failure instanceof ApiError ? failure.status : 0, message: apiErrorMessage(failure) });
    });
    return () => {
      live = false;
      setData(null);
      setError(null);
      setInviting(false);
      setNotice(null);
    };
  }, [slug, attempt, loadOptions]);

  const refreshOptions = useCallback(async () => {
    if (!data) return;
    const [options, bands] = await Promise.all([
      loadOptions(data.musician.user_id),
      searchBands({ member_user_id: data.musician.user_id, page_size: 24 }).then(
        (result) => result.items,
        () => data.bands,
      ),
    ]);
    setData((current) => current && { ...current, options, bands });
  }, [data, loadOptions]);

  const answer = async (requestId: number, choice: RequestAnswer, bandName: string): Promise<void> => {
    setBusy(true);
    setNotice(null);
    try {
      await answerRequest(requestId, choice);
      announceInboxChange();
      setNotice(choice === "accept" ? { tone: "success", text: `${data?.musician.name} joined ${bandName}.` } : null);
    } catch (failure) {
      setNotice({ tone: "error", text: apiErrorMessage(failure) });
    }
    await refreshOptions();
    setBusy(false);
  };

  if (error) {
    return (
      <div className={patterns.body}>
        {error.status === 404 ? (
          <div className={search.empty}>
            <strong>Musician not found</strong>
            <Link href={routes.musicians}>Browse musicians</Link>
          </div>
        ) : (
          <div role="alert" className="alert alert-error">
            We couldn&apos;t load this profile. {error.message}{" "}
            <button type="button" className="link-button" onClick={() => setAttempt((count) => count + 1)}>
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!data) {
    return (
      <div className={patterns.body} aria-busy="true">
        <span className="muted">Loading…</span>
      </div>
    );
  }

  const { musician, signedIn, options, bands, genres, instruments } = data;
  const played = [...musician.instruments]
    .sort((a, b) => b.skill_level - a.skill_level)
    .map((item) => ({ ...item, name: instruments.get(item.instrument_id) ?? "" }))
    .filter((item) => item.name);
  const performs = musician.performs_genre_ids.map((id) => genres.get(id)).filter(Boolean) as string[];
  const listens = musician.listens_genre_ids.map((id) => genres.get(id)).filter(Boolean) as string[];
  const interest = musician.band_interest ? BAND_INTEREST_LABELS[musician.band_interest] : null;
  const looking = musician.band_interest === 2 || musician.band_interest === 3;
  const slots = sortSlots(musician.availability);
  const requested = options.filter((option) => option.status === "requested" && option.request);
  const invited = options.filter((option) => option.status === "invited");
  const canInvite = options.length === 0 || options.some((option) => option.status === null);

  // The one thing to do here, in the action row and (compact) in the top bar.
  const mainAction = (compact: boolean): React.ReactNode => {
    const className = `${patterns.primaryAction} ${compact ? patterns.miniAction : ""}`;
    if (musician.is_self) {
      return (
        <Link className={`${patterns.secondaryAction} ${compact ? patterns.miniAction : ""}`} href={routes.myProfile}>
          Edit profile
        </Link>
      );
    }
    if (!signedIn) {
      return (
        <Link className={className} href={routes.login}>
          Log in to invite
        </Link>
      );
    }
    return (
      canInvite && (
        <button type="button" className={className} onClick={() => setInviting(true)}>
          Invite to band
        </button>
      )
    );
  };

  return (
    <>
      <EntityHeader
        kind="Musician"
        tone={toneFor(musician.user_id)}
        title={musician.name}
        art={
          <Avatar
            initials={initialsOf(musician.name)}
            tone={toneFor(musician.user_id)}
            size={148}
            photoUrl={musician.photo_url}
            className={`display ${patterns.entityArt} ${patterns.entityArtRound}`}
          />
        }
        meta={[
          played.length > 0 && <strong key="plays">{played.map((item) => item.name).join(", ")}</strong>,
          musician.locations[0] && `${musician.locations[0].label}${musician.locations.length > 1 ? ` +${musician.locations.length - 1}` : ""}`,
          bands.length > 0 && `${bands.length} ${bands.length === 1 ? "band" : "bands"}`,
        ]}
        actions={
          <>
            {mainAction(false)}
            {looking && <span className={patterns.statusPill}>Looking for a band</span>}
            {invited.length > 0 && (
              <span className="muted">Invited to {invited.map((option) => option.band.name).join(", ")} · waiting for an answer</span>
            )}
          </>
        }
        miniAction={mainAction(true)}
      />

      <div className={patterns.body}>
        <div className={patterns.notices}>
          {notice && (
            <div role="status" className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`}>
              {notice.text}
            </div>
          )}

          {requested.map((option) => (
            <div key={option.band.id} className={`alert ${styles.banner}`}>
              <span className={styles.bannerText}>
                <span>
                  <strong>{musician.name}</strong> wants to join <strong>{option.band.name}</strong>
                  {option.request?.role && ` as ${option.request.role.name}`}.
                </span>
                {option.request?.message && <span className="muted">“{option.request.message}”</span>}
              </span>
              <span className={styles.bannerActions}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  disabled={busy}
                  onClick={() => answer(option.request!.id, "decline", option.band.name)}
                >
                  Reject
                </button>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  disabled={busy}
                  onClick={() => answer(option.request!.id, "accept", option.band.name)}
                >
                  Accept
                </button>
              </span>
            </div>
          ))}
        </div>

        <div className={patterns.split}>
          <div className={patterns.column}>
            {musician.audio.length > 0 && (
              <section aria-label="Audio">
                <div className={patterns.sectionHead}>
                  <h2 className={patterns.sectionTitle}>Listen</h2>
                  <span className={patterns.panelCount}>
                    {musician.audio.length} {musician.audio.length === 1 ? "sample" : "samples"}
                  </span>
                </div>
                <AudioTracks tracks={musician.audio} />
              </section>
            )}

            {played.length > 0 && (
              <section aria-label="Instruments">
                <div className={patterns.sectionHead}>
                  <h2 className={patterns.sectionTitle}>Instruments</h2>
                </div>
                <TrackList head={["#", "Instrument", "Level"]} columns="28px minmax(0, 1fr) minmax(0, 160px)">
                  {played.map((item, index) => (
                    <TrackRow
                      key={item.instrument_id}
                      index={index + 1}
                      art={
                        <span className={styles.instrumentArt}>
                          <InstrumentIcon slug={instrumentSlug(item.name)} size={20} />
                        </span>
                      }
                      title={<span className={patterns.trackName}>{item.name}</span>}
                      cells={[SKILL_LEVELS.find((level) => level.value === item.skill_level)?.label]}
                    />
                  ))}
                </TrackList>
              </section>
            )}

            <section className="card panel">
              <h2 className="panel-title">About</h2>
              {musician.bio ? <p className={`${profile.prose} ${profile.bio}`}>{musician.bio}</p> : <span className="muted">No bio yet.</span>}
              <div className={profile.factGrid}>
                {performs.length > 0 && (
                  <div className={profile.fact}>
                    <span className={profile.factLabel}>Plays</span>
                    <div className={profile.chipRow}>
                      {performs.map((genre) => (
                        <span key={genre} className="chip chip-teal">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {listens.length > 0 && (
                  <div className={profile.fact}>
                    <span className={profile.factLabel}>Listens to</span>
                    <div className={profile.chipRow}>
                      {listens.map((genre) => (
                        <span key={genre} className="chip">
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {interest && (
                  <div className={profile.fact}>
                    <span className={profile.factLabel}>Band plans</span>
                    <strong>{interest.detail}</strong>
                  </div>
                )}
              </div>
            </section>

            {musician.videos.length > 0 && (
              <section className="card panel">
                <h2 className="panel-title">Videos</h2>
                <VideoTiles videos={musician.videos} />
              </section>
            )}

            {musician.photos.length > 0 && (
              <section className="card panel">
                <h2 className="panel-title">Photos</h2>
                <PhotoGrid photos={musician.photos} />
              </section>
            )}
          </div>

          <aside className={patterns.column}>
            {bands.length > 0 && (
              <section className={`card panel ${profile.asideCard}`}>
                <h2 className="panel-title panel-title-sm">Bands</h2>
                <ul className={styles.bandLinks}>
                  {bands.map((band) => (
                    <li key={band.id}>
                      <Link href={routes.band(band.slug)} className={styles.bandLink}>
                        <Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={36} shape="square" photoUrl={band.logo_url} />
                        {band.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {musician.locations.length > 0 && (
              <section className={`card panel ${profile.asideCard}`}>
                <h2 className="panel-title panel-title-sm">Can play in</h2>
                <ul className={profile.locationList}>
                  {musician.locations.map((location) => (
                    <li key={location.id} className="chip chip-teal">
                      {location.label}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {slots.length > 0 && (
              <section className={`card panel ${profile.asideCard}`}>
                <h2 className="panel-title panel-title-sm">Availability</h2>
                <ul className={profile.slotList}>
                  {slots.map((slot) => {
                    const { day, time } = describeSlot(slot);
                    return (
                      <li key={`${slot.day_of_week}-${slot.start_time}-${slot.end_time}`} className={profile.slot}>
                        <strong>{day}</strong>
                        <span className="muted">{time}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}

            {musician.phone && (
              <section className={`card panel ${profile.asideCard}`}>
                <h2 className="panel-title panel-title-sm">Contact</h2>
                <a href={`tel:${musician.phone}`}>{musician.phone}</a>
              </section>
            )}

            {musician.band_experiences.length > 0 && (
              <section className={`card panel ${profile.asideCard}`}>
                <h2 className="panel-title panel-title-sm">Experience</h2>
                <ul className={profile.bandList}>
                  {musician.band_experiences.map((band) => (
                    <li key={band.id} className={profile.bandEntry}>
                      <div className={profile.pastBand}>
                        <Avatar initials={initialsOf(band.band_name)} tone={toneFor(band.id)} size={40} shape="square" />
                        <span>
                          <strong>{band.band_name}</strong>
                          <span className={`muted ${profile.small} ${profile.block}`}>
                            {band.role} · {band.is_current ? "Current" : "Past"}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </aside>
        </div>
      </div>

      {inviting && (
        <InviteDialog
          musician={musician}
          instruments={played.map((item) => ({ id: item.instrument_id, name: item.name }))}
          options={options}
          onClose={() => setInviting(false)}
          onSent={() => {
            setInviting(false);
            setNotice({ tone: "success", text: `Invitation sent to ${musician.name}.` });
            refreshOptions();
          }}
        />
      )}
    </>
  );
}
