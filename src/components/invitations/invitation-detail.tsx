import Link from "next/link";
import styles from "@/components/invitations/invitations.module.css";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/lib/routes";
import type { ReceivedInvitation } from "@/types/invitation";

/** The open invitation: who is asking, for which role, and the accept / decline decision. */
export function InvitationDetail({ invitation }: { invitation: ReceivedInvitation }): React.JSX.Element {
  const facts = [
    { label: "Role offered", value: invitation.role, highlight: true },
    { label: "Rehearsals", value: invitation.rehearsals, highlight: false },
    { label: "Expires", value: invitation.expires, highlight: false },
  ];

  return (
    <section className={`card ${styles.detail}`} aria-label={`Invitation from ${invitation.band}`}>
      <div className={styles.detailBody}>
        <div className={styles.detailHead}>
          <Avatar
            initials={invitation.monogram}
            tone={invitation.tone}
            size={88}
            shape="square"
            className={`display ${styles.detailAvatar}`}
          />
          <div className={styles.detailTitle}>
            <h2 className={`display ${styles.bandName}`}>{invitation.band}</h2>
            <span className="muted">
              {invitation.genre} · {invitation.city} · {invitation.bandType}
            </span>
          </div>
          <Link className="btn btn-secondary btn-sm" href={routes.band(invitation.bandSlug)}>
            View band profile
          </Link>
        </div>

        <div className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={`inset ${styles.fact}`}>
              <div className={`muted ${styles.factLabel}`}>{fact.label}</div>
              <strong className={fact.highlight ? styles.role : undefined}>{fact.value}</strong>
            </div>
          ))}
        </div>

        <div className={styles.message}>
          <Avatar initials={invitation.owner.initials} tone={invitation.owner.tone} size={40} />
          <div className={styles.bubble}>
            <div className={styles.bubbleHead}>
              <strong>{invitation.owner.name}</strong> <span className="muted">· Band owner · {invitation.sent}</span>
            </div>
            <p className={styles.bubbleText}>{invitation.message}</p>
          </div>
        </div>

        <div className={styles.members}>
          <span className="label">Current members</span>
          <div className={styles.memberChips}>
            {invitation.members.map((member) => (
              <Link key={member.slug} href={routes.musician(member.slug)} className={`chip ${styles.memberChip}`}>
                <Avatar initials={member.initials} tone={member.tone} size={28} />
                {member.name} · <span className="muted">{member.role}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.decision}>
          <p className={`muted ${styles.decisionNote}`}>Accepting shares your email with members. Your phone stays hidden.</p>
          <button type="button" className="btn btn-secondary">
            Decline
          </button>
          <button type="button" className="btn btn-primary">
            Accept invitation
          </button>
        </div>
      </div>
    </section>
  );
}
