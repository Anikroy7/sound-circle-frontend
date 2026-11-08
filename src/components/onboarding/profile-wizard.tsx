"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { STEP_FORMS } from "@/components/onboarding/step-forms";
import { WizardContext, type SaveMode, type WizardContextValue } from "@/components/onboarding/wizard-context";
import { WizardProgress } from "@/components/onboarding/wizard-progress";
import { ApiError, apiErrorMessage, getGenres, getInstruments, getMyProfile } from "@/lib/api";
import { PROFILE_STEPS, profileDestination, stepIndex, type ProfileStepSlug } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { CatalogItem, MusicianProfile } from "@/types/profile";

interface Loaded {
  profile: MusicianProfile;
  catalog: { instruments: CatalogItem[]; genres: CatalogItem[] };
  /** Bumped on every load, so the step's form starts again from what is saved. */
  version: number;
}

/**
 * One step of profile setup. The server is the source of truth: each step loads the saved profile,
 * saves on Continue, and the next step loads again — so a musician can stop anywhere and resume later.
 *
 * Cache Components keeps a visited step mounted but hidden; its effects re-run when it is shown again,
 * which reloads the profile, and the cleanup below clears its "Saving…" state.
 */
export function ProfileWizard({ slug }: { slug: ProfileStepSlug }): React.JSX.Element {
  const router = useRouter();
  const index = stepIndex(slug);
  const stepNumber = index + 1;
  const step = PROFILE_STEPS[index];

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    Promise.all([getMyProfile(), getInstruments(), getGenres()]).then(
      ([profile, instruments, genres]) => {
        if (!live) return;
        // No skipping ahead by URL: a step needs the one before it.
        if (stepNumber > profile.setup_step + 1) return router.replace(profileDestination(profile));
        setLoaded((current) => ({ profile, catalog: { instruments, genres }, version: (current?.version ?? 0) + 1 }));
        setLoadError(null);
      },
      (failure: unknown) => {
        if (!live) return;
        if (failure instanceof ApiError && failure.status === 401) return router.replace(routes.login);
        setLoadError(apiErrorMessage(failure));
      },
    );
    return () => {
      live = false;
    };
  }, [stepNumber, router, attempt]);

  useLayoutEffect(
    () => () => {
      setPending(false);
      setError(null);
    },
    [],
  );

  const submit = useCallback(
    async (mode: SaveMode, save: () => Promise<MusicianProfile>): Promise<void> => {
      setPending(true);
      setError(null);
      try {
        const profile = await save();
        setLoaded((current) => current && { ...current, profile });
        const next = stepNumber < PROFILE_STEPS.length ? routes.onboarding.step(PROFILE_STEPS[stepNumber].slug) : routes.onboarding.done;
        router.push(mode === "later" ? routes.dashboard : next);
      } catch (failure) {
        setPending(false);
        if (failure instanceof ApiError && failure.status === 401) return router.push(routes.login);
        setError(apiErrorMessage(failure));
      }
    },
    [router, stepNumber],
  );

  const setProfile = useCallback((profile: MusicianProfile) => setLoaded((current) => current && { ...current, profile }), []);

  const context = useMemo<WizardContextValue | null>(
    () => loaded && { profile: loaded.profile, catalog: loaded.catalog, setProfile, submit, pending, error, setError, stepNumber },
    [loaded, setProfile, submit, pending, error, stepNumber],
  );

  if (!context) {
    return (
      <div className={`card ${styles.loading}`} aria-live="polite">
        {loadError ? (
          <>
            <span role="alert">{loadError}</span>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttempt((count) => count + 1)}>
              Try again
            </button>
          </>
        ) : (
          <span className="muted">Loading your profile…</span>
        )}
      </div>
    );
  }

  const StepForm = STEP_FORMS[slug];
  return (
    <WizardContext.Provider value={context}>
      <WizardProgress current={stepNumber} completed={context.profile.setup_step} completion={context.profile.profile_completion} />
      <div className={styles.header}>
        <h2 className={`display ${styles.title}`}>{step.heading}</h2>
        <p className="muted">{step.lead}</p>
      </div>
      <StepForm key={loaded?.version} />
    </WizardContext.Provider>
  );
}
