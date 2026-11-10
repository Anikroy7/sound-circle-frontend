"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/components/band-dashboard/band-dashboard.module.css";
import { Popover } from "@/components/band-dashboard/popover";
import bands from "@/components/bands/bands.module.css";
import { MembersEditor } from "@/components/bands/members-editor";
import { EditorDialog } from "@/components/profile/editor-dialog";
import { Avatar } from "@/components/ui/avatar";
import { apiErrorMessage, leaveBand, removeBandMember } from "@/lib/api";
import { formatDate } from "@/lib/band-chemistry";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import type { Band, BandMember } from "@/types/band-api";

interface MembersViewProps {
  band: Band;
  onBand: (band: Band) => void;
}

/** Everyone in the band, searchable. The owner adds and removes members; a member can leave. */
export function MembersView({ band, onBand }: MembersViewProps): React.JSX.Element {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirm, setConfirm] = useState<{ kind: "remove"; member: BandMember } | { kind: "leave" } | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const text = query.trim().toLowerCase();
  const shown = band.members.filter(
    (member) => !text || member.name.toLowerCase().includes(text) || (member.instrument?.name ?? member.position ?? "").toLowerCase().includes(text),
  );

  const run = async (): Promise<void> => {
    if (!confirm) return;
    setPending(true);
    setError(null);
    try {
      if (confirm.kind === "remove") {
        onBand(await removeBandMember(band.id, confirm.member.id));
        setConfirm(null);
      } else {
        await leaveBand(band.id);
        router.push(routes.dashboard);
      }
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      setPending(false);
    }
  };

  return (
    <>
      <section className={`card ${styles.block}`} aria-labelledby="members-title">
        <div className={styles.blockHead}>
          <div>
            <h2 id="members-title" className={styles.blockTitle}>
              Band Members
            </h2>
            <p className={styles.blockLead}>Everyone playing in {band.name}.</p>
          </div>
          {band.is_owner && (
            <div className={styles.blockActions}>
              <button type="button" className="btn btn-secondary" onClick={() => setEditing(true)}>
                Edit line-up
              </button>
              <Link className="btn btn-primary" href={routes.musicians}>
                Invite Members
              </Link>
            </div>
          )}
        </div>

        <input className="input" type="search" placeholder="Search members" aria-label="Search members" value={query} onChange={(event) => setQuery(event.target.value)} />

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th className={styles.hideSmall}>Instrument</th>
                <th>Role</th>
                <th className={styles.hideSmall}>Joined at</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {shown.map((member) => {
                const you = member.id === band.viewer.member_id;
                return (
                  <tr key={member.id}>
                    <td>
                      <span className={styles.person}>
                        <Avatar initials={initialsOf(member.name)} tone={member.user_id ? toneFor(member.user_id) : "slate"} size={40} photoUrl={member.photo_url} />
                        {member.profile_slug ? <Link href={routes.musician(member.profile_slug)}>{member.name}</Link> : <strong>{member.name}</strong>}
                        {you && <span className={`chip ${styles.youTag}`}>You</span>}
                      </span>
                    </td>
                    <td className={`${styles.muted} ${styles.hideSmall}`}>{member.instrument?.name ?? member.position ?? "—"}</td>
                    <td>
                      {member.is_owner ? (
                        <span className={`chip chip-violet ${styles.chipTight}`}>Owner</span>
                      ) : (
                        <span className={`chip chip-teal ${styles.chipTight}`}>Member</span>
                      )}
                    </td>
                    <td className={`${styles.muted} ${styles.hideSmall}`}>{formatDate(member.joined_at)}</td>
                    <td>
                      <div className={styles.rowActions}>
                        <Popover
                          align="right"
                          trigger={(props) => (
                            <button type="button" className={styles.dots} aria-label={`Actions for ${member.name}`} {...props}>
                              ⋯
                            </button>
                          )}
                        >
                          {(close) => (
                            <>
                              {member.profile_slug && (
                                <li role="none">
                                  <Link role="menuitem" className={styles.menuItem} href={routes.musician(member.profile_slug)} onClick={close}>
                                    View profile
                                  </Link>
                                </li>
                              )}
                              {band.slug && (
                                <li role="none">
                                  <Link role="menuitem" className={styles.menuItem} href={routes.membershipCard(band.slug, member.id)} onClick={close}>
                                    Membership card
                                  </Link>
                                </li>
                              )}
                              {band.is_owner && !member.is_owner && (
                                <li role="none">
                                  <button
                                    type="button"
                                    role="menuitem"
                                    className={`${styles.menuItem} ${styles.menuDanger}`}
                                    onClick={() => {
                                      close();
                                      setConfirm({ kind: "remove", member });
                                    }}
                                  >
                                    Remove from band
                                  </button>
                                </li>
                              )}
                            </>
                          )}
                        </Popover>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!shown.length && <p className={styles.noData}>No members match “{query}”.</p>}
        </div>
      </section>

      {!band.is_owner && (
        <section className={`card ${styles.danger}`}>
          <span>
            <strong>Leave {band.name}</strong>
            <span className={`${styles.blockLead} ${styles.muted}`}> — you can be invited back later.</span>
          </span>
          <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirm({ kind: "leave" })}>
            Leave band
          </button>
        </section>
      )}

      {editing && (
        <EditorDialog id="edit-line-up" title="Edit line-up" lead="Add or remove members directly." pending={false} onClose={() => setEditing(false)}>
          <MembersEditor band={band} onBand={onBand} />
          <div className={bands.actionsEnd}>
            <button type="button" className="btn btn-primary" onClick={() => setEditing(false)}>
              Done
            </button>
          </div>
        </EditorDialog>
      )}

      {confirm && (
        <EditorDialog
          id="confirm"
          title={confirm.kind === "remove" ? `Remove ${confirm.member.name}?` : `Leave ${band.name}?`}
          lead={confirm.kind === "remove" ? "They'll no longer be in the band's line-up." : "You'll no longer be in the band's line-up."}
          pending={pending}
          onClose={() => {
            setConfirm(null);
            setError(null);
          }}
        >
          {error && (
            <div role="alert" className="alert alert-error">
              {error}
            </div>
          )}
          <div className={styles.confirmActions}>
            <button type="button" className="btn btn-secondary" disabled={pending} onClick={() => setConfirm(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" disabled={pending} onClick={run}>
              {confirm.kind === "remove" ? "Remove" : "Leave band"}
            </button>
          </div>
        </EditorDialog>
      )}
    </>
  );
}
