import type { Metadata } from "next";
import { InvitationDetail } from "@/components/invitations/invitation-detail";
import styles from "@/components/invitations/invitations.module.css";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import { invitationCounts, receivedInvitations } from "@/demo-data/invitations";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";
import { chipClass } from "@/lib/tones";

export const metadata: Metadata = { title: "Invitations" };

/** Static demo: the first received invitation is open. Selecting another, and the decline dialog, need client state. */
export default function InvitationsPage(): React.JSX.Element {
  const selected = receivedInvitations[0];

  return (
    <>
      <SiteHeader activeHref={routes.invitations} viewer={currentViewer} />
      <main className={page.page}>
        <div className={page.titleGroup}>
          <h1 className={`display ${page.title}`}>Invitations</h1>
          <p className="muted">Review band invites. Accepting adds you to the band&apos;s roster and shares your email with members.</p>
        </div>

        <div className={page.split}>
          <section className={`card ${styles.list}`} aria-label="Invitation list">
            <div className={styles.listTabs}>
              <button type="button" className="btn btn-primary btn-sm" aria-pressed="true">
                Received ({invitationCounts.received})
              </button>
              <button type="button" className="btn btn-secondary btn-sm" aria-pressed="false">
                Sent ({invitationCounts.sent})
              </button>
            </div>
            {receivedInvitations.map((invitation) => (
              <button
                key={invitation.id}
                type="button"
                className={styles.item}
                aria-current={invitation.id === selected.id ? "true" : undefined}
              >
                <Avatar initials={invitation.monogram} tone={invitation.tone} size={48} shape="square" />
                <span className={styles.itemText}>
                  <strong>{invitation.band}</strong>
                  <span className={`muted ${styles.small}`}>
                    {invitation.role} · {invitation.city}
                  </span>
                </span>
                <span className={`chip ${chipClass(invitation.status.tone)} ${styles.itemChip}`}>{invitation.status.label}</span>
              </button>
            ))}
          </section>

          <InvitationDetail invitation={selected} />
        </div>
      </main>
    </>
  );
}
