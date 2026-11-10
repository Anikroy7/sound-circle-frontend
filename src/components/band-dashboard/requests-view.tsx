"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/band-dashboard/band-dashboard.module.css";
import { announceInboxChange, RequestStatusChip } from "@/components/requests/request-status";
import { Avatar } from "@/components/ui/avatar";
import { answerRequest, apiErrorMessage } from "@/lib/api";
import { formatDate } from "@/lib/band-chemistry";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import type { MembershipRequest, RequestAnswer } from "@/types/discovery";

function Musician({ request }: { request: MembershipRequest }): React.JSX.Element {
  return (
    <span className={styles.person}>
      <Avatar initials={initialsOf(request.musician.name)} tone={toneFor(request.musician.user_id)} size={36} photoUrl={request.musician.photo_url} />
      {request.musician.slug ? <Link href={routes.musician(request.musician.slug)}>{request.musician.name}</Link> : <strong>{request.musician.name}</strong>}
    </span>
  );
}

interface RequestsViewProps {
  joinRequests: MembershipRequest[];
  invitations: MembershipRequest[];
  /** After an answer: reload the dashboard (members, positions and milestones may all have changed). */
  onChanged: (notice: string | null) => Promise<void>;
}

/** The owner's queues: join requests to answer, and the invitations the band has sent. */
export function RequestsView({ joinRequests, invitations, onChanged }: RequestsViewProps): React.JSX.Element {
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const answer = async (request: MembershipRequest, choice: RequestAnswer): Promise<void> => {
    setBusy(request.id);
    setError(null);
    try {
      await answerRequest(request.id, choice);
      announceInboxChange();
      await onChanged(choice === "accept" ? `${request.musician.name} joined the band.` : null);
    } catch (failure) {
      setError(apiErrorMessage(failure));
      await onChanged(null);
    } finally {
      setBusy(null);
    }
  };

  const text = query.trim().toLowerCase();
  const shownInvites = invitations.filter((request) => !text || request.musician.name.toLowerCase().includes(text));

  return (
    <>
      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}

      <section className={`card ${styles.block}`} aria-labelledby="join-title">
        <div>
          <h2 id="join-title" className={styles.blockTitle}>
            Join Requests
          </h2>
          <p className={styles.blockLead}>Musicians asking to fill your open positions. Review their profile, then decide.</p>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Musician</th>
                <th>Position</th>
                <th className={styles.hideSmall}>Message</th>
                <th className={styles.hideSmall}>Sent</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {joinRequests.map((request) => (
                <tr key={request.id}>
                  <td>
                    <Musician request={request} />
                  </td>
                  <td className={styles.muted}>{request.role?.name ?? "—"}</td>
                  <td className={`${styles.message} ${styles.hideSmall}`}>{request.message ?? "—"}</td>
                  <td className={`${styles.muted} ${styles.hideSmall}`}>{formatDate(request.created_at)}</td>
                  <td>
                    <div className={styles.rowActions}>
                      <button type="button" className="btn btn-secondary btn-sm" disabled={busy === request.id} onClick={() => answer(request, "decline")}>
                        Reject
                      </button>
                      <button type="button" className="btn btn-primary btn-sm" disabled={busy === request.id} onClick={() => answer(request, "accept")}>
                        Accept
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!joinRequests.length && <p className={styles.noData}>No join requests right now.</p>}
        </div>
      </section>

      <section className={`card ${styles.block}`} aria-labelledby="invites-title">
        <div>
          <h2 id="invites-title" className={styles.blockTitle}>
            Invitations
          </h2>
          <p className={styles.blockLead}>Invitations your band has sent.</p>
        </div>
        <input className="input" type="search" placeholder="Search invitations" aria-label="Search invitations" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Musician</th>
                <th>Role</th>
                <th className={styles.hideSmall}>Invited at</th>
                <th className={styles.hideSmall}>Expires at</th>
                <th>Status</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shownInvites.map((request) => (
                <tr key={request.id}>
                  <td>
                    <Musician request={request} />
                  </td>
                  <td className={styles.muted}>{request.role?.name ?? "—"}</td>
                  <td className={`${styles.muted} ${styles.hideSmall}`}>{formatDate(request.created_at)}</td>
                  <td className={`${styles.muted} ${styles.hideSmall}`}>{request.status === 1 ? formatDate(request.expires_at) : "—"}</td>
                  <td>
                    <RequestStatusChip status={request.status} className={styles.chipTight} />
                  </td>
                  <td>
                    <div className={styles.rowActions}>
                      {request.status === 1 && (
                        <button type="button" className="btn btn-ghost btn-sm" disabled={busy === request.id} onClick={() => answer(request, "cancel")}>
                          Withdraw
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!shownInvites.length && <p className={styles.noData}>{invitations.length ? `No invitations match “${query}”.` : "No invitations yet."}</p>}
        </div>
      </section>
    </>
  );
}
