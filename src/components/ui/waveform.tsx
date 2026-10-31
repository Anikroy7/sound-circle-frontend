import type { CSSProperties } from "react";

interface WaveformProps {
  /** Bar heights as percentages of the waveform's height — see `lib/waveform.ts`. */
  bars: number[];
  /** One colour for every bar, or a colour per bar index. */
  color: string | ((index: number) => string);
  barStyle?: CSSProperties;
  className?: string;
  style?: CSSProperties;
}

/** A static row of bars shaped like an audio waveform. Purely decorative. */
export function Waveform({ bars, color, barStyle, className, style }: WaveformProps): React.JSX.Element {
  return (
    <div className={`waveform ${className ?? ""}`} aria-hidden="true" style={style}>
      {bars.map((height, index) => (
        <span key={index} style={{ ...barStyle, height: `${height}%`, background: typeof color === "string" ? color : color(index) }} />
      ))}
    </div>
  );
}
