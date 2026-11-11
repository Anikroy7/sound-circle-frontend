"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { STEP_FORMS } from "@/components/onboarding/step-forms";
import { WizardContext, type SaveMode, type WizardContextValue } from "@/components/onboarding/wizard-context";
import { WizardProgress } from "@/components/onboarding/wizard-progress";
import { ApiError, apiErrorMessage, getGenres, getInstruments, getMyProfile } from "@/lib/api";
import { profileDestination, sectionNumber, SETUP_STAGES, stageIndex, stageSteps, type SetupStageSlug } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { CatalogItem, MusicianProfile } from "@/types/profile";

interface Loaded {
  profile: MusicianProfile;
  catalog: { instruments: CatalogItem[]; genres: CatalogItem[] };
  /** Bumped on every load, so the forms start again from what is saved. */
  version: number;
}

type Save = () => Promise<MusicianProfile>;

/** The page's own message when a section failed its checks without saying why. */
const CHECK_FIELDS = "Check the highlighted fields above.";

interface SectionProps {
  step: number;
  base: Omit<WizardContextValue, "submit" | "stepNumber" | "setError">;
  /** Called by the section's form: hands over its save while the page collects, or asks the page to save. */
  onSubmit: (step: number, mode: SaveMode, save: Save) => void;
  setError: (message: string | null) => void;
  children: ReactNode;
}

/** One section's form, with the context it expects; its saves go to the page. */
function Section({ step, base, onSubmit, setError, children }: SectionProps): React.JSX.Element {
  const value = useMemo<WizardContextValue>(
    () => ({
      ...base,
      stepNumber: step,
      setError,
      submit: async (mode, save) => onSubmit(step, mode, save),
    }),
    [base, step, setError, onSubmit],
  );
  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

/**
 * One page of profile setup, with one or more sections. The server is the source of truth: the page
 * loads the saved profile, and Continue checks every section, then saves them in the API's order (each
 * step needs the one before it), so a musician can stop anywhere and resume later.
 *
 * Cache Components keeps a visited page mounted but hidden; its effects re-run when it is shown again,
 * which reloads the profile, and the cleanup below clears its "Saving…" state.
 */
export function ProfileWizard({ slug }: { slug: SetupStageSlug }): React.JSX.Element {
  const router = useRouter();
  const index = stageIndex(slug);
  const stage = SETUP_STAGES[index];
  const steps = useMemo(() => stageSteps(stage), [stage]);
  const multi = stage.sections.length > 1;

  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  /** Each section's busy label ("Uploading…") while it has an upload in flight. */
  const [busy, setBusy] = useState<Record<number, string | null>>({});

  /** Each section's latest save, registered by its form. */
  const saves = useRef(new Map<number, (mode: SaveMode) => void>());
  /** While Continue checks the sections: the saves of those that passed. */
  const collected = useRef<Map<number, Save> | null>(null);
  /** A section explained its own problem, so the page needn't. */
  const explained = useRef(false);

  useEffect(() => {
    let live = true;
    Promise.all([getMyProfile(), getInstruments(), getGenres()]).then(
      ([profile, instruments, genres]) => {
        if (!live) return;
        // No skipping ahead by URL: a page needs the ones before it.
        if (steps[0] > profile.setup_step + 1) return router.replace(profileDestination(profile));
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
  }, [steps, router, attempt]);

  useLayoutEffect(
    () => () => {
      setPending(false);
      setErrorState(null);
    },
    [],
  );

  const setError = useCallback((message: string | null) => {
    if (message) explained.current = true;
    setErrorState(message);
  }, []);

  const register = useCallback((step: number, save: (mode: SaveMode) => void, busyLabel: string | null) => {
    saves.current.set(step, save);
    setBusy((current) => (current[step] === busyLabel ? current : { ...current, [step]: busyLabel }));
  }, []);

  const saveAll = useCallback(
    async (mode: SaveMode): Promise<void> => {
      // Ask every section to check itself; the valid ones hand over their save.
      collected.current = new Map();
      explained.current = false;
      setErrorState(null);
      steps.forEach((step) => saves.current.get(step)?.(mode));
      const ready = collected.current;
      collected.current = null;
      if (ready.size < steps.length) {
        if (!explained.current) setErrorState(multi ? CHECK_FIELDS : null);
        return;
      }

      setPending(true);
      try {
        for (const step of steps) {
          const profile = await ready.get(step)!();
          setLoaded((current) => current && { ...current, profile });
        }
        const next = index + 1 < SETUP_STAGES.length ? routes.onboarding.step(SETUP_STAGES[index + 1].slug) : routes.onboarding.done;
        router.push(mode === "later" ? routes.dashboard : next);
      } catch (failure) {
        setPending(false);
        if (failure instanceof ApiError && failure.status === 401) return router.push(routes.login);
        setErrorState(apiErrorMessage(failure));
      }
    },
    [steps, multi, index, router],
  );

  const onSubmit = useCallback(
    (step: number, mode: SaveMode, save: Save) => {
      if (collected.current) collected.current.set(step, save);
      // Enter in one section's field: save the whole page.
      else void saveAll(mode);
    },
    [saveAll],
  );

  const setProfile = useCallback((profile: MusicianProfile) => setLoaded((current) => current && { ...current, profile }), []);

  if (!loaded) {
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

  const clearHint = (): void => {
    if (error === CHECK_FIELDS) setErrorState(null);
  };
  const base = { profile: loaded.profile, catalog: loaded.catalog, setProfile, pending, error, stage: { register } };
  const busyLabel = steps.map((step) => busy[step]).find(Boolean);
  const disabled = pending || !!busyLabel;
  const last = index === SETUP_STAGES.length - 1;

  return (
    <>
      <WizardProgress current={index + 1} setupStep={loaded.profile.setup_step} completion={loaded.profile.profile_completion} />
      <div className={styles.header}>
        <h2 className={`display ${styles.title}`}>{stage.heading}</h2>
        <p className="muted">{stage.lead}</p>
      </div>

      {/* Any change in the sections retires the page's "check the fields" message; their own errors stay. */}
      <div className={styles.stage} onClickCapture={clearHint} onInputCapture={clearHint}>
        {stage.sections.map((section) => {
          const StepForm = STEP_FORMS[section.slug];
          return (
            <section key={section.slug} className={multi ? styles.stageSection : undefined} aria-label={section.label ?? stage.title}>
              {section.label && <h3 className={styles.stageSectionTitle}>{section.label}</h3>}
              <Section step={sectionNumber(section.slug)} base={base} onSubmit={onSubmit} setError={setError}>
                <StepForm key={loaded.version} />
              </Section>
            </section>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}
      <div className={styles.actions}>
        {index > 0 && (
          <Link className="btn btn-ghost" href={routes.onboarding.step(SETUP_STAGES[index - 1].slug)}>
            Back
          </Link>
        )}
        <div className={styles.actionsEnd}>
          <button type="button" className="btn btn-ghost" onClick={() => saveAll("later")} disabled={disabled}>
            Finish later
          </button>
          <button type="button" className="btn btn-primary" onClick={() => saveAll("next")} disabled={disabled}>
            {busyLabel ?? (pending ? "Saving…" : last ? "Finish profile" : "Continue")}
          </button>
        </div>
      </div>
    </>
  );
}
