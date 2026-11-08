"use client";

import { useId, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/onboarding/onboarding.module.css";
import { VIDEO_PROVIDER_NAMES } from "@/lib/profile-steps";
import { detectVideoProvider } from "@/lib/video-link";

interface VideoLinksEditorProps {
  urls: string[];
  onChange: (urls: string[]) => void;
  limit: number;
  /** Told whether the box holds a link not yet added, so the step can refuse to save over it. */
  onDraftChange?: (hasDraft: boolean) => void;
  draftError?: string | null;
}

/**
 * Paste a YouTube, Facebook or Vimeo link and add it; each shows its platform. Videos are never
 * uploaded — a link is the only way in. The API checks the link again when the step is saved.
 */
export function VideoLinksEditor({ urls, onChange, limit, onDraftChange, draftError }: VideoLinksEditorProps): React.JSX.Element {
  const id = useId();
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  const setDraftValue = (value: string): void => {
    setDraft(value);
    setError(null);
    onDraftChange?.(value.trim().length > 0);
  };

  const add = (): void => {
    const value = draft.trim();
    if (!value) return;
    const provider = detectVideoProvider(value);
    if (!provider) return setError("Paste a link to a video on YouTube, Facebook or Vimeo.");
    if (urls.some((url) => url.trim() === value)) return setError("You've already added this video.");
    onChange([...urls, value]);
    setDraftValue("");
  };

  const shownError = error ?? draftError ?? null;

  return (
    <div className={styles.section}>
      <span className={styles.sectionHead}>
        <label className="label" htmlFor={id}>
          Video links
        </label>
        <span className={styles.counter}>
          {urls.length} / {limit}
        </span>
      </span>
      {urls.length < limit && (
        <div className={styles.linkRow}>
          <input
            id={id}
            className="input"
            type="url"
            inputMode="url"
            placeholder="https://youtu.be/…"
            value={draft}
            onChange={(event) => setDraftValue(event.target.value)}
            onKeyDown={(event) => {
              // Enter adds the link instead of submitting the whole step.
              if (event.key === "Enter") {
                event.preventDefault();
                add();
              }
            }}
            aria-invalid={!!shownError}
            aria-describedby={`${id}-hint${shownError ? ` ${id}-error` : ""}`}
          />
          <button type="button" className="btn btn-secondary" onClick={add} disabled={!draft.trim()}>
            Add
          </button>
        </div>
      )}
      <span id={`${id}-hint`} className="field-hint">
        YouTube, Facebook or Vimeo. We don&apos;t host video uploads, so share a link instead.
      </span>
      {shownError && <FieldError id={`${id}-error`}>{shownError}</FieldError>}

      {urls.length > 0 && (
        <ul className={styles.videoList}>
          {urls.map((url) => {
            const provider = detectVideoProvider(url);
            return (
              <li key={url} className={`inset ${styles.videoItem}`}>
                <span className="chip chip-teal">{provider ? VIDEO_PROVIDER_NAMES[provider] : "Video"}</span>
                <a href={/^https?:\/\//i.test(url) ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className={styles.videoUrl}>
                  {url}
                </a>
                <button type="button" className={styles.removeButton} onClick={() => onChange(urls.filter((other) => other !== url))} aria-label={`Remove ${url}`}>
                  Remove
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
