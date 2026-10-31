import Link from "next/link";
import styles from "@/components/bands/bands.module.css";
import { SentInvitationRow } from "@/components/bands/sent-invitation-row";
import { Avatar } from "@/components/ui/avatar";
import { bandStatusOptions } from "@/demo-data/band-manage";
import { routes } from "@/lib/routes";
import { chipClass } from "@/lib/tones";
import type { ManagedBand } from "@/types/band";

/** Settings sections, linked from the sidebar by anchor. */
export const manageSections = [
  { id: "members", label: "Members" },
  { id: "requests", label: "Join requests" },
  { id: "invites", label: "Sent invitations" },
  { id: "details", label: "Band details" },
  { id: "danger", label: "Danger zone" },
];

export function MembersSection({ band }: { band: ManagedBand }): React.JSX.Element {
  return (
    <section id="members" className="card panel">
      <div className={styles.sectionHead}>
        <h2 className="panel-title">Members ({band.members.length})</h2>
        <span className={`muted ${styles.small}`}>Open roles: {band.openRoles.join(", ")}</span>
      </div>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Musician</th>
              <th scope="col">Role in band</th>
              <th scope="col">Permission</th>
              <th scope="col">Joined</th>
              <th scope="col" className={styles.alignEnd}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {band.members.map((member) => (
              <tr key={member.slug}>
                <td>
                  <div className={styles.memberCell}>
                    <Avatar initials={member.initials} tone={member.tone} size={40} />
                    <Link href={routes.musician(member.slug)} className={styles.personLink}>
                      {member.name}
                    </Link>
                  </div>
                </td>
                <td>
                  <select className={`input ${styles.roleSelect}`} aria-label={`Role for ${member.name}`} defaultValue={member.role}>
                    <option>{member.role}</option>
                    <option>Backing vocals</option>
                  </select>
                </td>
                <td>
                  <span className={`chip ${chipClass(member.permission.tone)}`}>{member.permission.label}</span>
                </td>
                <td className="muted">{member.joined}</td>
                <td className={styles.alignEnd}>
                  {member.isOwner ? (
                    <span className={`muted ${styles.small}`}>Can&apos;t remove owner</span>
                  ) : (
                    <button type="button" className="btn btn-danger btn-sm">
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function JoinRequestsSection({ band }: { band: ManagedBand }): React.JSX.Element {
  return (
    <section id="requests" className="card panel">
      <h2 className="panel-title">Join requests</h2>
      <div>
        {band.joinRequests.map((request) => (
          <div key={request.slug} className={styles.request}>
            <Avatar initials={request.initials} tone={request.tone} size={44} />
            <div className={styles.requestText}>
              <div>
                <Link href={routes.musician(request.slug)} className={styles.personLink}>
                  {request.name}
                </Link>{" "}
                <span className="muted">wants to join as</span> <strong className={styles.requestRole}>{request.role}</strong>
              </div>
              <div className={`muted ${styles.small} ${styles.requestNote}`}>
                “{request.note}” · {request.when}
              </div>
            </div>
            <div className={styles.buttonPair}>
              <button type="button" className="btn btn-secondary btn-sm">
                Decline
              </button>
              <button type="button" className="btn btn-primary btn-sm">
                Accept
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function SentInvitationsSection({ band }: { band: ManagedBand }): React.JSX.Element {
  return (
    <section id="invites" className="card panel">
      <div className={styles.sectionHead}>
        <h2 className="panel-title">Sent invitations</h2>
        <Link className="btn btn-secondary btn-sm" href={routes.musicians}>
          + Invite
        </Link>
      </div>
      {band.sentInvitations.map((invitation) => (
        <SentInvitationRow key={`${invitation.slug}-${invitation.role}`} invitation={invitation} />
      ))}
    </section>
  );
}

export function BandDetailsSection({ band }: { band: ManagedBand }): React.JSX.Element {
  return (
    <section id="details" className="card panel">
      <h2 className="panel-title">Band details</h2>
      <div className="field-row">
        <label className="field">
          <span className="label">Band name</span>
          <input className="input" name="name" defaultValue={band.name} />
        </label>
        <label className="field">
          <span className="label">Genre</span>
          <select className="input" name="genre" defaultValue={band.details.genre}>
            <option>{band.details.genre}</option>
          </select>
        </label>
        <label className="field">
          <span className="label">City / area</span>
          <select className="input" name="area" defaultValue={band.details.area}>
            <option>{band.details.area}</option>
          </select>
        </label>
        <label className="field">
          <span className="label">Status</span>
          <select className="input" name="status" defaultValue={band.details.status}>
            {bandStatusOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
      </div>
      <label className="field">
        <span className="label">Description</span>
        <textarea className="input" name="description" rows={3} defaultValue={band.details.description} />
      </label>
      <div className={styles.actionsEnd}>
        <span className={`muted ${styles.small}`}>Unsaved changes</span>
        <button type="button" className="btn btn-secondary">
          Discard
        </button>
        <button type="button" className="btn btn-primary">
          Save changes
        </button>
      </div>
    </section>
  );
}

export function DangerZoneSection({ band }: { band: ManagedBand }): React.JSX.Element {
  return (
    <section id="danger" className={`card panel ${styles.dangerZone}`}>
      <div>
        <h2 className={`panel-title ${styles.dangerTitle}`}>Delete band</h2>
        <p className={`muted ${styles.dangerText}`}>
          Removes the band profile, cancels pending invites and notifies all members. This can&apos;t be undone.
        </p>
      </div>
      <button type="button" className="btn btn-danger">
        Delete {band.name}
      </button>
    </section>
  );
}
