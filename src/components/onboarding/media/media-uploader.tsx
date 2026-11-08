"use client";

import { useId, useRef, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { apiErrorMessage } from "@/lib/api";
import { cloudinaryThumbnail, UploadError, uploadToCloudinary } from "@/lib/cloudinary-upload";
import { MAX_SOURCE_PHOTO_BYTES, shrinkImage } from "@/lib/image-shrink";
import { formatBytes, formatDuration, LIMITS, trackTitle } from "@/lib/profile-steps";
import type { UploadEndpoints } from "@/lib/cloudinary-upload";
import type { MediaItem, MediaType } from "@/types/profile";

const KINDS: Record<MediaType, { formats: string[]; noun: string; plural: string; button: string }> = {
  1: { formats: ["jpg", "jpeg", "png", "webp"], noun: "photo", plural: "photos", button: "Add photos" },
  3: { formats: ["mp3", "wav", "m4a", "aac", "ogg", "flac", "opus"], noun: "audio file", plural: "audio samples", button: "Add audio" },
};

interface Job {
  key: number;
  name: string;
  /** 0–1 while uploading. */
  progress: number;
  /** `preparing` while a photo is shrunk, `queued` until a transfer slot frees up. */
  status: "preparing" | "queued" | "uploading" | "saving" | "error";
  message?: string;
}

/** What a job shows instead of its percentage. */
const JOB_LABELS: Partial<Record<Job["status"], string>> = { preparing: "Optimizing…", queued: "Waiting…", saving: "Saving…" };

interface MediaUploaderProps<R> {
  mediaType: MediaType;
  endpoints: UploadEndpoints<R>;
  items: MediaItem[];
  limit: number;
  label: string;
  hint: string;
  onSaved: (result: R) => void;
  /** true when a batch starts, false when it ends — so the step can hold Continue until uploads land. */
  onBusyChange?: (busy: boolean) => void;
}

const extension = (name: string): string => name.split(".").pop()?.toLowerCase() ?? "";

/**
 * Files sent to Cloudinary at once. One long-distance upload leaves much of a slow uplink idle; three
 * fill it (measured: 1.9 → 2.5 Mbit/s on a 2.6 Mbit/s line). More would only split the same bandwidth.
 */
const PARALLEL_UPLOADS = 3;

const tooBig = (bytes: number): string => `${formatBytes(bytes)} — each file must be 10 MB or smaller.`;

let nextJobKey = 0;

/**
 * Pick several files; each is checked here (type, 10 MB), photos are shrunk in the browser
 * (`lib/image-shrink.ts`), then each is sent straight to Cloudinary with a signed ticket and recorded
 * by the API — which re-checks size and type against Cloudinary itself. Up to three transfers run at
 * once, each with its own progress bar and error.
 */
export function MediaUploader<R>({ mediaType, endpoints, items, limit, label, hint, onSaved, onBusyChange }: MediaUploaderProps<R>): React.JSX.Element {
  const kind = KINDS[mediaType];
  const inputId = useId();
  const input = useRef<HTMLInputElement>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [confirming, setConfirming] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  /**
   * Transfers run in parallel, but each save answers with the whole record; saved one after another,
   * the last answer is always the newest, so an earlier one can never hide a file saved since.
   */
  const saves = useRef<Promise<unknown>>(Promise.resolve());

  const inFlight = jobs.filter((job) => job.status !== "error").length;
  const room = limit - items.length - inFlight;

  const patch = (key: number, change: Partial<Job>): void => setJobs((current) => current.map((job) => (job.key === key ? { ...job, ...change } : job)));
  const fail = (key: number, message: string): void => patch(key, { status: "error", message });

  const saveInOrder = (publicId: string, fileName: string): Promise<R> => {
    const save = saves.current.then(() => endpoints.attach(publicId, fileName));
    saves.current = save.catch(() => undefined);
    return save;
  };

  const upload = async (original: File, key: number): Promise<void> => {
    try {
      if (mediaType === 1) patch(key, { status: "preparing" });
      const file = mediaType === 1 ? await shrinkImage(original) : original;
      if (file.size > LIMITS.fileBytes) return fail(key, tooBig(file.size));
      patch(key, { status: "uploading" });

      const ticket = await endpoints.ticket();
      const publicId = await uploadToCloudinary(ticket, file, (progress) => patch(key, { progress }));
      patch(key, { status: "saving", progress: 1 });
      // The name the musician knows, even when the photo went up as a smaller WebP.
      onSaved(await saveInOrder(publicId, original.name));
      setJobs((current) => current.filter((job) => job.key !== key));
    } catch (error) {
      fail(key, error instanceof UploadError ? `Upload failed: ${error.message}` : apiErrorMessage(error));
    }
  };

  const choose = async (files: FileList | null): Promise<void> => {
    if (!files?.length) return;
    const picked = Array.from(files);
    if (input.current) input.current.value = "";

    const accepted: { file: File; key: number }[] = [];
    const rejected: Job[] = [];
    for (const file of picked) {
      const key = nextJobKey++;
      if (!kind.formats.includes(extension(file.name))) {
        rejected.push({ key, name: file.name, progress: 0, status: "error", message: `Not a supported ${kind.noun}. Use ${kind.formats.join(", ")}.` });
      } else if (file.size > (mediaType === 1 ? MAX_SOURCE_PHOTO_BYTES : LIMITS.fileBytes)) {
        // A photo is checked against 10 MB again after shrinking; most camera photos end far below it.
        rejected.push({ key, name: file.name, progress: 0, status: "error", message: tooBig(file.size) });
      } else if (accepted.length >= room) {
        rejected.push({ key, name: file.name, progress: 0, status: "error", message: `Not added: you can have up to ${limit} ${kind.plural} here.` });
      } else {
        accepted.push({ file, key });
      }
    }

    setJobs((current) => [...current, ...accepted.map(({ file, key }) => ({ key, name: file.name, progress: 0, status: "queued" as const })), ...rejected]);
    if (!accepted.length) return;

    onBusyChange?.(true);
    let next = 0;
    const worker = async (): Promise<void> => {
      while (next < accepted.length) {
        const { file, key } = accepted[next++];
        await upload(file, key);
      }
    };
    await Promise.all(Array.from({ length: Math.min(PARALLEL_UPLOADS, accepted.length) }, worker));
    onBusyChange?.(false);
  };

  const remove = async (id: number): Promise<void> => {
    setRemoving(id);
    setRemoveError(null);
    try {
      onSaved(await endpoints.remove(id));
    } catch (error) {
      setRemoveError(apiErrorMessage(error));
    } finally {
      setRemoving(null);
      setConfirming(null);
    }
  };

  const confirmRow = (item: MediaItem): React.JSX.Element => (
    <span className={styles.bandButtons}>
      <button type="button" className="btn btn-danger btn-sm" onClick={() => remove(item.id)} disabled={removing === item.id}>
        {removing === item.id ? "Removing…" : "Remove"}
      </button>
      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(null)} disabled={removing === item.id}>
        Keep
      </button>
    </span>
  );

  return (
    <section className={styles.section} aria-labelledby={`${inputId}-label`}>
      <span className={styles.sectionHead}>
        <span id={`${inputId}-label`} className="label">
          {label}
        </span>
        <span className={styles.counter}>
          {items.length} / {limit}
        </span>
      </span>

      <div className={styles.dropzone}>
        <span className="field-hint">{hint}</span>
        <input
          ref={input}
          id={inputId}
          type="file"
          multiple
          accept={kind.formats.map((format) => `.${format}`).join(",")}
          className="visually-hidden"
          onChange={(event) => void choose(event.target.files)}
          disabled={room <= 0}
          tabIndex={-1}
        />
        <button type="button" className="btn btn-secondary btn-sm" onClick={() => input.current?.click()} disabled={room <= 0}>
          {room <= 0 && !inFlight ? `Limit of ${limit} reached` : kind.button}
        </button>
      </div>

      {jobs.length > 0 && (
        <ul className={styles.queue} aria-live="polite">
          {jobs.map((job) => (
            <li key={job.key} className={`inset ${styles.queueItem}`}>
              <span className={styles.queueHead}>
                <span className={styles.fileName}>{job.name}</span>
                {job.status === "error" ? (
                  <button type="button" className={styles.removeButton} onClick={() => setJobs((current) => current.filter((other) => other.key !== job.key))}>
                    Dismiss
                  </button>
                ) : (
                  <span className="muted">{JOB_LABELS[job.status] ?? `${Math.round(job.progress * 100)}%`}</span>
                )}
              </span>
              {job.status === "error" ? (
                <span className="field-error" role="alert">
                  {job.message}
                </span>
              ) : (
                <div
                  className="progress"
                  role="progressbar"
                  aria-label={`Uploading ${job.name}`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round(job.progress * 100)}
                >
                  <span style={{ width: `${Math.max(4, job.progress * 100)}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {removeError && (
        <span className="field-error" role="alert">
          {removeError}
        </span>
      )}

      {mediaType === 1 && items.length > 0 && (
        <ul className={styles.photoGrid}>
          {items.map((item) => (
            <li key={item.id} className={styles.photo}>
              {/* Cloudinary already resizes and picks the format, so next/image's optimiser would only add a hop. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={cloudinaryThumbnail(item.secure_url)} alt={item.file_name ?? "Performance photo"} loading="lazy" />
              {confirming === item.id ? (
                <span className={`card ${styles.photoConfirm}`}>
                  {confirmRow(item)}
                </span>
              ) : (
                <button type="button" className={styles.photoRemove} onClick={() => setConfirming(item.id)} aria-label={`Remove ${item.file_name ?? "photo"}`}>
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {mediaType === 3 && items.length > 0 && (
        <ul className={styles.audioList}>
          {items.map((item) => (
            <li key={item.id} className={`inset ${styles.audioItem}`}>
              <span className={styles.queueHead}>
                <strong className={styles.fileName}>{trackTitle(item.file_name)}</strong>
                {confirming === item.id ? (
                  confirmRow(item)
                ) : (
                  <button type="button" className={styles.removeButton} onClick={() => setConfirming(item.id)} aria-label={`Remove ${item.file_name ?? "audio sample"}`}>
                    Remove
                  </button>
                )}
              </span>
              <span className="muted">
                {item.format.toUpperCase()} · {formatBytes(item.file_size)}
                {item.duration_seconds ? ` · ${formatDuration(item.duration_seconds)}` : ""}
              </span>
              <audio controls preload="none" src={item.secure_url}>
                <a href={item.secure_url}>Listen</a>
              </audio>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
