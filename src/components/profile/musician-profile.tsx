import Link from "next/link";
import page from "@/components/layout/page.module.css";
import { TrackRow, VideoGrid } from "@/components/profile/media";
import { ProfileCover, ProfileHero } from "@/components/profile/profile-hero";
import styles from "@/components/profile/profile.module.css";
import { Avatar } from "@/components/ui/avatar";
import { LockIcon } from "@/components/ui/icons";
import { routes } from "@/lib/routes";
import { chipClass, tones } from "@/lib/tones";
import type { MusicianProfile } from "@/types/musician";

const SKILL_STEPS = [1, 2, 3, 4];

/** Only the Overview tab is designed; Portfolio and Bands & gigs are placeholders. */
const tabs = ["Overview", "Portfolio", "Bands & gigs"];

export function MusicianProfileView({ musician }: { musician: MusicianProfile }): React.JSX.Element {
  return (
    <>
      <ProfileCover tone={musician.tone} caption={musician.coverCaption} className={styles.musicianCover} />
      <main className={styles.body}>
        <nav aria-label="Breadcrumb" className={`muted ${styles.breadcrumb}`}>
          <Link href={routes.musicians}>Discover</Link> / Drummers / {musician.name}
        </nav>
        <ProfileHero
          initials={musician.initials}
          tone={musician.tone}
          avatarSize={168}
          avatarVariant="tinted"
          name={musician.name}
          status={<span className={`chip ${chipClass(musician.status.tone)}`}>{musician.status.label}</span>}
          details={
            <div className={styles.metaRow}>
              <span className={styles.instrument}>{musician.instruments}</span>
              {musician.facts.map((fact) => (
                <span key={fact} className="muted">
                  {fact}
                </span>
              ))}
            </div>
          }
          actions={
            <>
              <a className="btn btn-secondary" href="#contact">
                Contact
              </a>
              <Link className="btn btn-primary" href={routes.createBandStep.invite}>
                Invite to Band
              </Link>
            </>
          }
          overlap={96}
        />

        <div role="tablist" aria-label="Profile sections" className={styles.tabs}>
          {tabs.map((tab, index) => (
            <button key={tab} type="button" role="tab" aria-selected={index === 0} className={styles.tab}>
              {tab}
            </button>
          ))}
        </div>

        <div className={page.split}>
          <div className={page.main}>
            <section className="card panel">
              <h2 className="panel-title">About</h2>
              <p className={styles.prose}>{musician.about}</p>
              <div className={styles.factGrid}>
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Genres</span>
                  <div className={styles.chipRow}>
                    {musician.genres.map((genre) => (
                      <span key={genre} className="chip">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Skill level</span>
                  <div className={styles.skillMeter} role="img" aria-label={`${musician.skillLabel}, ${musician.skillLevel} of 4`}>
                    {SKILL_STEPS.map((step) => (
                      <span key={step} className={step <= musician.skillLevel ? styles.skillOn : undefined} />
                    ))}
                  </div>
                  <strong>{musician.skillLabel}</strong>
                </div>
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Availability</span>
                  <strong>{musician.availability.when}</strong>
                  <span className={`muted ${styles.small}`}>{musician.availability.note}</span>
                </div>
              </div>
            </section>

            <section className="card panel">
              <h2 className="panel-title">Open to</h2>
              <div className={styles.prefGrid}>
                {musician.openTo.map((item) => (
                  <div key={item.label} className={`${styles.pref} ${item.open ? styles.prefOn : ""}`}>
                    <span className={styles.prefMark} aria-hidden="true">
                      {item.open ? "✓" : "–"}
                    </span>
                    <span>
                      {item.label}
                      {!item.open && <span className="visually-hidden"> (not open)</span>}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="card panel">
              <div className={styles.panelHead}>
                <h2 className="panel-title">Audio samples</h2>
                <span className={`muted ${styles.small}`}>{musician.tracks.length} tracks</span>
              </div>
              {musician.tracks.map((track, index) => (
                <TrackRow key={track.title} track={track} featured={index === 0} wave={{ seed: track.waveSeed, played: track.played }} />
              ))}
            </section>

            <section className="card panel">
              <h2 className="panel-title">Videos</h2>
              <VideoGrid videos={musician.videos} />
            </section>

            <section className="card panel">
              <h2 className="panel-title">Performance photos</h2>
              <div className={styles.photoGrid}>
                {musician.photos.map((photo) => (
                  <div key={photo.caption} className={`photo-placeholder ${styles.photo}`} style={{ backgroundColor: tones[photo.tone].tint }}>
                    {photo.caption}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className={page.aside}>
            <section id="contact" className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Contact</h2>
              <dl className={styles.definitionList}>
                {musician.contact.map((item, index) => (
                  <div key={item.label}>
                    <dt className="muted">{item.label}</dt>
                    {/* The first channel is open; the rest are gated by the privacy settings. */}
                    <dd className={index === 0 ? styles.contactOpen : styles.contactGated}>
                      {index > 0 && <LockIcon />}
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
              <p className={`muted inset ${styles.contactNote}`}>{musician.contactNote}</p>
              <button type="button" className="btn btn-secondary btn-block">
                Send a message
              </button>
              <Link className="btn btn-primary btn-block" href={routes.createBandStep.invite}>
                Invite to Band
              </Link>
            </section>

            <section className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Bands</h2>
              {musician.pastBands.map((band) => (
                <div key={band.name} className={styles.pastBand}>
                  <Avatar initials={band.monogram} tone={band.tone} size={44} shape="square" />
                  <span>
                    <strong>{band.name}</strong>
                    <span className={`muted ${styles.small} ${styles.block}`}>
                      {band.meta}
                    </span>
                  </span>
                </div>
              ))}
              <div className={`muted ${styles.emptyNote}`}>Not in an active band right now.</div>
            </section>

            <section className={`card panel ${styles.asideCard}`}>
              <h2 className="panel-title panel-title-sm">Past performances</h2>
              <ul className={styles.showList}>
                {musician.gigs.map((gig) => (
                  <li key={gig.event} className={styles.datedShow}>
                    <span className={`display ${styles.dateBadge}`}>
                      <span className={styles.dateMonth}>{gig.month}</span>
                      <strong>{gig.year}</strong>
                    </span>
                    <span>
                      <strong>{gig.event}</strong>
                      <span className={`muted ${styles.small} ${styles.block}`}>
                        {gig.where}
                      </span>
                    </span>
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
