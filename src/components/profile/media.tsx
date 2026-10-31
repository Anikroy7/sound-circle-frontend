import styles from "@/components/profile/profile.module.css";
import { PlayIcon } from "@/components/ui/icons";
import { Waveform } from "@/components/ui/waveform";
import { tones } from "@/lib/tones";
import { waveformBars } from "@/lib/waveform";
import type { Track, VideoLink } from "@/types/band";

interface TrackRowProps {
  track: Track;
  /** The first track is styled as the one ready to play. */
  featured?: boolean;
  /** Draws a waveform; bars before `played` (0–1) are lit. */
  wave?: { seed: number; played: number };
}

export function TrackRow({ track, featured = false, wave }: TrackRowProps): React.JSX.Element {
  const bars = wave ? waveformBars(48, wave.seed, 20, 90) : [];
  const playedBars = wave ? Math.round(bars.length * wave.played) : 0;

  return (
    <div className={`inset ${styles.track}`}>
      <button
        type="button"
        className={`btn btn-round ${featured ? "btn-primary" : "btn-secondary"} ${styles.trackPlay}`}
        aria-label={`Play ${track.title}`}
      >
        <PlayIcon />
      </button>
      <div className={styles.trackText}>
        <strong>{track.title}</strong>
        <div className={`muted ${styles.small}`}>{track.meta}</div>
      </div>
      {wave && (
        <Waveform
          bars={bars}
          color={(index) => (index < playedBars ? "var(--teal)" : "var(--border-strong)")}
          className={styles.trackWave}
        />
      )}
      <span className={`muted ${styles.trackLength}`}>{track.length}</span>
    </div>
  );
}

/** Striped 16:9 thumbnails with a play button; they link nowhere until real videos exist. */
export function VideoGrid({ videos }: { videos: VideoLink[] }): React.JSX.Element {
  return (
    <div className={styles.mediaGrid}>
      {videos.map((video) => (
        <a key={video.title} href="#" className={styles.video}>
          <span className={`photo-placeholder ${styles.videoThumb}`} style={{ backgroundColor: tones[video.tone].tint }}>
            <span className={styles.videoPlay}>
              <PlayIcon size={22} />
            </span>
            {video.badge && <span className={`chip ${styles.videoBadge}`}>{video.badge}</span>}
          </span>
          <strong>{video.title}</strong>
        </a>
      ))}
    </div>
  );
}
