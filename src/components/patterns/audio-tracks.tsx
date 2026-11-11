"use client";

import { useRef, useState, type CSSProperties } from "react";
import styles from "@/components/patterns/patterns.module.css";
import { TrackList, TrackRow } from "@/components/patterns/track-list";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { formatDuration, trackTitle } from "@/lib/profile-steps";
import type { MediaItem } from "@/types/profile";

/**
 * A musician's audio samples as a list: one shared player, a play / pause button per row, and a thin
 * progress line under the sample that is playing.
 */
export function AudioTracks({ tracks }: { tracks: MediaItem[] }): React.JSX.Element {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  // The sample in the player, playing or paused: its row keeps the progress line.
  const [loaded, setLoaded] = useState<number | null>(null);

  const toggle = (track: MediaItem): void => {
    const element = audio.current;
    if (!element) return;
    if (playing === track.id) {
      element.pause();
      return;
    }
    if (loaded !== track.id) {
      element.src = track.secure_url;
      setLoaded(track.id);
      setProgress(0);
    }
    element.play().then(
      () => setPlaying(track.id),
      () => setPlaying(null),
    );
  };

  return (
    <>
      {/* The player stays hidden; the rows are its controls. */}
      <audio
        ref={audio}
        preload="none"
        onPause={() => setPlaying(null)}
        onEnded={() => {
          setPlaying(null);
          setProgress(0);
        }}
        onTimeUpdate={(event) => {
          const { currentTime, duration } = event.currentTarget;
          setProgress(duration ? currentTime / duration : 0);
        }}
      />
      <TrackList head={[null, "Title", "Length"]} columns="40px minmax(0, 1fr) 64px">
        {tracks.map((track) => {
          const active = playing === track.id;
          const title = trackTitle(track.file_name);
          return (
            <TrackRow
              key={track.id}
              className={active ? styles.trackPlaying : ""}
              index={
                <button
                  type="button"
                  className={styles.trackPlay}
                  aria-pressed={active}
                  aria-label={`${active ? "Pause" : "Play"} ${title}`}
                  onClick={() => toggle(track)}
                >
                  {active ? <PauseIcon size={12} /> : <PlayIcon size={12} />}
                </button>
              }
              title={<span className={styles.trackName}>{title}</span>}
              subtitle={
                loaded === track.id && <span className={styles.trackProgress} style={{ "--p": progress } as CSSProperties} aria-hidden="true" />
              }
              cells={[track.duration_seconds ? formatDuration(track.duration_seconds) : "–"]}
            />
          );
        })}
      </TrackList>
    </>
  );
}
