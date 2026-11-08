"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { ApiError, apiErrorMessage, getMyProfile } from "@/lib/api";
import { profileDestination } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";

/** `/onboarding`: picks up where the musician left off — the first unfinished step, or the finish page. */
export function ResumeRedirect(): React.JSX.Element {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    getMyProfile().then(
      (profile) => live && router.replace(profileDestination(profile)),
      (failure: unknown) => {
        if (!live) return;
        if (failure instanceof ApiError && failure.status === 401) return router.replace(routes.login);
        setError(apiErrorMessage(failure));
      },
    );
    return () => {
      live = false;
    };
  }, [router, attempt]);

  return (
    <div className={`card ${styles.loading}`} aria-live="polite">
      {error ? (
        <>
          <span role="alert">{error}</span>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttempt((count) => count + 1)}>
            Try again
          </button>
        </>
      ) : (
        <span className="muted">Taking you to your profile setup…</span>
      )}
    </div>
  );
}
