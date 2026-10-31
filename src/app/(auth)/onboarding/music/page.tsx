import type { Metadata } from "next";
import { OnboardingProgress, SelectField, StepActions, ToggleChips } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { availabilityChoices, genreChoices, instrumentChoices, profileDraft, skillOptions } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Your music" };

export default function OnboardingMusicPage(): React.JSX.Element {
  return (
    <>
      <OnboardingProgress step={2} />
      <h2 className={`display ${styles.stepTitle}`}>Your music</h2>
      <div className="field">
        <span className="label">
          Instruments <span className={`muted ${styles.hintLight}`}>· pick your main one first</span>
        </span>
        <ToggleChips options={instrumentChoices} />
      </div>
      <div className="field">
        <span className="label">Genres</span>
        <ToggleChips options={genreChoices} />
      </div>
      <div className="field-row">
        <label className="field">
          <span className="label">Years playing</span>
          <input className="input" name="yearsPlaying" inputMode="numeric" defaultValue={profileDraft.yearsPlaying} />
        </label>
        <SelectField label="Skill level" name="skill" options={skillOptions} />
      </div>
      <div className="field">
        <span className="label">When are you usually free?</span>
        <ToggleChips options={availabilityChoices} />
      </div>
      <StepActions back={routes.onboarding.about} next={routes.onboarding.privacy} />
    </>
  );
}
