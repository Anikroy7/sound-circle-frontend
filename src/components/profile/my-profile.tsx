"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import page from "@/components/layout/page.module.css";
import styles from "@/components/profile/profile.module.css";
import { ProfilePhoto } from "@/components/onboarding/media/profile-photo";
import { LocationEditor } from "@/components/profile/location-editor";
import { PhotoGrid, VideoTiles } from "@/components/profile/media-tiles";
import { SectionEditor } from "@/components/profile/section-editor";
import { Avatar } from "@/components/ui/avatar";
import { ApiError, apiErrorMessage, getCurrentUser, getGenres, getInstruments, getMyProfile } from "@/lib/api";
import { initialsOf, toneFor } from "@/lib/person";
import {
  BAND_INTEREST_LABELS,
  describeSlot,
  formatDuration,
  PROFILE_STEPS,
  profileDestination,
  SKILL_LEVELS,
  sortSlots,
  stepIndex,
  trackTitle,
  type ProfileStepSlug,
} from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { AccountUser } from "@/types/auth";
import type { CatalogItem, MusicianProfile } from "@/types/profile";

const SKILL_STEPS = [1, 2, 3, 4];

interface Loaded {
  user: AccountUser;
  profile: MusicianProfile;
  catalog: { instruments: CatalogItem[]; genres: CatalogItem[] };
  genres: Map<number, string>;
  instruments: Map<number, string>;
}

const toMap = (items: CatalogItem[]): Map<number, string> => new Map(items.map((item) => [item.id, item.name]));

/** Opens the section's editor; undefined when that section can't be edited yet (setup hasn't reached it). */
type OnEdit = (() => void) | undefined;

function EditButton({ label, onEdit }: { label: string; onEdit: OnEdit }): React.JSX.Element | null {
  if (!onEdit) return null;
  return (
    <button type="button" className={styles.editLink} onClick={onEdit} aria-label={`Edit ${label}`}>
      Edit
    </button>
  );
}

/** The section's heading with an Edit button that opens its editor on this page. */
function PanelHead({ title, onEdit, count, small = false }: { title: string; onEdit: OnEdit; count?: string; small?: boolean }): React.JSX.Element {
  return (
    <div className={styles.panelHead}>
      <h2 className={`panel-title ${small ? "panel-title-sm" : ""}`}>{title}</h2>
      <span className={styles.panelTools}>
        {count && <span className={`muted ${styles.small}`}>{count}</span>}
        <EditButton label={title.toLowerCase()} onEdit={onEdit} />
      </span>
    </div>
  );
}

/** An empty section says what is missing, with a button that opens the editor to add it. */
function Empty({ children, onEdit, action }: { children: string; onEdit: OnEdit; action: string }): React.JSX.Element {
  return (
    <div className={`muted ${styles.emptyNote}`}>
      {children}{" "}
      {onEdit && (
        <button type="button" className={styles.inlineLink} onClick={onEdit}>
          {action}
        </button>
      )}
    </div>
  );
}

/**
 * The signed-in musician's own profile, drawn from `GET /auth/me` and `GET /profiles/me`. Every
 * section links back to the setup step that edits it. Hidden pages keep their state under Cache
 * Components, so the effect re-runs on every visit (fresh data after an edit) and clears on leave
 * (the next account never sees the last one's profile).
 */
