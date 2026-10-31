import type { Metadata } from "next";
import Link from "next/link";
import { BandInvitations } from "@/components/dashboard/band-invitations";
import styles from "@/components/dashboard/dashboard.module.css";
import { MyBands } from "@/components/dashboard/my-bands";
import { OverviewTiles } from "@/components/dashboard/overview-tiles";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import { dashboard } from "@/demo-data/dashboard";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "My dashboard" };

export default function DashboardPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.dashboard} viewer={currentViewer} />
      <main className={page.page}>
        <div className={page.head}>
          <div className={page.titleGroup}>
            <h1 className={`display ${page.title}`}>{dashboard.greeting}</h1>
            <p className="muted">{dashboard.summary}</p>
          </div>
          <div className={page.headActions}>
            <Link className="btn btn-secondary" href={routes.musician(currentViewer.slug)}>
              View my public profile
            </Link>
            <Link className="btn btn-primary" href={routes.createBand}>
              Create a Band
            </Link>
          </div>
        </div>

        <OverviewTiles data={dashboard} />
        <BandInvitations incoming={dashboard.incoming} outgoing={dashboard.outgoing} />
        <MyBands owned={dashboard.ownedBands} member={dashboard.memberBands} />

        <section className={styles.suggestions}>
          <div className={styles.suggestionHead}>
            <div>
              <h2 className={`panel-title ${styles.suggestionTitle}`}>Suggested for {dashboard.suggestionsFor}</h2>
              <p className="muted">{dashboard.suggestionsLead}</p>
            </div>
            <Link href={routes.musicians} className={styles.addLink}>
              See more →
            </Link>
          </div>
          <div className={styles.suggestionGrid}>
            {dashboard.suggested.map((musician) => (
              <div key={musician.slug} className={`card ${styles.suggestion}`}>
                <div className={styles.person}>
                  <Avatar initials={musician.initials} tone={musician.tone} size={48} />
                  <div>
                    <strong>{musician.name}</strong>
                    <div className={styles.personRole}>{musician.role}</div>
                    <div className={`muted ${styles.small}`}>{musician.city}</div>
                  </div>
                </div>
                <span className={`muted ${styles.small}`}>{musician.why}</span>
                <div className={styles.cardActions}>
                  <Link className="btn btn-secondary btn-sm" href={routes.musician(musician.slug)}>
                    View Profile
                  </Link>
                  <Link className="btn btn-primary btn-sm" href={routes.createBandStep.invite}>
                    Invite
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
