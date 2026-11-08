"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { saveContact } from "@/lib/api";

/** The API's normalisation, mirrored for instant feedback: local Bangladeshi numbers gain +880. */
function toE164(value: string): string {
  const compact = value.trim().replace(/[\s\-().]/g, "");
  if (/^01\d{9}$/.test(compact)) return `+88${compact}`;
  if (/^8801\d{9}$/.test(compact)) return `+${compact}`;
  if (/^00[1-9]/.test(compact)) return `+${compact.slice(2)}`;
  return compact;
}

/** "+8801712345678" → "01712-345678", the way Bangladeshi numbers are usually written. */
function toLocal(e164: string | null): string {
  if (!e164) return "";
  return /^\+8801\d{9}$/.test(e164) ? `${e164.slice(3, 8)}-${e164.slice(8)}` : e164;
}

/** Step 4: phone (required) and whether it shows on the public profile. */
export function ContactStep(): React.JSX.Element {
  const { profile, submit } = useWizard();
  const [phone, setPhone] = useState(toLocal(profile.phone));
  const [showPhone, setShowPhone] = useState(profile.show_phone);
  const [showError, setShowError] = useState(false);

  const normalized = toE164(phone);
  const error = !phone.trim()
    ? "Enter your mobile number."
    : !/^\+[1-9]\d{7,14}$/.test(normalized)
      ? "Enter a valid mobile number, e.g. 01712-345678."
      : null;

  const save = (mode: SaveMode): void => {
    setShowError(true);
    if (!error) void submit(mode, () => saveContact(normalized, showPhone));
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
      <label className="field">
        <span className="label">Mobile number</span>
        <input
          className="input"
          type="tel"
          name="phone"
          inputMode="tel"
          autoComplete="tel"
          placeholder="01712-345678"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          onBlur={() => phone.trim() && setShowError(true)}
          aria-invalid={showError && !!error}
          aria-describedby="phone-hint phone-error"
        />
        <span id="phone-hint" className="field-hint">
          A Bangladeshi number, or any number with its country code (+44…).
        </span>
        {showError && error && <FieldError id="phone-error">{error}</FieldError>}
      </label>

      <label className={styles.choice}>
        <input type="checkbox" checked={showPhone} onChange={(event) => setShowPhone(event.target.checked)} />
        <span className={styles.choiceText}>
          <strong>Show my phone number on my public profile</strong>
          <span className="muted">
            {showPhone ? "Anyone viewing your profile can see and call it." : "Hidden: only you can see it. You can change this any time."}
          </span>
        </span>
      </label>
      <StepActions onSave={save} />
    </form>
  );
}
