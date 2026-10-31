import styles from "@/components/bands/bands.module.css";
import { Avatar } from "@/components/ui/avatar";
import { chipClass } from "@/lib/tones";
import type { SentInvitation } from "@/types/band";

/** An invitation the band has sent, with its status and the follow-up action that status allows. */
export function SentInvitationRow({ invitation, metaApart = false }: { invitation: SentInvitation; metaApart?: boolean }): React.JSX.Element {
  return (
    <div className={`inset ${styles.inviteRow}`}>
      <Avatar initials={invitation.initials} tone={invitation.tone} size={36} />
      <span className={styles.inviteText}>
        <strong>{invitation.name}</strong>{" "}
        <span className="muted">
          · {invitation.role}
          {!metaApart && ` · ${invitation.meta}`}
        </span>
      </span>
      <span className={`chip ${chipClass(invitation.status.tone)}`}>{invitation.status.label}</span>
      {metaApart ? (
        <span className={`muted ${styles.small} ${styles.inviteMeta}`}>{invitation.meta}</span>
      ) : (
        <button type="button" className="btn btn-ghost btn-sm">
          {invitation.action}
        </button>
      )}
    </div>
  );
}
