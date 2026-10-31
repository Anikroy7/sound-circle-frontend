import type { Metadata } from "next";
import Link from "next/link";
import {
  BandDetailsSection,
  DangerZoneSection,
  JoinRequestsSection,
  manageSections,
  MembersSection,
  SentInvitationsSection,
} from "@/components/bands/band-manage";
import styles from "@/components/bands/bands.module.css";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import { managedBand } from "@/demo-data/band-manage";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: `Manage ${managedBand.name}` };

export function generateStaticParams(): { slug: string }[] {
  return [{ slug: managedBand.slug }];
}

/**
 * The owner's view of their band. Demo: every slug renders the band in `demo-data`. The remove-member
 * confirmation and undo toast from the design need client state and are not built yet.
 */
export default function ManageBandPage(): React.JSX.Element {
  const band = managedBand;

  return (
    <>
      <SiteHeader activeHref={routes.dashboard} viewer={currentViewer} />
      <main className={page.page}>
        <div className={styles.manageHead}>
          <Avatar initials={band.monogram} tone={band.tone} size={72} shape="square" className="display" />
          <div className={styles.manageTitleGroup}>
            <Link href={routes.dashboard} className={styles.small}>
              ← My Dashboard
            </Link>
            <h1 className={`display ${styles.manageTitle}`}>
              {band.name} <span className={`chip chip-violet ${styles.ownerChip}`}>You&apos;re the owner</span>
            </h1>
          </div>
          <div className={page.headActions}>
            <Link className="btn btn-secondary" href={routes.band(band.slug)}>
              View public profile
            </Link>
            <Link className="btn btn-primary" href={routes.musicians}>
              Invite new members
            </Link>
          </div>
        </div>

        <div className={page.split}>
          <nav aria-label="Band settings" className={styles.settingsNav}>
            {manageSections.map((section, index) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`${styles.settingsLink} ${index === 0 ? styles.settingsLinkActive : ""} ${
                  section.id === "danger" ? styles.settingsDanger : ""
                }`}
              >
                {section.label}
                {section.id === "requests" && (
                  <span className={`chip chip-amber ${styles.countChip}`}>{band.joinRequests.length}</span>
                )}
              </a>
            ))}
          </nav>
          <div className={styles.manageMain}>
            <MembersSection band={band} />
            <JoinRequestsSection band={band} />
            <SentInvitationsSection band={band} />
            <BandDetailsSection band={band} />
            <DangerZoneSection band={band} />
          </div>
        </div>
      </main>
    </>
  );
}
