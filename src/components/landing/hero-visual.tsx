"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import styles from "@/components/landing/landing.module.css";
import { PauseIcon, PlayIcon } from "@/components/ui/icons";
import { Waveform } from "@/components/ui/waveform";
import { nowPlaying, spotlightCards } from "@/demo-data/hero";
import { tones } from "@/lib/tones";
import { waveformBars } from "@/lib/waveform";

const NOW_PLAYING_BARS = waveformBars(46, 1.1, 18, 100);
/** The record's resting speed, in degrees a second: one turn in 9 s. */
const SPIN = 40;
/** The fastest a flick may send it. */
const MAX_SPIN = 1440;
/** How far each layer drifts with the pointer, in px: nearer things move more. */
const DEPTH = {
  vinyl: 10,
  primary: 22,
  secondary: 30,
  nowPlaying: 16,
} as const;

type CardKey = "primary" | "secondary" | "nowPlaying";
type Offset = { x: number; y: number };

const seconds = (clock: string): number => {
  const [minutes, secs] = clock.split(":").map(Number);
  return minutes * 60 + secs;
};
const clock = (total: number): string => `${Math.floor(total / 60)}:${String(Math.floor(total % 60)).padStart(2, "0")}`;
const DURATION = seconds(nowPlaying.duration);

/** Rotation from one pointer angle to the next, taking the short way round. */
const turn = (from: number, to: number): number => {
  const delta = to - from;
  return delta > 180 ? delta - 360 : delta < -180 ? delta + 360 : delta;
};

/**
 * The hero collage, made to play with: the record spins and can be grabbed and flicked like a DJ
 * scratch, the cards can be dragged anywhere (double-click puts one back), everything drifts with the
 * pointer at its own depth, and the player's pause button really pauses. Reduced motion keeps the
 * dragging but drops the spin, drift and float. On a phone the collage stacks, so nothing drags there.
 */
