"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/bands/bands.module.css";
import { JoinDialog } from "@/components/bands/join-dialog";
import { LineupPanel } from "@/components/bands/lineup-panel";
import { MemberIntros } from "@/components/bands/member-intros";
import { MilestonesPanel } from "@/components/bands/milestones-panel";
import { OpenRolesPanel } from "@/components/bands/open-roles-panel";
import { WelcomeModal } from "@/components/bands/welcome-modal";
import { EntityHeader } from "@/components/patterns/entity-header";
import patterns from "@/components/patterns/patterns.module.css";
import { TrackList, TrackRow } from "@/components/patterns/track-list";
import { PhotoGrid, VideoTiles } from "@/components/profile/media-tiles";
import profile from "@/components/profile/profile.module.css";
import { announceInboxChange } from "@/components/requests/request-status";
import search from "@/components/search/search.module.css";
import { Avatar } from "@/components/ui/avatar";
import { answerRequest, ApiError, apiErrorMessage, getBand, getCurrentUser } from "@/lib/api";
import { bandTypeLabel } from "@/lib/band-steps";
import { initialsOf, toneFor } from "@/lib/person";
import { VIDEO_PROVIDER_NAMES } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { Band } from "@/types/band-api";

/**
 * A published band's page, from `GET /bands/:slug`. Its owner edits the line-up and the open positions
 * here; anyone else signed in can ask to fill a position for an instrument they play, or answer the
 * band's invitation. The effect re-runs on every visit (Cache Components keeps hidden pages mounted),
 * so the page is always fresh.
 */
