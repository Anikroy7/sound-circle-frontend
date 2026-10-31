import type { Metadata } from "next";
import { OnboardingProgress, SelectField, StepActions } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { areaOptions, cityOptions, profileDraft } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Introduce yourself" };

export default function OnboardingAboutPage(): React.JSX.Element {
  return (
    <>
      <OnboardingProgress step={1} />
      <h2 className={`display ${styles.stepTitle}`}>Introduce yourself</h2>
      <div className={styles.photoRow}>
        <span className={`avatar ${styles.photoSlot}`}>Photo</span>
        <div className={styles.photoText}>
          <button type="button" className="btn btn-secondary btn-sm">
            Upload a photo
          </button>
          <span className="field-hint">A clear photo helps bands recognise you. JPG or PNG, up to 5 MB.</span>
        </div>
      </div>
      <label className="field">
        <span className="label">Display name</span>
        <input className="input" name="displayName" defaultValue={profileDraft.displayName} />
      </label>
      <div className="field-row">
        <SelectField label="City" name="city" options={cityOptions} />
        <SelectField label="Area" name="area" options={areaOptions} />
      </div>
      <label className="field">
        <span className="label">Short bio</span>
        <textarea className="input" name="bio" rows={4} maxLength={profileDraft.bioLimit} defaultValue={profileDraft.bio} />
        <span className={`muted ${styles.counter}`}>
          {profileDraft.bio.length} / {profileDraft.bioLimit}
        </span>
      </label>
      <StepActions back={routes.signup} next={routes.onboarding.music} />
    </>
  );
}
