/**
 * Decorative waveforms. Deterministic — the same seed always draws the same shape — so the
 * server and client render identical markup and there is no hydration mismatch.
 */

const amplitude = (index: number, seed: number): number => Math.abs(Math.sin(index * 0.55 + seed) * Math.cos(index * 0.23 + seed * 1.7));

/** `count` bar heights, as percentages between `min` and `max`. */
export function waveformBars(count: number, seed: number, min: number, max: number): number[] {
  return Array.from({ length: count }, (_, index) => Math.round(min + (max - min) * amplitude(index, seed)));
}

/** An SVG path for a sine line across a `width` × 60 view box. */
export function sineWavePath(width: number = 1200): string {
  let path = "M0 30";
  for (let x = 0; x <= width; x += 10) {
    const y = 30 + Math.sin(x / 38) * 18 * Math.cos(x / 210);
    path += ` L${x} ${y.toFixed(1)}`;
  }
  return path;
}
