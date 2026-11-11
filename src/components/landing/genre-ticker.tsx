"use client";

import { Fragment, useEffect, useRef, type PointerEvent as ReactPointerEvent } from "react";
import styles from "@/components/landing/landing.module.css";
import { tickerGenres } from "@/demo-data/hero";

/** Resting drift, in px a second (negative: right to left). */
const DRIFT = -60;
/** The fastest a flick may send it. */
const MAX_FLICK = 3000;

/**
 * The genre ticker, made to play with: it drifts on its own, pauses under the pointer, can be dragged
 * either way, and a flick sends it sliding before it eases back to its drift. Every other word is
 * outlined. The list is rendered twice and the position wraps by one copy, so it loops without a gap
 * in both directions. Reduced motion stops the drift; dragging still works.
 */
export function GenreTicker(): React.JSX.Element {
  const words = [...tickerGenres, ...tickerGenres];
  const track = useRef<HTMLDivElement>(null);
  const motion = useRef({ x: 0, speed: DRIFT, hovering: false, dragging: false, lastX: 0, lastAt: 0, flick: 0, still: false });

  useEffect(() => {
    const state = motion.current;
    state.still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (state.still) state.speed = 0;
    let last = performance.now();
    let frame = 0;

    const tick = (now: number): void => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const element = track.current;
      if (element) {
        if (!state.dragging) {
          const target = state.hovering || state.still ? 0 : DRIFT;
          // A flick decays slowly enough to feel like momentum; settling to the drift is quicker.
          state.speed += (target - state.speed) * Math.min(1, dt * (Math.abs(state.speed) > Math.abs(DRIFT) * 1.5 ? 1.6 : 4));
          state.x += state.speed * dt;
        }
        // One copy of the list wide: wrapping by it is invisible.
        const loop = element.scrollWidth / 2;
        if (loop > 0) state.x = (((state.x % loop) - loop) % loop) % loop;
        element.style.transform = `translate3d(${state.x}px, 0, 0)`;
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const grab = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const state = motion.current;
    state.dragging = true;
    state.lastX = event.clientX;
    state.lastAt = performance.now();
    state.flick = 0;
  };

  const drag = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = motion.current;
    if (!state.dragging) return;
    const now = performance.now();
    const dx = event.clientX - state.lastX;
    const dt = Math.max(0.008, (now - state.lastAt) / 1000);
    state.x += dx;
    state.flick = state.flick * 0.6 + (dx / dt) * 0.4;
    state.lastX = event.clientX;
    state.lastAt = now;
  };

  const release = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = motion.current;
    if (!state.dragging) return;
    // The release may carry a last move the browser merged into it; apply it, but only if the pointer moved.
    const movedOnRelease = event.type === "pointerup" && event.clientX !== state.lastX;
    if (movedOnRelease) drag(event);
    state.dragging = false;
    // Let go after holding still: no throw, it just resumes.
    const held = !movedOnRelease && performance.now() - state.lastAt > 120;
    state.speed = held ? 0 : Math.max(-MAX_FLICK, Math.min(MAX_FLICK, state.flick));
  };

  return (
    <div
      className={styles.ticker}
      aria-hidden="true"
      data-cursor="Drag"
      onPointerEnter={(event) => {
        if (event.pointerType === "mouse") motion.current.hovering = true;
      }}
      onPointerLeave={() => {
        motion.current.hovering = false;
      }}
      onPointerDown={grab}
      onPointerMove={drag}
      onPointerUp={release}
      onPointerCancel={release}
    >
      <div ref={track} className={styles.tickerTrack}>
        {words.map((word, index) => (
          <Fragment key={index}>
            <span
              className={`display ${styles.tickerWord} ${index % 2 ? styles.tickerWordOutline : ""}`}
              style={index % 2 ? undefined : { color: index % 4 === 0 ? "var(--teal)" : "var(--violet-soft)" }}
            >
              {word}
            </span>
            <span className={styles.tickerStar}>✦</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
