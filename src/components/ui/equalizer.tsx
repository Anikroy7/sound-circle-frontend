interface EqualizerProps {
  /** Resting height of each bar, in px; the tallest sets the component's height. */
  bars: number[];
  barWidth?: number;
  gap?: number;
  className?: string;
}

/** Bouncing equaliser bars. Purely decorative. */
export function Equalizer({ bars, barWidth = 8, gap = 5, className }: EqualizerProps): React.JSX.Element {
  return (
    <span className={`equalizer ${className ?? ""}`} aria-hidden="true" style={{ gap, height: Math.max(...bars) }}>
      {bars.map((height, index) => (
        <span key={index} style={{ width: barWidth, height }} />
      ))}
    </span>
  );
}
