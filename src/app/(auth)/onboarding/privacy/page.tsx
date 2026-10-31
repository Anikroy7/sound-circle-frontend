import type { Metadata } from "next";
import { OnboardingProgress, StepActions } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { openToChoices, privacySettings, profileDraft } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Collaboration and privacy" };

/** Drawn with an invalid sample link, as in the design. */
export default function OnboardingPrivacyPage(): React.JSX.Element {
  return (
    <>
      <OnboardingProgress step={3} />
      <h2 className={`display ${styles.stepTitle}`}>Collaboration and privacy</h2>
      <fieldset className="fieldset">
        <legend className="label">I&apos;m open to</legend>
        {openToChoices.map((choice) => (
          <label key={choice.label} className="check">
            <input type="checkbox" name="openTo" value={choice.label} defaultChecked={choice.selected} />
            {choice.label}
          </label>
        ))}
      </fieldset>
      <label className="field">
        <span className="label">
          Add a sample <span className={`muted ${styles.hintLight}`}>(YouTube, SoundCloud or Facebook video link)</span>
        </span>
        <input
          className="input"
          name="sampleLink"
          inputMode="url"
          defaultValue={profileDraft.sampleLink}
          aria-invalid="true"
          aria-describedby="sample-link-error"
        />
        <span id="sample-link-error" className="field-error">
          Paste the full video link, e.g. https://youtu.be/abc123
        </span>
      </label>
      <div className={`card ${styles.settings}`}>
        {privacySettings.map((setting) => (
          <label key={setting.title} className={styles.setting}>
            <span>
              <strong>{setting.title}</strong>
              <span className={`muted ${styles.small} ${styles.block}`}>
                {setting.hint}
              </span>
            </span>
            <select className={`input ${styles.settingSelect}`} defaultValue={setting.options[0]}>
              {setting.options.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        ))}
        <div className={styles.setting}>
          <span>
            <strong>Show me in Discover</strong>
            <span className={`muted ${styles.small} ${styles.block}`}>
              Turn off to hide your profile from search
            </span>
          </span>
          <label className="check">
            <input type="checkbox" name="discoverable" defaultChecked />
            On
          </label>
        </div>
      </div>
      <StepActions back={routes.onboarding.music} next={routes.onboarding.done} nextLabel="Finish profile" />
    </>
  );
}
