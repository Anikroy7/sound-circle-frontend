import type { CSSProperties } from "react";
import { tones } from "@/lib/tones";
import type { Tone } from "@/types/common";

interface AvatarProps {
  initials: string;
  tone: Tone;
  /** Edge length in px. */
  size: number;
  /** Bands are rounded squares; musicians are circles. */
  shape?: "circle" | "square";
  /** `solid` fills with the tone's accent; `tinted` is the striped photo placeholder with accent initials. */
  variant?: "solid" | "tinted";
  className?: string;
  style?: CSSProperties;
}

/** Initials avatar that stands in for a photo until uploads exist. */
export function Avatar({ initials, tone, size, shape = "circle", variant = "solid", className, style }: AvatarProps): React.JSX.Element {
  const palette = tones[tone];
  const colours: CSSProperties =
    variant === "solid" ? { background: palette.ink } : { backgroundColor: palette.tint, color: palette.ink };

  return (
    <span
      className={`avatar ${variant === "tinted" ? "photo-placeholder" : ""} ${className ?? ""}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.round(size * 0.34)),
        borderRadius: shape === "square" ? Math.round(size * 0.24) : 999,
        ...colours,
        ...style,
      }}
    >
      {initials}
    </span>
  );
}