export function HeroVisual(): React.JSX.Element {
  const root = useRef<HTMLDivElement>(null);
  const disc = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(true);
  const [elapsed, setElapsed] = useState(seconds(nowPlaying.elapsed));
  const [offsets, setOffsets] = useState<Record<CardKey, Offset>>({
    primary: { x: 0, y: 0 },
    secondary: { x: 0, y: 0 },
    nowPlaying: { x: 0, y: 0 },
  });
  const [front, setFront] = useState<CardKey>("nowPlaying");
  const [touched, setTouched] = useState(false);

  // Everything the animation loop reads lives in one mutable object, so a frame never waits on React.
  const motion = useRef({
    angle: 0,
    speed: SPIN,
    playing: true,
    grabbing: false,
    lastPointerAngle: 0,
    lastMoveAt: 0,
    flick: 0,
    pointer: { x: 0, y: 0 },
    drift: { x: 0, y: 0 },
    still: false,
  });

  useEffect(() => {
    motion.current.playing = playing;
  }, [playing]);

  // One loop: spin the record and ease the pointer drift.
  useEffect(() => {
    const state = motion.current;
    state.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const section = root.current?.closest("section") ?? root.current;
    let last = performance.now();
    let frame = 0;

    const onPointer = (event: PointerEvent): void => {
      if (state.still || event.pointerType !== "mouse" || !section) return;
      const box = section.getBoundingClientRect();
      state.pointer.x = Math.max(-1, Math.min(1, ((event.clientX - box.left) / box.width) * 2 - 1));
      state.pointer.y = Math.max(-1, Math.min(1, ((event.clientY - box.top) / box.height) * 2 - 1));
    };

    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!state.grabbing) {
        const target = state.playing && !state.still ? SPIN : 0;
        state.speed += (target - state.speed) * Math.min(1, dt * 1.2);
        state.angle = (state.angle + state.speed * dt) % 360;
      }
      if (disc.current) disc.current.style.transform = `rotate(${state.angle}deg)`;

      state.drift.x += (state.pointer.x - state.drift.x) * Math.min(1, dt * 5);
      state.drift.y += (state.pointer.y - state.drift.y) * Math.min(1, dt * 5);
      section?.style.setProperty("--px", state.drift.x.toFixed(3));
      section?.style.setProperty("--py", state.drift.y.toFixed(3));
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("pointermove", onPointer, { passive: true });
    frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  // The sample's clock, while it plays; it loops at the end.
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setElapsed((current) => (current + 1) % DURATION), 1000);
    return () => clearInterval(timer);
  }, [playing]);

  const canDrag = (): boolean => window.matchMedia("(min-width: 761px)").matches;

  /* ------------------------------------------------------------ the record: grab, scratch, flick */

  const pointerAngle = (event: ReactPointerEvent): number => {
    const box = disc.current!.getBoundingClientRect();
    return (Math.atan2(event.clientY - (box.top + box.height / 2), event.clientX - (box.left + box.width / 2)) * 180) / Math.PI;
  };

  const grabRecord = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (!canDrag()) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const state = motion.current;
    state.grabbing = true;
    state.lastPointerAngle = pointerAngle(event);
    state.lastMoveAt = performance.now();
    state.flick = 0;
    setTouched(true);
  };

  const scratch = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = motion.current;
    if (!state.grabbing) return;
    const angle = pointerAngle(event);
    const delta = turn(state.lastPointerAngle, angle);
    const now = performance.now();
    const dt = Math.max(0.008, (now - state.lastMoveAt) / 1000);
    state.angle += delta;
    // Smoothed, so the flick is the last few moves rather than one jittery sample.
    state.flick = state.flick * 0.6 + (delta / dt) * 0.4;
    state.lastPointerAngle = angle;
    state.lastMoveAt = now;
  };

  const releaseRecord = (): void => {
    const state = motion.current;
    if (!state.grabbing) return;
    state.grabbing = false;
    // A held record that was let go without moving just carries on from rest.
    const sinceMove = performance.now() - state.lastMoveAt;
    state.speed = sinceMove > 120 ? 0 : Math.max(-MAX_SPIN, Math.min(MAX_SPIN, state.flick));
  };

  /* ------------------------------------------------------------ the cards: drag anywhere */

  const drag = useRef<{
    key: CardKey;
    startX: number;
    startY: number;
    from: Offset;
    bounds: { minX: number; maxX: number; minY: number; maxY: number };
  } | null>(null);

  const pickUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const key = event.currentTarget.dataset.card as CardKey;
    if (!canDrag() || (event.target as HTMLElement).closest("button") || !root.current) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    // Keep at least a third of the card inside the collage, so it can always be grabbed back.
    const area = root.current.getBoundingClientRect();
    const card = event.currentTarget.getBoundingClientRect();
    const from = offsets[key];
    const slackX = card.width * 0.66;
    const slackY = card.height * 0.66;
    drag.current = {
      key,
      startX: event.clientX,
      startY: event.clientY,
      from,
      bounds: {
        minX: from.x + area.left - card.left - slackX,
        maxX: from.x + area.right - card.right + slackX,
        minY: from.y + area.top - card.top - slackY,
        maxY: from.y + area.bottom - card.bottom + slackY,
      },
    };
    setFront(key);
    setTouched(true);
  };

  const move = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const current = drag.current;
    if (!current) return;
    const { bounds } = current;
    const x = Math.max(bounds.minX, Math.min(bounds.maxX, current.from.x + event.clientX - current.startX));
    const y = Math.max(bounds.minY, Math.min(bounds.maxY, current.from.y + event.clientY - current.startY));
    setOffsets((all) => ({ ...all, [current.key]: { x, y } }));
  };

  /** Lands the card where the pointer let go: the browser may have merged the last moves into the release. */
  const drop = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.type === "pointerup") move(event);
    drag.current = null;
  };

  const putBack = (event: React.MouseEvent<HTMLDivElement>): void => {
    const key = event.currentTarget.dataset.card as CardKey;
    setOffsets((all) => ({ ...all, [key]: { x: 0, y: 0 } }));
  };

  const slot = useCallback(
    (key: CardKey, depth: number): React.CSSProperties => ({
      transform: `translate(${offsets[key].x}px, ${offsets[key].y}px)`,
      zIndex: front === key ? 3 : 2,
      ["--depth" as string]: `${depth}px`,
    }),
    [offsets, front],
  );

  const playedBars = Math.round(NOW_PLAYING_BARS.length * (elapsed / DURATION));

  return (
    <div ref={root} className={styles.heroVisual}>
      <div className={`${styles.vinyl} ${styles.parallax}`} style={{ ["--depth" as string]: `${DEPTH.vinyl}px` }} aria-hidden="true">
        <div
          ref={disc}
          className={styles.vinylDisc}
          data-cursor="Spin"
          onPointerDown={grabRecord}
          onPointerMove={scratch}
          onPointerUp={releaseRecord}
          onPointerCancel={releaseRecord}
        >
          <span className={styles.vinylSheen} />
          <div className={styles.vinylLabel}>
            <span className={`display ${styles.vinylBrand}`}>SoundCircle</span>
            <span className={styles.vinylSide}>SIDE A · DHAKA</span>
            <span className={styles.vinylHole} />
          </div>
        </div>
        <svg className={`${styles.tonearm} ${playing ? "" : styles.tonearmLifted}`} width="150" height="190" viewBox="0 0 150 190">
          <circle cx="122" cy="26" r="18" fill="#292524" stroke="#44403C" strokeWidth="2" />
          <path d="M122 26 L98 150 L64 176" stroke="#A8A29E" strokeWidth="5" fill="none" strokeLinecap="round" />
          <rect x="50" y="166" width="26" height="16" rx="3" fill="#D6D3D1" transform="rotate(-35 63 174)" />
        </svg>
      </div>

      {spotlightCards.map((card, index) => {
        const key: CardKey = index === 0 ? "primary" : "secondary";
        return (
          <div
            key={card.name}
            className={`${styles.slot} ${styles.parallax} ${key === "primary" ? styles.spotlightPrimary : styles.spotlightSecondary}`}
            style={slot(key, DEPTH[key])}
            data-card={key}
            data-cursor="Drag"
            onPointerDown={pickUp}
            onPointerMove={move}
            onPointerUp={drop}
            onPointerCancel={drop}
            onDoubleClick={putBack}
          >
            <div className={`card ${styles.spotlightCard} ${styles.float}`} style={{ animationDelay: `${index * -2.2}s` }}>
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
          </div>
        );
      })}

      <div
        className={`${styles.slot} ${styles.parallax} ${styles.nowPlayingSlot}`}
        style={slot("nowPlaying", DEPTH.nowPlaying)}
        data-card="nowPlaying"
        data-cursor="Drag"
        onPointerDown={pickUp}
        onPointerMove={move}
        onPointerUp={drop}
        onPointerCancel={drop}
        onDoubleClick={putBack}
      >
        <div className={`card ${styles.nowPlaying} ${styles.float}`} style={{ animationDelay: "-1.1s" }}>
          <div className={styles.nowPlayingTop}>
            <span className={styles.pulseWrap}>
              {playing && <span className={styles.pulse} />}
              <button
                type="button"
                className={`btn btn-primary btn-round ${styles.pulseButton}`}
                aria-label={playing ? "Pause sample" : "Play sample"}
                aria-pressed={playing}
                onClick={() => setPlaying((current) => !current)}
              >
                {playing ? <PauseIcon /> : <PlayIcon size={14} />}
              </button>
            </span>
            <div className={styles.nowPlayingText}>
              <span className={`track-label ${styles.nowPlayingLabel}`}>{playing ? "Now playing" : "Paused"}</span>
              <strong className={styles.nowPlayingTitle}>{nowPlaying.title}</strong>
              <span className={`muted ${styles.smallMeta}`}>{nowPlaying.artist}</span>
            </div>
          </div>
          <Waveform bars={NOW_PLAYING_BARS} color={(bar) => (bar < playedBars ? "var(--teal)" : "var(--border-accent)")} style={{ height: 30 }} />
          <div className={`muted ${styles.timeRow}`}>
            <span>{clock(elapsed)}</span>
            <span>{nowPlaying.duration}</span>
          </div>
        </div>
      </div>

      <span className={`${styles.playHint} ${touched ? styles.playHintGone : ""}`} aria-hidden="true">
        Drag the cards · spin the record
      </span>
    </div>
  );
}
