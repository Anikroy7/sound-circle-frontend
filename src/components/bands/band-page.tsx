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
import page from "@/components/layout/page.module.css";
import { PhotoGrid, VideoTiles } from "@/components/profile/media-tiles";
import profile from "@/components/profile/profile.module.css";
import { announceInboxChange } from "@/components/requests/request-status";
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
      <main className={page.page}>
        <div className={`card ${styles.stepCard}`} role="alert">
          {error.status === 404 ? (
            <>
              <h1 className={`display ${styles.stepTitle}`}>Band not found</h1>
              <p className="muted">This band doesn&apos;t exist, or hasn&apos;t been published yet.</p>
              <Link className={`btn btn-secondary ${styles.alignStart}`} href={routes.dashboard}>
                Go to my dashboard
              </Link>
            </>
          ) : (
            <div className={`alert alert-error ${styles.loadError}`}>
              <span>We couldn&apos;t load this band. {error.message}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttempt((count) => count + 1)}>
                Try again
              </button>
            </div>
          )}
        </div>
      </main>
    );
  }

  if (!band) {
    return (
      <main className={page.page}>
        <div className={`card ${styles.stepCard}`} aria-live="polite">
          <span className="muted">Loading the band…</span>
        </div>
      </main>
    );
  }

  return (
    <main className={profile.body}>
      <section className={`${profile.hero} ${profile.bandHeroRule}`}>
        <Avatar
          initials={initialsOf(band.name)}
          tone={toneFor(band.id)}
          size={144}
          shape="square"
          photoUrl={band.logo_url}
          className={`display ${profile.heroAvatar}`}
        />
        <div className={profile.heroText}>
          <div className={profile.nameRow}>
            <h1 className={`display ${profile.name}`}>{band.name}</h1>
            <span className={`chip ${band.band_type === 1 ? "chip-amber" : "chip-teal"}`}>{bandTypeLabel(band.band_type)}</span>
          </div>
          <div className={profile.chipRow}>
            {band.genres.map((genre) => (
              <span key={genre.id} className="chip">
                {genre.name}
              </span>
            ))}
          </div>
          {band.location && <span className="muted">Practises in {band.location.label}</span>}
        </div>
        <div className={profile.heroActions}>
          {band.is_owner ? (
            <>
              <Link className="btn btn-secondary" href={routes.bandDashboard(band.slug!)}>
                Band dashboard
              </Link>
              <Link
                className="btn btn-primary"
                href={band.open_roles.length ? `${routes.musicians}?instrument=${band.open_roles[0].instrument_id}&looking=1` : routes.musicians}
              >
                Find musicians
              </Link>
            </>
          ) : band.viewer.is_member ? (
            <>
              <span className={`chip chip-teal ${profile.heroChip}`}>You&apos;re a member</span>
              <Link className="btn btn-primary" href={routes.bandDashboard(band.slug!)}>
                Band dashboard
              </Link>
            </>
          ) : band.viewer.pending_request?.type === 1 ? (
            <>
              <button type="button" className="btn btn-secondary" disabled={busy} onClick={() => answer("decline")}>
                Decline
              </button>
              <button type="button" className="btn btn-primary" disabled={busy} onClick={() => answer("accept")}>
                Accept invitation
              </button>
            </>
          ) : band.viewer.pending_request?.type === 2 ? (
            <>
              <span className={`chip chip-amber ${profile.heroChip}`}>Request sent</span>
              <button type="button" className="btn btn-ghost" disabled={busy} onClick={() => answer("cancel")}>
                Withdraw
              </button>
            </>
          ) : band.open_roles.length > 0 ? (
            band.viewer.signed_in ? (
              <button type="button" className="btn btn-primary" onClick={() => setJoining({ roleId: null })}>
                Request to join
              </button>
            ) : (
              <Link className="btn btn-primary" href={routes.login}>
                Log in to join
              </Link>
            )
          ) : null}
        </div>
      </section>

      {band.viewer.pending_request?.type === 1 && !band.viewer.is_member && (
        <div className={`alert ${profile.notice}`}>
          {band.name} invited you to join{band.viewer.pending_request.instrument_name && ` as ${band.viewer.pending_request.instrument_name}`}.
        </div>
      )}

      {notice && (
        <div role="status" className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"} ${profile.notice}`}>
          {notice.text}
        </div>
      )}

      <div className={`${page.split} ${profile.bandSplit}`}>
        <div className={page.main}>
          <section className="card panel">
            <h2 className="panel-title">About the band</h2>
            <p className={`${profile.prose} ${profile.bio}`}>{band.bio}</p>
          </section>

          <OpenRolesPanel
            band={band}
            onBand={setBand}
            onApply={band.viewer.signed_in && !band.viewer.is_member && !band.viewer.pending_request ? (roleId) => setJoining({ roleId }) : undefined}
          />

          <section className="card panel">
            <div className={profile.panelHead}>
              <h2 className="panel-title">Members</h2>
              <span className={`muted ${profile.small}`}>{band.members.length}</span>
            </div>
            <div className={profile.memberGrid}>
              {band.members.map((member) => {
                const body = (
                  <>
                    <Avatar initials={initialsOf(member.name)} tone={member.user_id ? toneFor(member.user_id) : "slate"} size={48} photoUrl={member.photo_url} />
                    <span className={profile.memberText}>
                      <strong>{member.name}</strong>
                      <span className={profile.memberRole}>{member.instrument?.name ?? member.position ?? (member.is_owner ? "Band owner" : "Member")}</span>
                    </span>
                    {member.is_owner && <span className="chip chip-violet">Owner</span>}
                  </>
                );
                return member.profile_slug ? (
                  <Link key={member.id} href={routes.musician(member.profile_slug)} className={`inset ${profile.member}`}>
                    {body}
                  </Link>
                ) : (
                  <div key={member.id} className={`inset ${profile.member}`}>
                    {body}
                  </div>
                );
              })}
            </div>
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
            {band.videos.length ? (
              <VideoTiles videos={band.videos} />
            ) : (
              <div className={`muted ${profile.emptyNote}`}>No videos yet.</div>
            )}
          </section>
        </div>

        <aside className={page.aside}>
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
    </main>
  );
}