export function BandPage({ slug }: { slug: string }): React.JSX.Element {
  const [band, setBand] = useState<Band | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  /** The join dialog: open (with the position clicked, if any) or closed. */
  const [joining, setJoining] = useState<{ roleId: number | null } | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  const reload = useCallback(() => getBand(slug).then(setBand, () => undefined), [slug]);

  const answer = async (choice: "accept" | "decline" | "cancel"): Promise<void> => {
    if (!band?.viewer.pending_request) return;
    setBusy(true);
    setNotice(null);
    try {
      await answerRequest(band.viewer.pending_request.id, choice);
      announceInboxChange();
      if (choice === "accept") setNotice({ tone: "success", text: `Welcome to ${band.name}!` });
    } catch (failure) {
      setNotice({ tone: "error", text: apiErrorMessage(failure) });
    }
    await reload();
    setBusy(false);
  };

  useEffect(() => {
    let live = true;
    // First, so an expired access cookie is refreshed before the band says where the viewer stands.
    getCurrentUser()
      .catch(() => null)
      .then(() => getBand(slug))
      .then(
        (loaded) => live && setBand(loaded),
        (failure: unknown) => {
          if (!live) return;
          setError({ status: failure instanceof ApiError ? failure.status : 0, message: apiErrorMessage(failure) });
        },
      );
    return () => {
      live = false;
      setBand(null);
      setError(null);
      setJoining(null);
      setNotice(null);
    };
  }, [slug, attempt]);

  const welcomed = band ? band.members.find((member) => member.id === band.viewer.member_id) : undefined;

  if (error) {
    return (
      <div className={patterns.body}>
        {error.status === 404 ? (
          <div className={search.empty} role="alert">
            <strong>Band not found</strong>
            <span className="muted">This band doesn&apos;t exist, or hasn&apos;t been published yet.</span>
            <Link href={routes.bands}>Browse bands</Link>
          </div>
        ) : (
          <div className={`alert alert-error ${styles.loadError}`} role="alert">
            <span>We couldn&apos;t load this band. {error.message}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttempt((count) => count + 1)}>
              Try again
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!band) {
    return (
      <div className={patterns.body} aria-live="polite">
        <span className="muted">Loading the band…</span>
      </div>
    );
  }

  const pending = band.viewer.pending_request;
  const findHref = band.open_roles.length ? `${routes.musicians}?instrument=${band.open_roles[0].instrument_id}&looking=1` : routes.musicians;

  // The main thing to do here, by who is looking. `compact` is the copy in the top bar.
  const actions = (compact: boolean): React.ReactNode => {
    const mini = compact ? patterns.miniAction : "";
    const primary = `${patterns.primaryAction} ${mini}`;
    const secondary = `${patterns.secondaryAction} ${mini}`;
    if (band.is_owner) {
      return (
        <>
          <Link className={primary} href={findHref}>
            Find musicians
          </Link>
          {!compact && (
            <Link className={secondary} href={routes.bandDashboard(band.slug!)}>
              Band dashboard
            </Link>
          )}
        </>
      );
    }
    if (band.viewer.is_member) {
      return (
        <>
          <Link className={primary} href={routes.bandDashboard(band.slug!)}>
            Band dashboard
          </Link>
          {!compact && <span className={patterns.statusPill}>You&apos;re a member</span>}
        </>
      );
    }
    if (pending?.type === 1) {
      return (
        <>
          <button type="button" className={primary} disabled={busy} onClick={() => answer("accept")}>
            Accept invitation
          </button>
          {!compact && (
            <button type="button" className={secondary} disabled={busy} onClick={() => answer("decline")}>
              Decline
            </button>
          )}
        </>
      );
    }
    if (pending?.type === 2) {
      return compact ? null : (
        <>
          <span className={patterns.statusPill}>Request sent</span>
          <button type="button" className={patterns.secondaryAction} disabled={busy} onClick={() => answer("cancel")}>
            Withdraw
          </button>
        </>
      );
    }
    if (!band.open_roles.length) return null;
    return band.viewer.signed_in ? (
      <button type="button" className={primary} onClick={() => setJoining({ roleId: null })}>
        Request to join
      </button>
    ) : (
      <Link className={primary} href={routes.login}>
        Log in to join
      </Link>
    );
  };

  return (
    <>
      <EntityHeader
        kind={bandTypeLabel(band.band_type)}
        tone={toneFor(band.id)}
        title={band.name}
        art={
          <Avatar
            initials={initialsOf(band.name)}
            tone={toneFor(band.id)}
            size={148}
            shape="square"
            photoUrl={band.logo_url}
            className={`display ${patterns.entityArt}`}
          />
        }
        meta={[
          band.genres.length > 0 && <strong key="genres">{band.genres.map((genre) => genre.name).join(", ")}</strong>,
          band.location && `Practises in ${band.location.label}`,
          `${band.members.length} ${band.members.length === 1 ? "member" : "members"}`,
          band.open_roles.length > 0 && `${band.open_roles.length} open ${band.open_roles.length === 1 ? "position" : "positions"}`,
        ]}
        actions={actions(false)}
        miniAction={actions(true)}
      />

      <div className={patterns.body}>
        <div className={patterns.notices}>
          {pending?.type === 1 && !band.viewer.is_member && (
            <div className="alert">
              {band.name} invited you to join{pending.instrument_name && ` as ${pending.instrument_name}`}.
            </div>
          )}

          {notice && (
            <div role="status" className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`}>
              {notice.text}
            </div>
          )}
        </div>

        <div className={patterns.split}>
          <div className={patterns.column}>
            <section aria-label="Members">
              <div className={patterns.sectionHead}>
                <h2 className={patterns.sectionTitle}>Line-up</h2>
                <span className={patterns.panelCount}>
                  {band.members.length} {band.members.length === 1 ? "member" : "members"}
                </span>
              </div>
              <TrackList head={["#", "Member", "Plays"]} columns="28px minmax(0, 1fr) minmax(0, 200px)">
                {band.members.map((member, index) => (
                  <TrackRow
                    key={member.id}
                    index={index + 1}
                    art={
                      <Avatar
                        initials={initialsOf(member.name)}
                        tone={member.user_id ? toneFor(member.user_id) : "slate"}
                        size={40}
                        photoUrl={member.photo_url}
                      />
                    }
                    title={
                      member.profile_slug ? (
                        <Link href={routes.musician(member.profile_slug)} className={patterns.trackName}>
                          {member.name}
                        </Link>
                      ) : (
                        <span className={patterns.trackName}>{member.name}</span>
                      )
                    }
                    subtitle={member.is_owner ? "Band owner" : member.user_id ? "Member" : "Not on SoundCircle yet"}
                    cells={[member.instrument?.name ?? member.position ?? "–"]}
                  />
                ))}
              </TrackList>
            </section>

            <OpenRolesPanel
              band={band}
              onBand={setBand}
              onApply={
                band.viewer.signed_in && !band.viewer.is_member && !band.viewer.pending_request ? (roleId) => setJoining({ roleId }) : undefined
              }
            />

            <section className="card panel">
              <h2 className="panel-title">About the band</h2>
              <p className={`${profile.prose} ${profile.bio}`}>{band.bio}</p>
            </section>

            <LineupPanel lineup={band.lineup} />

            <MemberIntros
              members={band.members}
              viewerMemberId={band.viewer.member_id}
              introduceHref={band.viewer.member_id ? routes.bandDashboard(band.slug!, "introduction") : undefined}
            />

            <section className="card panel">
              <h2 className="panel-title">Performance photos</h2>
              {band.photos.length ? <PhotoGrid photos={band.photos} /> : <div className={`muted ${profile.emptyNote}`}>No photos yet.</div>}
            </section>

            <section className="card panel">
              <h2 className="panel-title">Performance videos</h2>
              {band.videos.length ? <VideoTiles videos={band.videos} /> : <div className={`muted ${profile.emptyNote}`}>No videos yet.</div>}
            </section>
          </div>

          <aside className={patterns.column}>
            <section className={`card panel ${profile.asideCard}`}>
              <h2 className="panel-title panel-title-sm">At a glance</h2>
              <dl className={profile.definitionList}>
                <div>
                  <dt className="muted">Band</dt>
                  <dd>{bandTypeLabel(band.band_type)}</dd>
                </div>
                <div>
                  <dt className="muted">Practice location</dt>
                  <dd className={profile.breakAll}>{band.location?.label ?? "—"}</dd>
                </div>
                <div>
                  <dt className="muted">Members</dt>
                  <dd>{band.members.length}</dd>
                </div>
                {band.videos.length > 0 && (
                  <div>
                    <dt className="muted">Videos on</dt>
                    <dd>{[...new Set(band.videos.map((video) => VIDEO_PROVIDER_NAMES[video.provider]))].join(", ")}</dd>
                  </div>
                )}
              </dl>
            </section>
            <MilestonesPanel milestones={band.milestones} small />
          </aside>
        </div>
      </div>

      {band.viewer.needs_welcome && welcomed && <WelcomeModal band={band} member={welcomed} onDone={setBand} />}

      {joining && (
        <JoinDialog
          band={band}
          roleId={joining.roleId}
          onClose={() => setJoining(null)}
          onSent={() => {
            setJoining(null);
            setNotice({ tone: "success", text: "Request sent. The band owner will review your profile." });
            reload();
          }}
        />
      )}
    </>
  );
}
