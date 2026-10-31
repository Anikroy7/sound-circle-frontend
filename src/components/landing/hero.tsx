import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { Equalizer } from "@/components/ui/equalizer";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { Waveform } from "@/components/ui/waveform";
import { nowPlaying, searchAreas, searchInstruments, spotlightCards } from "@/demo-data/hero";
import { routes } from "@/lib/routes";
import { tones } from "@/lib/tones";
import { waveformBars } from "@/lib/waveform";

const NOW_PLAYING_BARS = waveformBars(46, 1.1, 18, 100);

function HeroBackdrop(): React.JSX.Element {
  return (
    <>
      <svg className={styles.heroRings} aria-hidden="true" width="1100" height="1100" viewBox="0 0 1100 1100">
        <circle cx="550" cy="550" r="180" fill="none" stroke="var(--hero-ring-teal)" strokeWidth="1.5" />
        <circle cx="550" cy="550" r="270" fill="none" stroke="var(--hero-ring-teal)" strokeWidth="1.5" />
        <circle cx="550" cy="550" r="360" fill="none" stroke="var(--hero-ring-violet)" strokeWidth="1.5" strokeDasharray="2 10" />
        <circle cx="550" cy="550" r="450" fill="none" stroke="var(--hero-ring)" strokeWidth="1.5" />
        <circle cx="550" cy="550" r="540" fill="none" stroke="var(--hero-ring)" strokeWidth="1.5" strokeDasharray="1 14" />
      </svg>
      <svg className={styles.heroStaff} aria-hidden="true" width="100%" height="120" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0 20H1440M0 40H1440M0 60H1440M0 80H1440M0 100H1440" stroke="var(--hero-staff)" strokeWidth="1" />
      </svg>
    </>
  );
}

/** A GET form, so a search lands on the discovery page as plain query parameters. */
function QuickSearch(): React.JSX.Element {
  return (
    <form className={`card ${styles.search}`} action={routes.musicians} method="get" aria-label="Quick search">
      <label className={styles.searchField}>
        <span className={`label ${styles.searchLabel}`}>I&apos;m looking for a</span>
        <select className={`input ${styles.searchSelect}`} name="instrument" defaultValue={searchInstruments[0].value}>
          {searchInstruments.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <label className={styles.searchField}>
        <span className={`label ${styles.searchLabel}`}>Near</span>
        <select className={`input ${styles.searchSelect}`} name="area" defaultValue={searchAreas[0].value}>
          {searchAreas.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className={`btn btn-primary ${styles.searchSubmit}`}>
        Search
      </button>
    </form>
  );
}

function Vinyl(): React.JSX.Element {
  return (
    <div className={styles.vinyl} aria-hidden="true">
      <div className={styles.vinylDisc}>
        <span className={styles.vinylSheen} />
        <div className={styles.vinylLabel}>
          <span className={`display ${styles.vinylBrand}`}>SoundCircle</span>
          <span className={styles.vinylSide}>SIDE A · DHAKA</span>
          <span className={styles.vinylHole} />
        </div>
      </div>
      <svg className={styles.tonearm} width="150" height="190" viewBox="0 0 150 190">
        <circle cx="122" cy="26" r="18" fill="#232A38" stroke="#3A4458" strokeWidth="2" />
        <path d="M122 26 L98 150 L64 176" stroke="#9AA5B8" strokeWidth="5" fill="none" strokeLinecap="round" />
        <rect x="50" y="166" width="26" height="16" rx="3" fill="#C9D1DE" transform="rotate(-35 63 174)" />
      </svg>
    </div>
  );
}

function NowPlayingCard(): React.JSX.Element {
  const playedBars = Math.round(NOW_PLAYING_BARS.length * nowPlaying.progress);

  return (
    <div className={`card ${styles.nowPlaying}`}>
      <div className={styles.nowPlayingTop}>
        <span className={styles.pulseWrap}>
          <span className={styles.pulse} />
          <button type="button" className={`btn btn-primary btn-round ${styles.pulseButton}`} aria-label="Pause sample">
            <PauseIcon />
          </button>
        </span>
        <div className={styles.nowPlayingText}>
          <span className={`track-label ${styles.nowPlayingLabel}`}>Now playing</span>
          <strong className={styles.nowPlayingTitle}>{nowPlaying.title}</strong>
          <span className={`muted ${styles.smallMeta}`}>{nowPlaying.artist}</span>
        </div>
      </div>
      <Waveform bars={NOW_PLAYING_BARS} color={(index) => (index < playedBars ? "var(--teal)" : "var(--border-accent)")} style={{ height: 30 }} />
      <div className={`muted ${styles.timeRow}`}>
        <span>{nowPlaying.elapsed}</span>
        <span>{nowPlaying.duration}</span>
      </div>
    </div>
  );
}

export function Hero(): React.JSX.Element {
  return (
    <section className={styles.hero}>
      <HeroBackdrop />
      <div className={`${styles.container} ${styles.heroGrid}`}>
        <div className={styles.heroCopy}>
          <span className={`chip chip-teal ${styles.heroBadge}`}>
            <Equalizer bars={[12, 8, 11]} barWidth={3} gap={2} />
            Built for musicians across Bangladesh
          </span>
          <h1 className={`display ${styles.heroTitle}`}>
            Find Your Sound.
            <br />
            <span className={styles.heroAccent}>
              Build Your Band.
              <Equalizer bars={[40, 56, 30, 48, 22]} className={styles.heroTitleBars} />
            </span>
          </h1>
          <p className={`muted ${styles.heroLead}`}>
            Meet guitarists, drummers, vocalists and session players near you. Show your work, invite the right people and turn a rehearsal-room
            idea into a band that plays live.
          </p>
          <div className={styles.buttonRow}>
            <Link className="btn btn-primary btn-lg" href={routes.musicians}>
              <PlayIcon />
              Explore Musicians
            </Link>
            <Link className="btn btn-secondary btn-lg" href={routes.createBand}>
              Create a Band
            </Link>
          </div>
          <QuickSearch />
        </div>

        <div className={styles.heroVisual}>
          <Vinyl />
          {spotlightCards.map((card, index) => (
            <div key={card.name} className={`card ${styles.spotlightCard} ${index === 0 ? styles.spotlightPrimary : styles.spotlightSecondary}`}>
              <div className={`photo-placeholder ${styles.spotlightPhoto}`} style={{ backgroundColor: tones[card.tone].tint }}>
                <span className={`display ${styles.spotlightInitials}`} style={{ color: tones[card.tone].ink }} aria-hidden="true">
                  {card.initials}
                </span>
                <span className={`chip ${styles.photoCaption}`}>Photo · {card.caption}</span>
              </div>
              <div className={styles.spotlightMeta}>
                <strong className={styles.spotlightName}>{card.name}</strong>
                <div className={`muted ${styles.smallMeta}`}>{card.role}</div>
              </div>
            </div>
          ))}
          <NowPlayingCard />
        </div>
      </div>
    </section>
  );
}
