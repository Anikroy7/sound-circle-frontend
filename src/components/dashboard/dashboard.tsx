"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/dashboard/dashboard.module.css";
import page from "@/components/layout/page.module.css";
import { announceInboxChange, RequestStatusChip, timeAgo } from "@/components/requests/request-status";
import { Avatar } from "@/components/ui/avatar";
import { answerRequest, ApiError, apiErrorMessage, getCurrentUser, getInbox, getMyBands, getMyProfile } from "@/lib/api";
import { initialsOf, toneFor } from "@/lib/person";
import { profileDestination } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { AccountUser } from "@/types/auth";
import type { MembershipInbox, MembershipRequest, MyBand, RequestAnswer } from "@/types/discovery";
import type { MusicianProfile } from "@/types/profile";

interface Loaded {
  user: AccountUser;
  profile: MusicianProfile;
  inbox: MembershipInbox;
  bands: MyBand[];
}

const bandHref = (band: { slug: string | null }): string => (band.slug ? routes.band(band.slug) : routes.createBand);

/** One invitation to me, or one join request to my band, with its answer buttons. */
function IncomingRow({ request, busy, onAnswer }: { request: MembershipRequest; busy: boolean; onAnswer: (answer: RequestAnswer) => void }): React.JSX.Element {
  const invitation = request.type === 1;
  const role = request.role ? ` · ${request.role.name}` : "";

  return (
    <li className={styles.row}>
      {invitation ? (
        <Avatar initials={initialsOf(request.band.name)} tone={toneFor(request.band.id)} size={44} shape="square" photoUrl={request.band.logo_url} />
      ) : (
        <Avatar initials={initialsOf(request.musician.name)} tone={toneFor(request.musician.user_id)} size={44} photoUrl={request.musician.photo_url} />
      )}
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>
          {invitation ? (
            <>
              <Link href={bandHref(request.band)}>{request.band.name}</Link> invited you
            </>
          ) : (
            <>
              {request.musician.slug ? <Link href={routes.musician(request.musician.slug)}>{request.musician.name}</Link> : <strong>{request.musician.name}</strong>} wants
              to join <strong>{request.band.name}</strong>
            </>
          )}
        </span>
        <span className={styles.rowMeta}>
          {timeAgo(request.created_at)}
          {role}
        </span>
        {request.message && <p className={styles.message}>{request.message}</p>}
      </div>
      <div className={styles.actions}>
        {invitation ? (
          request.band.slug && (
            <Link className="btn btn-ghost btn-sm" href={routes.band(request.band.slug)}>
              View band
            </Link>
          )
        ) : (
          request.musician.slug && (
            <Link className="btn btn-ghost btn-sm" href={routes.musician(request.musician.slug)}>
              View profile
            </Link>
          )
        )}
        <button type="button" className="btn btn-secondary btn-sm" disabled={busy} onClick={() => onAnswer("decline")}>
          {invitation ? "Decline" : "Reject"}
        </button>
        <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={() => onAnswer("accept")}>
          Accept
        </button>
      </div>
    </li>
  );
}

/** Something I sent: its status, and Withdraw while it's pending. */
function SentRow({ request, busy, onWithdraw }: { request: MembershipRequest; busy: boolean; onWithdraw: () => void }): React.JSX.Element {
  const invitation = request.type === 1;
  return (
    <li className={styles.row}>
      <div className={styles.rowText}>
        <span className={styles.rowTitle}>
          {invitation ? (
            <>
              Invited {request.musician.slug ? <Link href={routes.musician(request.musician.slug)}>{request.musician.name}</Link> : <strong>{request.musician.name}</strong>}{" "}
              to {request.band.name}
            </>
          ) : (
            <>Asked to join {request.band.slug ? <Link href={routes.band(request.band.slug)}>{request.band.name}</Link> : <strong>{request.band.name}</strong>}</>
          )}
        </span>
        <span className={styles.rowMeta}>
          {timeAgo(request.created_at)}
          {request.role && ` · ${request.role.name}`}
        </span>
      </div>
      <div className={styles.actions}>
        <RequestStatusChip status={request.status} className={styles.statusChip} />
        {request.status === 1 && (
          <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={onWithdraw}>
            Withdraw
          </button>
        )}
      </div>
    </li>
  );
}

/**
 * The signed-in user's dashboard: invitations and join requests waiting on their answer, their bands, and
 * what they've sent. Accepting adds the musician to the band at once.
 */
