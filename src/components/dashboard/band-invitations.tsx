import Link from "next/link";
import styles from "@/components/dashboard/dashboard.module.css";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/lib/routes";
import type { IncomingInvite, OutgoingInvite } from "@/types/dashboard";

interface BandInvitationsProps {
  incoming: IncomingInvite[];
  outgoing: OutgoingInvite[];
}

/** Incoming invites are shown; the Sent tab's rows (`outgoing`) need client state to switch to. */
export function BandInvitations({ incoming, outgoing }: BandInvitationsProps): React.JSX.Element {
  const tabs = [
    { label: `Incoming (${incoming.length})`, selected: true },
    { label: `Sent (${outgoing.length})`, selected: false },
  ];

  return (
    <section className={`card panel ${styles.inviteSection}`}>
      <div className={styles.head}>
        <h2 className={`panel-title ${styles.title}`}>Band invitations</h2>
        <div role="tablist" aria-label="Invitation direction" className={styles.tabs}>
          {tabs.map((tab) => (
            <button key={tab.label} type="button" role="tab" aria-selected={tab.selected} className={styles.tab}>
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {incoming.map((invite) => (
        <div key={invite.band} className={styles.row}>
          <Avatar initials={invite.monogram} tone={invite.tone} size={48} shape="square" />
          <div className={styles.rowText}>
            <strong>{invite.band}</strong> <span className="muted">invited you as</span>{" "}
            <strong className={styles.role}>{invite.role}</strong>
            <div className={`muted ${styles.small}`}>{invite.meta}</div>
          </div>
          <span className="chip chip-amber">Pending · {invite.expires}</span>
          <div className={styles.rowActions}>
            <Link className="btn btn-secondary btn-sm" href={routes.invitations}>
              Decline
            </Link>
            <Link className="btn btn-primary btn-sm" href={routes.invitations}>
              Review &amp; accept
            </Link>
          </div>
        </div>
      ))}
    </section>
  );
}
