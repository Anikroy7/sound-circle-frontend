"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { BandInfoStep } from "@/components/bands/create/band-info-step";
import { BandMediaStep } from "@/components/bands/create/band-media-step";
import { BandMembersStep } from "@/components/bands/create/band-members-step";
import styles from "@/components/bands/bands.module.css";
import page from "@/components/layout/page.module.css";
import { Avatar } from "@/components/ui/avatar";
import { ApiError, apiErrorMessage, getBandDraft, getGenres } from "@/lib/api";
import { BAND_STEPS, bandTypeLabel, type BandStepKey } from "@/lib/band-steps";
import { initialsOf } from "@/lib/person";
import { routes } from "@/lib/routes";
import type { Band } from "@/types/band-api";
import type { CatalogItem } from "@/types/profile";

interface BandWizardValue {
  /** The draft as last saved; null until step 1 creates it. */
  band: Band | null;
  setBand: (band: Band) => void;
  genres: CatalogItem[];
}

const BandWizardContext = createContext<BandWizardValue | null>(null);

export function useBandWizard(): BandWizardValue {
  const value = useContext(BandWizardContext);
  if (!value) throw new Error("useBandWizard() outside BandWizard");
  return value;
}

const STEP_FORMS: Record<BandStepKey, () => React.JSX.Element> = {
  details: BandInfoStep,
  members: BandMembersStep,
  media: BandMediaStep,
};

/**
 * One step of creating a band. The server holds the draft: step 1 creates it, and every later change
 * saves as it is made, so leaving and coming back resumes it. Steps 2 and 3 need the draft, so without
 * one they send the user to step 1. Cache Components keeps a visited step mounted but hidden; its
 * effect re-runs when shown again (fresh draft) and clears on leave.
 */
export function BandWizard({ step }: { step: BandStepKey }): React.JSX.Element {
  const router = useRouter();
  const [loaded, setLoaded] = useState<{ band: Band | null; genres: CatalogItem[]; version: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    Promise.all([getBandDraft(), getGenres()]).then(
      ([band, genres]) => {
        if (!live) return;
        if (!band && step !== "details") return router.replace(routes.createBandStep.details);
        setLoaded((current) => ({ band, genres, version: (current?.version ?? 0) + 1 }));
      },
      (failure: unknown) => {
        if (!live) return;
        if (failure instanceof ApiError && failure.status === 401) return router.replace(routes.login);
        setError(apiErrorMessage(failure));
      },
    );
    return () => {
      live = false;
      setLoaded(null);
      setError(null);
    };
  }, [router, step, attempt]);

  const setBand = useCallback((band: Band) => setLoaded((current) => current && { ...current, band }), []);
  const current = BAND_STEPS.findIndex((item) => item.key === step);
  const band = loaded?.band ?? null;
  const StepForm = STEP_FORMS[step];

  return (
    <main className={page.page}>
      <div className={page.head}>
        <div className={page.titleGroup}>
          <Link href={routes.dashboard} className={page.backLink}>
            ← My Dashboard
          </Link>
          <h1 className={`display ${page.title}`}>Create a band</h1>
        </div>
        {band && <span className={`muted ${styles.small}`}>Draft saved. You can leave and continue later.</span>}
      </div>

      <nav aria-label="Steps">
        <ol className={styles.steps}>
          {BAND_STEPS.map((item, index) => {
            const reachable = index === 0 || !!band;
            const className = `${styles.step} ${index === current ? styles.stepCurrent : ""} ${index < current ? styles.stepDone : ""}`;
            const content = (
              <>
                <span className={styles.stepNumber}>{index < current ? "✓" : index + 1}</span>
                {item.title}
              </>
            );
            return (
              <li key={item.key} className={styles.stepItem}>
                {reachable ? (
                  <Link href={item.path} className={className} aria-current={index === current ? "step" : undefined}>
                    {content}
                  </Link>
                ) : (
                  <span className={`${className} ${styles.stepLocked}`} aria-disabled="true">
                    {content}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      {!loaded ? (
        <div className={`card ${styles.stepCard}`} aria-live="polite">
          {error ? (
            <div role="alert" className={`alert alert-error ${styles.loadError}`}>
              <span>{error}</span>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setAttempt((count) => count + 1)}>
                Try again
              </button>
            </div>
          ) : (
            <span className="muted">Loading…</span>
          )}
        </div>
      ) : (
        <div className={page.split}>
          <div className={`card ${styles.stepCard}`}>
            <h2 className={`display ${styles.stepTitle}`}>{BAND_STEPS[current].title}</h2>
            <BandWizardContext.Provider value={{ band, setBand, genres: loaded.genres }}>
              <StepForm key={loaded.version} />
            </BandWizardContext.Provider>
          </div>
          <BandPreview band={band} />
        </div>
      )}
    </main>
  );
}

/** The public band card as it will look, beside the form, from the saved draft. */
function BandPreview({ band }: { band: Band | null }): React.JSX.Element {
  const checklist = [
    { label: "Name, genres, location, description and type", done: !!band },
    { label: "Logo (optional)", done: !!band?.logo_url },
    { label: "Members (optional)", done: (band?.members.length ?? 0) > 1 },
    { label: "Performance photos or videos (optional)", done: !!band && band.photos.length + band.videos.length > 0 },
  ];

  return (
    <aside className={page.aside}>
      <div className={`card ${styles.previewCard}`}>
        <div className={styles.previewBody}>
          <Avatar
            initials={band ? initialsOf(band.name) : "?"}
            tone="violet"
            size={64}
            shape="square"
            photoUrl={band?.logo_url}
            className={`display ${styles.previewLogo}`}
          />
          <strong className={`display ${styles.previewName}`}>{band?.name ?? "Your band"}</strong>
          <span className={`muted ${styles.small}`}>
            {band ? [band.genres.map((genre) => genre.name).join(", "), band.location?.label, bandTypeLabel(band.band_type)].filter(Boolean).join(" · ") : "Fill in step 1 to see your band card."}
          </span>
          {band && (
            <span className={`muted ${styles.small}`}>
              {band.members.length} {band.members.length === 1 ? "member" : "members"}
            </span>
          )}
          <span className={`muted ${styles.previewCaption}`}>Live preview of your public band card</span>
        </div>
      </div>

      <div className={`card panel ${styles.checklistCard}`}>
        <strong>Before you publish</strong>
        <ul className={styles.checklist}>
          {checklist.map((item) => (
            <li key={item.label}>
              <span className={item.done ? styles.markDone : "muted"} aria-hidden="true">
                {item.done ? "✓" : "○"}
              </span>
              {item.label}
              <span className="visually-hidden">{item.done ? " (done)" : " (not yet)"}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
