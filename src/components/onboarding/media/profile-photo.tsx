"use client";

import { useId, useRef, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { Avatar } from "@/components/ui/avatar";
import { apiErrorMessage, getPhotoTicket, removeProfilePhoto, setProfilePhoto } from "@/lib/api";
import { updateSessionPhoto } from "@/lib/auth-session";
import { UploadError, uploadToCloudinary } from "@/lib/cloudinary-upload";
import { MAX_SOURCE_PHOTO_BYTES, shrinkImage } from "@/lib/image-shrink";
import { initialsOf, toneFor } from "@/lib/person";
import { formatBytes, LIMITS } from "@/lib/profile-steps";
import type { MusicianProfile } from "@/types/profile";

const FORMATS = ["jpg", "jpeg", "png", "webp"];
/** An avatar is never shown larger than 168 px; 1024 keeps it sharp on any screen at a fraction of the bytes. */
const PHOTO_EDGE = 1024;

type Status = { kind: "idle" } | { kind: "preparing" } | { kind: "uploading"; progress: number } | { kind: "saving" } | { kind: "removing" };

interface ProfilePhotoProps {
  photoUrl: string | null;
  /** For the initials shown when there is no photo. */
  name: string;
  userId: number;
  /** Avatar edge in px. */
  size: number;
  /** Every save lands here, so the page or step updates at once. */
  onProfile: (profile: MusicianProfile) => void;
  /** true while an upload is in flight, so a step can hold its own save until it lands. */
  onBusyChange?: (busy: boolean) => void;
  /** `field` in profile setup (hint beside the photo); `hero` on the profile page (buttons under it). */
  layout?: "field" | "hero";
}

/**
 * Upload, change or remove the profile photo. It saves the moment it uploads — no step save needed —
 * and the photo it replaces is deleted by the API. Shrunk in the browser first, like gallery photos.
 */
export function ProfilePhoto({ photoUrl, name, userId, size, onProfile, onBusyChange, layout = "field" }: ProfilePhotoProps): React.JSX.Element {
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const busy = status.kind !== "idle";

  const run = async (work: () => Promise<MusicianProfile>, first: Status): Promise<void> => {
    setError(null);
    setConfirming(false);
    setStatus(first);
    onBusyChange?.(true);
    try {
      const profile = await work();
      onProfile(profile);
      updateSessionPhoto(profile.photo_url);
    } catch (failure) {
      setError(failure instanceof UploadError ? `Upload failed: ${failure.message}` : apiErrorMessage(failure));
    } finally {
      setStatus({ kind: "idle" });
      onBusyChange?.(false);
    }
  };

  const choose = (files: FileList | null): void => {
    const original = files?.[0];
    if (input.current) input.current.value = "";
    if (!original) return;

    const extension = original.name.split(".").pop()?.toLowerCase() ?? "";
    if (!FORMATS.includes(extension)) return setError("Use a JPG, PNG or WebP photo.");
    if (original.size > MAX_SOURCE_PHOTO_BYTES) return setError(`${formatBytes(original.size)} is too large. Use a photo under ${formatBytes(MAX_SOURCE_PHOTO_BYTES)}.`);

    void run(async () => {
      const file = await shrinkImage(original, PHOTO_EDGE);
      if (file.size > LIMITS.fileBytes) throw new UploadError(`${formatBytes(file.size)} is still over 10 MB. Try a smaller photo`);
      setStatus({ kind: "uploading", progress: 0 });
      const ticket = await getPhotoTicket();
      const publicId = await uploadToCloudinary(ticket, file, (progress) => setStatus({ kind: "uploading", progress }));
      setStatus({ kind: "saving" });
      return setProfilePhoto(publicId);
    }, { kind: "preparing" });
  };

  const statusText =
    status.kind === "preparing"
      ? "Optimizing…"
      : status.kind === "uploading"
        ? `Uploading… ${Math.round(status.progress * 100)}%`
        : status.kind === "saving"
          ? "Saving…"
          : status.kind === "removing"
            ? "Removing…"
            : null;

  return (
    <div className={`${styles.photoField} ${layout === "hero" ? styles.photoFieldHero : ""}`}>
      <span className={styles.photoPreview}>
        <Avatar initials={initialsOf(name)} tone={toneFor(userId)} size={size} shape="square" variant="tinted" photoUrl={photoUrl} className="display" />
        {busy && (
          <span className={styles.photoBusy} aria-hidden="true">
            {status.kind === "uploading" ? `${Math.round(status.progress * 100)}%` : "…"}
          </span>
        )}
      </span>

      <div className={styles.photoControls}>
        {layout === "field" && (
          <span className="field-hint">A clear photo of you, or of you playing. JPG, PNG or WebP; large photos are resized automatically.</span>
        )}
        <input
          ref={input}
          id={inputId}
          type="file"
          accept={FORMATS.map((format) => `.${format}`).join(",")}
          className="visually-hidden"
          onChange={(event) => choose(event.target.files)}
          tabIndex={-1}
        />
        {confirming ? (
          <span className={styles.bandButtons}>
            <span className="muted">Remove your photo?</span>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => void run(removeProfilePhoto, { kind: "removing" })}>
              Remove
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)}>
              Keep
            </button>
          </span>
        ) : (
          <span className={styles.bandButtons}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()} disabled={busy}>
              {photoUrl ? "Change photo" : "Upload photo"}
            </button>
            {photoUrl && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(true)} disabled={busy}>
                Remove
              </button>
            )}
          </span>
        )}
        <span className="muted" aria-live="polite">
          {statusText}
        </span>
        {error && (
          <span className="field-error" role="alert">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
