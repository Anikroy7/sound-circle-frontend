import styles from "@/components/profile/profile.module.css";
import { PlayIcon } from "@/components/ui/icons";
import { cloudinaryThumbnail } from "@/lib/cloudinary-upload";
import { VIDEO_PROVIDER_NAMES } from "@/lib/profile-steps";
import { tones } from "@/lib/tones";
import type { MediaItem, VideoLink } from "@/types/profile";

/** YouTube serves a still for every video; Vimeo and Facebook need an API call, so they get the striped placeholder. */
const videoStill = (video: VideoLink): string | null =>
  video.provider === 1 ? `https://i.ytimg.com/vi/${video.external_video_id}/hqdefault.jpg` : null;

/** Photos as square thumbnails, each opening the full-size image in a new tab. `small` fits a sidebar. */
export function PhotoGrid({ photos, size = "large" }: { photos: MediaItem[]; size?: "large" | "small" }): React.JSX.Element {
  return (
    <div className={size === "large" ? styles.photoGrid : styles.thumbGrid}>
      {photos.map((photo) => (
        <a key={photo.id} href={photo.secure_url} target="_blank" rel="noopener noreferrer" className={styles.photoLink}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={cloudinaryThumbnail(photo.secure_url, size === "large" ? 480 : 160)}
            alt={photo.file_name ?? "Performance photo"}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

/** Video links as thumbnails with a play button and the platform, opening the video in a new tab. `compact` fits the sidebar. */
export function VideoTiles({ videos, compact = false }: { videos: VideoLink[]; compact?: boolean }): React.JSX.Element {
  return (
    <div className={compact ? styles.videoGridCompact : styles.mediaGrid}>
      {videos.map((video, index) => {
        const still = videoStill(video);
        const platform = VIDEO_PROVIDER_NAMES[video.provider];
        return (
          <a
            key={video.id}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.video}
            aria-label={`Watch on ${platform} (opens in a new tab)`}
          >
            <span className={`photo-placeholder ${styles.videoThumb}`} style={{ backgroundColor: tones[index % 2 ? "teal" : "violet"].tint }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {still && <img src={still} alt="" loading="lazy" className={styles.videoStill} />}
              <span className={`${styles.videoPlay} ${styles.overStill} ${compact ? styles.videoPlaySmall : ""}`}>
                <PlayIcon size={compact ? 16 : 22} />
              </span>
              {!compact && <span className={`chip ${styles.videoBadge}`}>{platform}</span>}
            </span>
            <span className={`muted ${styles.small}`}>Watch on {platform}</span>
          </a>
        );
      })}
    </div>
  );
}
