"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { CheckIcon } from "@/components/ui/icons";
import { ApiError, getMyProfile } from "@/lib/api";
import { PROFILE_STEPS, profileDestination } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { MusicianProfile } from "@/types/profile";

/** The finish page, drawn from the saved profile. An unfinished profile is sent back to its next step. */
export function ProfileDone(): React.JSX.Element {
  const router = useRouter();
  const [profile, setProfile] = useState<MusicianProfile | null>(null);

  useEffect(() => {
    let live = true;
    getMyProfile().then(
      (loaded) => {
        if (!live) return;
        if (loaded.setup_step < PROFILE_STEPS.length) return router.replace(profileDestination(loaded));
        setProfile(loaded);
      },
      (failure: unknown) => {
        if (live && failure instanceof ApiError && failure.status === 401) router.replace(routes.login);
      },
    );
    return () => {
      live = false;
    };
  }, [router]);

  if (!profile) {
    return (
      <div className={`card ${styles.loading}`} aria-live="polite">
        <span className="muted">Loading…</span>
      </div>
    );
  }

  const galleryEmpty = !profile.audio.length && !profile.photos.length && !profile.videos.length;

  return (
    <div className={`card ${styles.done}`}>
      <span className="success-badge">
        <CheckIcon />
      </span>
      <h2 className={`display ${styles.title}`}>Your profile is ready</h2>
      <p className="muted">
        {galleryEmpty
          ? "Bands can now find you. Add an audio sample, a photo or a video to complete your profile and stand out in search."
          : "Bands and musicians can now find you, hear you and get in touch."}
      </p>
      <div className={styles.completion}>
        <div className={styles.completionLabel}>
          <span className="muted">Profile complete</span>
          <strong>{profile.profile_completion}%</strong>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-label="Profile completion"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={profile.profile_completion}
        >
          <span style={{ width: `${profile.profile_completion}%` }} />
        </div>
      </div>
      <div className={styles.centerRow}>
        <Link className="btn btn-primary" href={routes.myProfile}>
          View my profile
        </Link>
        {galleryEmpty ? (
          <Link className="btn btn-secondary" href={routes.onboarding.step("showcase")}>
            Add audio &amp; photos
          </Link>
        ) : (
          <Link className="btn btn-secondary" href={routes.dashboard}>
            Go to my dashboard
          </Link>
        )}
      </div>
    </div>
  );
}