export function Dashboard(): React.JSX.Element {
  const router = useRouter();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [busy, setBusy] = useState<number | null>(null);
  const [notice, setNotice] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    let live = true;
    getCurrentUser()
      .then((user) => {
        if (!user) {
          router.replace(routes.login);
          return null;
        }
        return Promise.all([getMyProfile(), getInbox(), getMyBands()]).then(([profile, inbox, bands]) => live && setData({ user, profile, inbox, bands }));
      })
      .catch((failure: unknown) => {
        if (!live) return;
        if (failure instanceof ApiError && failure.status === 401) return router.replace(routes.login);
        setError(apiErrorMessage(failure));
      });
    return () => {
      live = false;
      setData(null);
      setError(null);
      setNotice(null);
    };
  }, [router, attempt]);

  const answer = useCallback(async (request: MembershipRequest, choice: RequestAnswer) => {
    setBusy(request.id);
    setNotice(null);
    try {
      await answerRequest(request.id, choice);
      const [inbox, bands] = await Promise.all([getInbox(), getMyBands()]);
      setData((current) => current && { ...current, inbox, bands });
      announceInboxChange();
      // The band page plays the new member's welcome.
      if (choice === "accept" && request.type === 1 && request.band.slug) return router.push(routes.band(request.band.slug));
      if (choice === "accept") {
        setNotice({
          tone: "success",
          text: request.type === 1 ? `You joined ${request.band.name}.` : `${request.musician.name} joined ${request.band.name}.`,
        });
      }
    } catch (failure) {
      setNotice({ tone: "error", text: apiErrorMessage(failure) });
      // The request may have been answered elsewhere; show what's true now.
      getInbox().then((inbox) => setData((current) => current && { ...current, inbox }), () => undefined);
    } finally {
      setBusy(null);
    }
  }, [router]);

  if (error) {
    return (
      <main className={`${page.page} ${styles.page}`}>
        <div role="alert" className="alert alert-error">
          We couldn&apos;t load your dashboard. {error}{" "}
          <button type="button" className="link-button" onClick={() => setAttempt((count) => count + 1)}>
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={`${page.page} ${styles.page}`} aria-busy="true">
        <span className="muted">Loading…</span>
      </main>
    );
  }

  const { user, profile, inbox, bands } = data;
  const incoming = [...inbox.invitations_received, ...inbox.join_requests_received].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const sent = [...inbox.invitations_sent, ...inbox.join_requests_sent].sort((a, b) => b.created_at.localeCompare(a.created_at));
  const firstName = user.name.trim().split(/\s+/)[0];

  return (
    <main className={`${page.page} ${styles.page}`}>
      <div className={page.head}>
        <h1 className={`display ${page.title}`}>Hi, {firstName}</h1>
        <div className={page.headActions}>
          <Link className="btn btn-secondary" href={routes.musicians}>
            Find musicians
          </Link>
          <Link className="btn btn-primary" href={routes.createBand}>
            Create a band
          </Link>
        </div>
      </div>

      {profile.setup_step < 8 && (
        <div className="alert">
          Your profile is {profile.profile_completion}% complete.{" "}
          <Link href={profileDestination(profile)}>Finish it</Link> so bands can find you.
        </div>
      )}

      {notice && (
        <div role="status" className={`alert ${notice.tone === "success" ? "alert-success" : "alert-error"}`}>
          {notice.text}
        </div>
      )}

      <section className={styles.section} aria-labelledby="waiting">
        <div className={styles.sectionHead}>
          <h2 id="waiting" className={styles.sectionTitle}>
            Waiting for you
          </h2>
          {incoming.length > 0 && <span className={styles.count}>{incoming.length}</span>}
        </div>
        <div className="card">
          {incoming.length ? (
            <ul className={styles.list}>
              {incoming.map((request) => (
                <IncomingRow key={request.id} request={request} busy={busy === request.id} onAnswer={(choice) => answer(request, choice)} />
              ))}
            </ul>
          ) : (
            <p className={styles.empty}>No invitations or join requests right now.</p>
          )}
        </div>
      </section>

      <section className={styles.section} aria-labelledby="bands">
        <div className={styles.sectionHead}>
          <h2 id="bands" className={styles.sectionTitle}>
            My bands
          </h2>
        </div>
        {bands.length ? (
          <div className={styles.bandGrid}>
            {bands.map((band) => (
              <Link key={band.id} href={band.slug ? routes.bandDashboard(band.slug) : routes.createBand} className={`card ${styles.band}`}>
                <Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={44} shape="square" photoUrl={band.logo_url} />
                <span className={styles.bandText}>
                  <span className={styles.bandName}>{band.name}</span>
                  <span className={styles.bandMeta}>
                    {band.is_draft ? (
                      <span className="chip chip-amber">Draft</span>
                    ) : (
                      <span className={`chip ${band.is_owner ? "chip-violet" : ""}`}>{band.is_owner ? "Owner" : "Member"}</span>
                    )}
                    {band.member_count} {band.member_count === 1 ? "member" : "members"}
                    {band.open_role_count > 0 && ` · ${band.open_role_count} open`}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`card ${styles.empty}`}>
            You&apos;re not in a band yet. <Link href={routes.bands}>Find a band</Link> or <Link href={routes.createBand}>create one</Link>.
          </div>
        )}
      </section>

      {sent.length > 0 && (
        <section className={styles.section} aria-labelledby="sent">
          <div className={styles.sectionHead}>
            <h2 id="sent" className={styles.sectionTitle}>
              Sent
            </h2>
          </div>
          <div className="card">
            <ul className={styles.list}>
              {sent.map((request) => (
                <SentRow key={request.id} request={request} busy={busy === request.id} onWithdraw={() => answer(request, "cancel")} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
