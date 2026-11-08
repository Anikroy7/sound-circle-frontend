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
  /** A real photo; the initials are the fallback when there is none. */
  photoUrl?: string | null;
  className?: string;
  style?: CSSProperties;
}

/** A Cloudinary square crop at twice the display size (sharp on high-DPI screens), auto format and quality. */
const sizedPhoto = (url: string, size: number): string =>
  url.includes("/upload/") ? url.replace("/upload/", `/upload/c_fill,g_face,w_${size * 2},h_${size * 2},q_auto,f_auto/`) : url;

/** A photo, or initials standing in for one. Decorative: the name always appears next to it. */
export function Avatar({ initials, tone, size, shape = "circle", variant = "solid", photoUrl, className, style }: AvatarProps): React.JSX.Element {
  const palette = tones[tone];
  const colours: CSSProperties =
    variant === "solid" ? { background: palette.ink } : { backgroundColor: palette.tint, color: palette.ink };

  return (
    <span
      className={`avatar ${!photoUrl && variant === "tinted" ? "photo-placeholder" : ""} ${className ?? ""}`}
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        fontSize: Math.max(11, Math.round(size * 0.34)),
        borderRadius: shape === "square" ? Math.round(size * 0.24) : 999,
        overflow: "hidden",
        ...colours,
        ...style,
      }}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element -- Cloudinary already resizes; next/image would add a hop.
        <img src={sizedPhoto(photoUrl, size)} alt="" width={size} height={size} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      ) : (
        initials
      )}
    </span>
  );
}
