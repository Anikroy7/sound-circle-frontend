"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import { LocationPicker, toLocationPicks, type LocationPick } from "@/components/onboarding/location-picker";
import { ProfilePhoto } from "@/components/onboarding/media/profile-photo";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { saveAbout } from "@/lib/api";
import { useCurrentUser } from "@/lib/auth-session";
import { LIMITS } from "@/lib/profile-steps";

/** Step 1: a profile photo (optional, saves as it uploads), where you're based, and a short bio. */
export function AboutStep(): React.JSX.Element {
  const { profile, submit, setProfile } = useWizard();
  const user = useCurrentUser();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [locations, setLocations] = useState<LocationPick[]>(() => toLocationPicks(profile.locations));
  const [showErrors, setShowErrors] = useState(false);
  const [uploading, setUploading] = useState(false);

  const length = bio.trim().length;
  const bioError = !length
    ? "Write a few lines about yourself."
    : length < LIMITS.bioMin
      ? `Write at least ${LIMITS.bioMin} characters — ${LIMITS.bioMin - length} to go.`
      : null;
  const locationError = locations.length ? null : "Add at least one location.";

  const save = (mode: SaveMode): void => {
    setShowErrors(true);
    if (bioError || locationError) return;
    void submit(mode, () =>
      saveAbout(
        bio.trim(),
        locations.map((pick) => pick.id),
      ),
    );
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
      <div className="field">
        <span className="label">
          Profile photo <span className="muted">(optional)</span>
        </span>
        <ProfilePhoto
          photoUrl={profile.photo_url}
          name={user?.name ?? ""}
          userId={user?.id ?? 0}
          size={88}
          onProfile={setProfile}
          onBusyChange={setUploading}
        />
      </div>

      <LocationPicker value={locations} onChange={setLocations} limit={LIMITS.locations} error={showErrors ? locationError : null} />

      <label className="field">
        <span className="label">About me</span>
        <textarea
          className="input"
          name="bio"
          rows={7}
          maxLength={LIMITS.bioMax}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          onBlur={() => length > 0 && setShowErrors(true)}
          placeholder="e.g. Lead guitarist from Dhanmondi. I've played blues and classic rock for eight years with two college bands, and I'm looking to write original music."
          aria-invalid={showErrors && !!bioError}
          aria-describedby="about-hint about-error"
        />
        <span className={styles.sectionHead}>
          <span id="about-hint" className="field-hint">
            Your musical background, experience and what you&apos;re into.
          </span>
          <span className={styles.counter} aria-live="polite">
            {bio.length} / {LIMITS.bioMax}
          </span>
        </span>
        {showErrors && bioError && <FieldError id="about-error">{bioError}</FieldError>}
      </label>
      <StepActions onSave={save} busy={uploading} busyLabel="Uploading…" />
    </form>
  );
}
