"use client";

import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { STEP_FORMS } from "@/components/onboarding/step-forms";
import { WizardContext, type WizardContextValue } from "@/components/onboarding/wizard-context";
import { EditorDialog } from "@/components/profile/editor-dialog";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { PROFILE_STEPS, stepIndex, type ProfileStepSlug } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { CatalogItem, MusicianProfile } from "@/types/profile";

interface SectionEditorProps {
  slug: ProfileStepSlug;
  profile: MusicianProfile;
  catalog: { instruments: CatalogItem[]; genres: CatalogItem[] };
  /** Every save (the form's, an upload's, a band's) lands here, so the page behind updates at once. */
  onProfile: (profile: MusicianProfile) => void;
  onClose: () => void;
}

/**
 * Edits one profile section in a dialog over the profile page, with the same form (and validation)
 * as that setup step — in edit mode, so it shows Cancel · Save changes and saving closes the dialog
 * instead of moving to the next step.
 */
export function SectionEditor({ slug, profile, catalog, onProfile, onClose }: SectionEditorProps): React.JSX.Element {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const index = stepIndex(slug);
  const step = PROFILE_STEPS[index];

  const submit = useCallback<WizardContextValue["submit"]>(
    async (_mode, save) => {
      setPending(true);
      setError(null);
      try {
        onProfile(await save());
        onClose();
      } catch (failure) {
        setPending(false);
        if (failure instanceof ApiError && failure.status === 401) return router.push(routes.login);
        setError(apiErrorMessage(failure));
      }
    },
    [onProfile, onClose, router],
  );

  const context = useMemo<WizardContextValue>(
    () => ({ profile, catalog, setProfile: onProfile, submit, pending, error, setError, stepNumber: index + 1, editing: { onCancel: onClose } }),
    [profile, catalog, onProfile, submit, pending, error, index, onClose],
  );

  const StepForm = STEP_FORMS[slug];

  return (
    <EditorDialog id={`edit-${slug}`} title={`Edit ${step.title.toLowerCase()}`} lead={step.lead} pending={pending} onClose={onClose}>
      <WizardContext.Provider value={context}>
        <StepForm />
      </WizardContext.Provider>
    </EditorDialog>
  );
}
