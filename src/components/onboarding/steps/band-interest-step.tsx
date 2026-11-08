"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { saveBandInterest } from "@/lib/api";
import { BAND_INTEREST } from "@/lib/profile-steps";

interface ChoiceProps {
  name: string;
  checked: boolean;
  onChange: () => void;
  title: string;
  detail: string;
}

function Choice({ name, checked, onChange, title, detail }: ChoiceProps): React.JSX.Element {
  return (
    <label className={styles.choice}>
      <input type="radio" name={name} checked={checked} onChange={onChange} />
      <span className={styles.choiceText}>
        <strong>{title}</strong>
        <span className="muted">{detail}</span>
      </span>
    </label>
  );
}

/** Step 6: two questions, stored as one `BandInterest`. */
export function BandInterestStep(): React.JSX.Element {
  const { profile, submit } = useWizard();
  const saved = profile.band_interest;
  const [wantsBand, setWantsBand] = useState<boolean | null>(saved === null ? null : saved !== BAND_INTEREST.NOT_INTERESTED);
  const [existingBand, setExistingBand] = useState<boolean | null>(
    saved === BAND_INTEREST.OPEN_TO_EXISTING_BAND ? true : saved === BAND_INTEREST.NEW_BAND_ONLY ? false : null,
  );
  const [showErrors, setShowErrors] = useState(false);

  const error = wantsBand === null ? "Choose an answer." : wantsBand && existingBand === null ? "Tell us whether you'd join an existing band." : null;

  const save = (mode: SaveMode): void => {
    setShowErrors(true);
    if (error) return;
    const value = !wantsBand ? BAND_INTEREST.NOT_INTERESTED : existingBand ? BAND_INTEREST.OPEN_TO_EXISTING_BAND : BAND_INTEREST.NEW_BAND_ONLY;
    void submit(mode, () => saveBandInterest(value));
  };

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        save("next");
      }}
    >
      <fieldset className="fieldset">
        <legend className="label">Are you interested in joining a band?</legend>
        <div className={styles.choices}>
          <Choice
            name="wants-band"
            checked={wantsBand === true}
            onChange={() => setWantsBand(true)}
            title="Yes, I'm looking"
            detail="Show me to bands that are recruiting."
          />
          <Choice
            name="wants-band"
            checked={wantsBand === false}
            onChange={() => setWantsBand(false)}
            title="Not right now"
            detail="I'm here for sessions, jams or to connect."
          />
        </div>
      </fieldset>

      {wantsBand && (
        <fieldset className="fieldset">
          <legend className="label">Would you join an existing band?</legend>
          <div className={styles.choices}>
            <Choice
              name="existing-band"
              checked={existingBand === true}
              onChange={() => setExistingBand(true)}
              title="Yes, I'd join an existing band"
              detail="Bands with an open spot can invite you."
            />
            <Choice
              name="existing-band"
              checked={existingBand === false}
              onChange={() => setExistingBand(false)}
              title="I'd rather start a new band"
              detail="Connect me with musicians forming one."
            />
          </div>
        </fieldset>
      )}

      {showErrors && error && <FieldError id="band-interest-error">{error}</FieldError>}
      <StepActions onSave={save} />
    </form>
  );
}