export function MyProfile(): React.JSX.Element {
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  /** The section open in the editor dialog. */
  /** The section open in an editor dialog: a setup step's form, or the locations on their own. */
  const [editing, setEditing] = useState<ProfileStepSlug | "location" | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([getCurrentUser(), getMyProfile(), getGenres(), getInstruments()]).then(
      ([user, profile, genres, instruments]) => {
        if (!live) return;
        if (!user) return router.replace(routes.login);
        // Nothing saved yet: there is no profile to show, so start setting one up.
        if (profile.setup_step === 0) return router.replace(profileDestination(profile));
        setData({ user, profile, catalog: { instruments, genres }, genres: toMap(genres), instruments: toMap(instruments) });
      },
      (failure: unknown) => {
        if (!live) return;
        if (failure instanceof ApiError && failure.status === 401) return router.replace(routes.login);
        setError(apiErrorMessage(failure));
      },
    );
    return () => {
      live = false;
      setData(null);
      setError(null);
      setEditing(null);
    };
  }, [router, attempt]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  const closeEditor = useCallback(() => setEditing(null), []);
  const updateProfile = useCallback((profile: MusicianProfile) => setData((current) => current && { ...current, profile }), []);

  if (error) {
    return (
      <main className={page.page}>
        <div role="alert" className={`alert alert-error ${styles.loadState}`}>
          <span>We couldn&apos;t load your profile. {error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={retry}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={page.page}>
        <div className={`card ${styles.loadState}`} aria-live="polite">
          <span className="muted">Loading your profile…</span>
        </div>
      </main>
    );
  }

  const { user, profile, catalog, genres, instruments } = data;
  // The API accepts a step once the one before it is done, so only sections setup has reached are editable here.
  const editLocation = (): void => setEditing("location");
  const edit = (slug: ProfileStepSlug): OnEdit => (stepIndex(slug) <= profile.setup_step ? () => setEditing(slug) : undefined);
  const finished = profile.setup_step >= PROFILE_STEPS.length;
  const performs = profile.performs_genre_ids.map((id) => genres.get(id)).filter(Boolean) as string[];
  const listens = profile.listens_genre_ids.map((id) => genres.get(id)).filter(Boolean) as string[];
  const played = profile.instruments
    .map((item) => ({ ...item, name: instruments.get(item.instrument_id) }))
    .filter((item): item is typeof item & { name: string } => !!item.name)
    .sort((a, b) => b.skill_level - a.skill_level);
  const slots = sortSlots(profile.availability);
  const interest = profile.band_interest ? BAND_INTEREST_LABELS[profile.band_interest] : null;
  const currentBands = profile.band_experiences.filter((band) => band.is_current);

  return (
    <>
      <main className={styles.body}>
        <nav aria-label="Breadcrumb" className={`muted ${styles.breadcrumb}`}>
          <Link href={routes.dashboard}>My dashboard</Link> / My profile
        </nav>

        <section className={styles.hero}>
          <ProfilePhoto photoUrl={profile.photo_url} name={user.name} userId={user.id} size={168} onProfile={updateProfile} layout="hero" />
          <div className={styles.heroText}>
            <div className={styles.nameRow}>
              <h1 className={`display ${styles.name}`}>{user.name}</h1>
              {interest && <span className={`chip ${profile.band_interest === 1 ? "chip-muted" : "chip-teal"}`}>{interest.status}</span>}
            </div>
            <div className={styles.metaRow}>
              {played.length > 0 && <span className={styles.instrument}>{played.map((item) => item.name).join(" · ")}</span>}
              {performs.length > 0 && <span className="muted">{performs.slice(0, 3).join(", ")}</span>}
              {currentBands.length > 0 && <span className="muted">In {currentBands.map((band) => band.band_name).join(", ")}</span>}
              {profile.locations.length > 0 ? (
                <span className="muted">
                  {profile.locations[0].label}
                  {profile.locations.length > 1 && ` + ${profile.locations.length - 1} more`}
                </span>
              ) : (
                <button type="button" className={styles.inlineLink} onClick={editLocation}>
                  + Add your location
                </button>
              )}
            </div>
          </div>
          <div className={styles.heroActions}>
            <Link className="btn btn-primary" href={routes.dashboard}>
              My dashboard
            </Link>
          </div>
        </section>

        {finished && !profile.locations.length && (
          <div className={`alert ${styles.notice}`}>
            <span>
              <strong>Add your location.</strong> Bands search by area, so without one they can&apos;t find you nearby.
            </span>
            <button type="button" className="btn btn-primary btn-sm" onClick={editLocation}>
              Add location
            </button>
          </div>
        )}

        {!finished ? (
          <div className={`alert ${styles.notice}`}>
            <span>
              <strong>Your profile is {profile.profile_completion}% complete.</strong> Finish setting it up so bands can find you.
            </span>
            <Link className="btn btn-primary btn-sm" href={profileDestination(profile)}>
              Continue setup
            </Link>
          </div>
        ) : (
          profile.profile_completion < 100 && (
            <div className={`alert ${styles.notice}`}>
              <span>
                <strong>Profile {profile.profile_completion}% complete.</strong> Add an audio sample, a photo or a video to your gallery to stand out in search.
              </span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setEditing("gallery")}>
                Add media
              </button>
            </div>
          )
        )}

        <div className={`${page.split} ${styles.profileSplit}`}>
          <div className={page.main}>
            <section className="card panel">
              <PanelHead title="About" onEdit={edit("about")} />
              {profile.bio ? <p className={`${styles.prose} ${styles.bio}`}>{profile.bio}</p> : <Empty onEdit={edit("about")} action="Write about yourself">No bio yet.</Empty>}
              <div className={styles.factGrid}>
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Plays</span>
                  {performs.length ? (
                    <div className={styles.chipRow}>
                      {performs.map((genre) => (
                        <span key={genre} className="chip chip-teal">
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">Not set</span>
                  )}
                </div>
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Listens to</span>
                  {listens.length ? (
                    <div className={styles.chipRow}>
                      {listens.map((genre) => (
                        <span key={genre} className="chip">
                          {genre}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="muted">Not set</span>
                  )}
                </div>
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Band plans</span>
                  {interest ? <strong>{interest.detail}</strong> : <span className="muted">Not set</span>}
                </div>
              </div>
            </section>

            <section className="card panel">
              <PanelHead title="Instruments" onEdit={edit("instruments")} />
              {played.length ? (
                <ul className={styles.instrumentList}>
                  {played.map((item) => {
                    const label = SKILL_LEVELS.find((level) => level.value === item.skill_level)?.label ?? "";
                    return (
                      <li key={item.instrument_id} className={`inset ${styles.instrumentRow}`}>
                        <strong>{item.name}</strong>
                        <span className={styles.skill}>
                          <span className={styles.skillMeter} role="img" aria-label={`${label}, ${item.skill_level} of 4`}>
                            {SKILL_STEPS.map((step) => (
                              <span key={step} className={step <= item.skill_level ? styles.skillOn : undefined} />
                            ))}
                          </span>
                          <span className="muted">{label}</span>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Empty onEdit={edit("instruments")} action="Add your instruments">
                  No instruments yet.
                </Empty>
              )}
            </section>

            <section className="card panel">
              <PanelHead title="Audio samples" onEdit={edit("gallery")} count={profile.audio.length ? `${profile.audio.length} ${profile.audio.length === 1 ? "track" : "tracks"}` : undefined} />
              {profile.audio.length ? (
                <ul className={styles.audioList}>
                  {profile.audio.map((track) => (
                    <li key={track.id} className={`inset ${styles.audioRow}`}>
                      <span className={styles.trackText}>
                        <strong className={styles.trackTitle}>{trackTitle(track.file_name)}</strong>
                        <span className={`muted ${styles.small}`}>
                          {[track.format.toUpperCase(), track.duration_seconds ? formatDuration(track.duration_seconds) : null].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <audio controls preload="none" src={track.secure_url} className={styles.audioPlayer}>
                        <a href={track.secure_url}>Download {trackTitle(track.file_name)}</a>
                      </audio>
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty onEdit={edit("gallery")} action="Upload audio">
                  No audio samples yet.
                </Empty>
              )}
            </section>

            <section className="card panel">
              <PanelHead title="Videos" onEdit={edit("gallery")} />
              {profile.videos.length ? (
                <VideoTiles videos={profile.videos} />
              ) : (
                <Empty onEdit={edit("gallery")} action="Add a video link">
                  No videos yet.
                </Empty>
              )}
            </section>

            <section className="card panel">
              <PanelHead title="Performance photos" onEdit={edit("gallery")} count={profile.photos.length ? `${profile.photos.length}` : undefined} />
              {profile.photos.length ? (
                <PhotoGrid photos={profile.photos} />
              ) : (
                <Empty onEdit={edit("gallery")} action="Upload photos">
                  No photos yet.
                </Empty>
              )}
            </section>
          </div>

          <aside className={page.aside}>
            <section className={`card panel ${styles.asideCard}`}>
              <PanelHead title="Location" onEdit={editLocation} small />
              {profile.locations.length ? (
                <ul className={styles.locationList}>
                  {profile.locations.map((location) => (
                    <li key={location.id} className="chip chip-teal">
                      {location.label}
                    </li>
                  ))}
                </ul>
              ) : (
                <Empty onEdit={editLocation} action="Add your location">
                  Not set yet.
                </Empty>
              )}
            </section>

            <section id="contact" className={`card panel ${styles.asideCard}`}>
              <PanelHead title="Contact" onEdit={edit("contact")} small />
              <dl className={styles.definitionList}>
                <div>
                  <dt className="muted">Phone</dt>
                  <dd className={styles.contactOpen}>{profile.phone ?? "Not set"}</dd>
                </div>
                <div>
                  <dt className="muted">Phone visibility</dt>
                  <dd className={styles.contactGated}>{profile.show_phone ? "Shown on your profile" : "Hidden from others"}</dd>
                </div>
                {user.email && (
                  <div>
                    <dt className="muted">Email</dt>
                    <dd className={`${styles.contactGated} ${styles.breakAll}`}>{user.email}</dd>
                  </div>
                )}
              </dl>
            </section>

            <section className={`card panel ${styles.asideCard}`}>
              <PanelHead title="Availability" onEdit={edit("availability")} small />
              {slots.length ? (
                <ul className={styles.slotList}>
                  {slots.map((slot) => {
                    const { day, time } = describeSlot(slot);
                    return (
                      <li key={`${slot.day_of_week}-${slot.start_time}-${slot.end_time}`} className={styles.slot}>
                        <strong>{day}</strong>
                        <span className="muted">{time}</span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <span className="muted">Not set</span>
              )}
            </section>

            <section className={`card panel ${styles.asideCard}`}>
              <PanelHead title="Bands" onEdit={edit("band-experience")} small />
              {profile.band_experiences.length ? (
                <ul className={styles.bandList}>
                  {profile.band_experiences.map((band) => (
                    <li key={band.id} className={styles.bandEntry}>
                      <div className={styles.pastBand}>
                        <Avatar initials={initialsOf(band.band_name)} tone={toneFor(band.id)} size={44} shape="square" />
                        <span>
                          <strong>{band.band_name}</strong>
                          <span className={`muted ${styles.small} ${styles.block}`}>
                            {band.role} · {band.is_current ? "Current" : "Past"}
                          </span>
                        </span>
                      </div>
                      {band.photos.length > 0 && <PhotoGrid photos={band.photos} size="small" />}
                      {band.videos.length > 0 && <VideoTiles videos={band.videos} compact />}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className={`muted ${styles.emptyNote}`}>{finished ? "No band experience yet." : "Not set yet."}</div>
              )}
            </section>
          </aside>
        </div>
      </main>

      {editing === "location" ? (
        <LocationEditor profile={profile} onProfile={updateProfile} onClose={closeEditor} />
      ) : (
        editing && <SectionEditor key={editing} slug={editing} profile={profile} catalog={catalog} onProfile={updateProfile} onClose={closeEditor} />
      )}
    </>
  );
}
