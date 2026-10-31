import Link from "next/link";
import page from "@/components/layout/page.module.css";
import { TrackRow, VideoGrid } from "@/components/profile/media";
import { ProfileCover, ProfileHero } from "@/components/profile/profile-hero";
import styles from "@/components/profile/profile.module.css";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/lib/routes";
import { chipClass } from "@/lib/tones";
import type { BandProfile } from "@/types/band";

/** The visitor's view of a band. Member and owner views swap the hero actions (see the design's "Preview as"). */
export function BandProfileView({ band }: { band: BandProfile }): React.JSX.Element {
  return (
    <>
      <ProfileCover tone={band.tone} caption={band.coverCaption} className={styles.bandCover} />
      <main className={styles.body}>
        <ProfileHero
          initials={band.monogram}
          tone={band.tone}
          avatarSize={144}
          avatarVariant="solid"
          name={band.name}
          status={<span className={`chip ${chipClass(band.status.tone)}`}>{band.status.label}</span>}
          details={
            <div className={styles.chipRow}>
              {band.tags.map((tag) => (
                <span key={tag} className="chip">
                  {tag}
                </span>
              ))}
            </div>
          }
          actions={
            <>
              <button type="button" className="btn btn-secondary">
                Request to join
              </button>
              <button type="button" className="btn btn-primary" disabled aria-describedby="hiring-soon">
                Hire This Band
              </button>
              <span id="hiring-soon" className={`chip chip-violet ${styles.heroChip}`}>
                Hiring coming soon
              </span>
            </>
          }
          overlap={72}
          className={styles.bandHeroRule}
        />

        <div className={`${page.split} ${styles.bandSplit}`}>
          <div className={page.main}>
            <section className="card panel">
              <h2 className="panel-title">About the band</h2>
              <p className={styles.prose}>{band.about}</p>
            </section>

            <section className="card panel">
              <div className={styles.panelHead}>
                <h2 className="panel-title">Members</h2>
                <span className={`muted ${styles.small}`}>
                  {band.members.length} members · 1 open role
                </span>
              </div>
              <div className={styles.memberGrid}>
                {band.members.map((member) => (
                  <Link key={member.slug} href={routes.musician(member.slug)} className={`inset ${styles.member}`}>
                    <Avatar initials={member.initials} tone={member.tone} size={48} />
                    <span className={styles.memberText}>
                      <strong>{member.name}</strong>
                      <span className={styles.memberRole}>{member.role}</span>
                    </span>
                    {member.isOwner && <span className="chip chip-violet">Owner</span>}
                  </Link>
                ))}
                <div className={styles.openRole}>
                  <span className={styles.openRoleMark} aria-hidden="true">
                    +
                  </span>
                  <span className={styles.memberText}>
                    <strong>{band.openRole.role}</strong>
                    <span className={`muted ${styles.small}`}>Open role · {band.openRole.level}</span>
                  </span>
                </div>
              </div>
            </section>

            <section className="card panel">
              <h2 className="panel-title">Music</h2>
              {band.tracks.map((track) => (
                <TrackRow key={track.title} track={track} />
              ))}
              <VideoGrid videos={band.videos} />
            </section>
          </div>

          <aside className={page.aside}>
            <section className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Availability</h2>
              <dl className={styles.definitionList}>
                {band.availability.map((item) => (
                  <div key={item.label}>
                    <dt className="muted">{item.label}</dt>
                    <dd>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
            <section className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Open to</h2>
              <div className={styles.chipRow}>
                {band.openTo.map((item) => (
                  <span key={item.label} className={`chip ${chipClass(item.tone)}`}>
                    {item.label}
                  </span>
                ))}
              </div>
            </section>
            <section className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Links</h2>
              {band.links.map((link) => (
                <a key={link.label} href="#" className={styles.linkRow}>
                  {link.label} <span className="muted">{link.value}</span>
                </a>
              ))}
            </section>
            <section className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Recent shows</h2>
              <ul className={styles.showList}>
                {band.recentShows.map((show) => (
                  <li key={show.title}>
                    <strong>{show.title}</strong>
                    <div className={`muted ${styles.small}`}>{show.meta}</div>
                  </li>
                ))}
              </ul>
            </section>
          </aside>
        </div>
      </main>
    </>
  );
}
