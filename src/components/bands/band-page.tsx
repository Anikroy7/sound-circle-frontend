"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/bands/bands.module.css";
import { MembersEditor } from "@/components/bands/members-editor";
import page from "@/components/layout/page.module.css";
import { EditorDialog } from "@/components/profile/editor-dialog";
import { PhotoGrid, VideoTiles } from "@/components/profile/media-tiles";
import profile from "@/components/profile/profile.module.css";
import { Avatar } from "@/components/ui/avatar";
import { ApiError, apiErrorMessage, getBand } from "@/lib/api";
import { bandTypeLabel } from "@/lib/band-steps";
import { initialsOf, toneFor } from "@/lib/person";
import { VIDEO_PROVIDER_NAMES } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { Band } from "@/types/band-api";

/**
 * A published band's page, from `GET /bands/:slug`. Its owner gets Invite Members, which opens the
 * same line-up editor as creation step 2; changes show here at once. The effect re-runs on every visit
 * (Cache Components keeps hidden pages mounted), so the page is always fresh.
 */
export function BandPage({ slug }: { slug: string }): React.JSX.Element {
  const [band, setBand] = useState<Band | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [inviting, setInviting] = useState(false);

  useEffect(() => {
    let live = true;
    getBand(slug).then(
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
      setInviting(false);
    };
  }, [slug, attempt]);

  const closeInvite = useCallback(() => setInviting(false), []);

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
        {band.is_owner && (
          <div className={profile.heroActions}>
            <button type="button" className="btn btn-primary" onClick={() => setInviting(true)}>
              Invite Members
            </button>
          </div>
        )}
      </section>

      <div className={`${page.split} ${profile.bandSplit}`}>
        <div className={page.main}>
          <section className="card panel">
            <h2 className="panel-title">About the band</h2>
            <p className={`${profile.prose} ${profile.bio}`}>{band.bio}</p>
          </section>

          <section className="card panel">
            <div className={profile.panelHead}>
              <h2 className="panel-title">Members</h2>
              <span className={`muted ${profile.small}`}>{band.members.length}</span>
            </div>
            <div className={profile.memberGrid}>
              {band.members.map((member) => (
                <div key={member.id} className={`inset ${profile.member}`}>
                  <Avatar initials={initialsOf(member.name)} tone={member.user_id ? toneFor(member.user_id) : "slate"} size={48} photoUrl={member.photo_url} />
                  <span className={profile.memberText}>
                    <strong>{member.name}</strong>
                    <span className={profile.memberRole}>{member.position ?? (member.is_owner ? "Band owner" : "Member")}</span>
                  </span>
                  {member.is_owner && <span className="chip chip-violet">Owner</span>}
                </div>
              ))}
            </div>
          </section>

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
        </aside>
      </div>

      {inviting && (
        <EditorDialog id="invite-members" title="Invite Members" lead="Add people from SoundCircle, or someone who isn't on it yet." pending={false} onClose={closeInvite}>
          <MembersEditor band={band} onBand={setBand} />
          <div className={styles.actionsEnd}>
            <button type="button" className="btn btn-primary" onClick={closeInvite}>
              Done
            </button>
          </div>
        </EditorDialog>
      )}
    </main>
  );
}
