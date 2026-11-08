"use client";

import { useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import { MediaUploader } from "@/components/onboarding/media/media-uploader";
import { VideoLinksEditor } from "@/components/onboarding/media/video-links-editor";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { apiErrorMessage, completeBandExperience, profileUploadEndpoints, createBandExperience, removeBandExperience, updateBandExperience } from "@/lib/api";
import { LIMITS, VIDEO_PROVIDER_NAMES } from "@/lib/profile-steps";
import type { BandExperience } from "@/types/profile";

interface BandFormProps {
  /** Null to add a band. */
  band: BandExperience | null;
  onDone: () => void;
  onDirtyChange: (dirty: boolean) => void;
}

/** Add or edit one band. Saving creates it right away, so its photos can be uploaded next. */
function BandForm({ band, onDone, onDirtyChange }: BandFormProps): React.JSX.Element {
  const { setProfile } = useWizard();
  const [name, setName] = useState(band?.band_name ?? "");
  const [role, setRole] = useState(band?.role ?? "");
  const [current, setCurrent] = useState(band?.is_current ?? false);
  const [videoUrls, setVideoUrls] = useState(band?.videos.map((video) => video.url) ?? []);
  const [hasDraft, setHasDraft] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const nameError = name.trim() ? null : "Enter the band's name.";
  const roleError = role.trim() ? null : "Enter your role or what you played.";
  const touch = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    onDirtyChange(true);
  };

  const save = async (): Promise<void> => {
    setShowErrors(true);
    if (nameError || roleError || hasDraft) return;
    setSaving(true);
    setError(null);
    const request = { band_name: name.trim(), role: role.trim(), is_current: current, video_urls: videoUrls };
    try {
      setProfile(band ? await updateBandExperience(band.id, request) : await createBandExperience(request));
      onDirtyChange(false);
      onDone();
    } catch (failure) {
      setError(apiErrorMessage(failure));
      setSaving(false);
    }
  };

  return (
    // A fieldset, not a nested <form>: it lives inside the step's form.
    <fieldset className={`card fieldset ${styles.bandForm}`}>
      <legend className="visually-hidden">{band ? `Edit ${band.band_name}` : "Add a band"}</legend>
      <strong>{band ? `Edit ${band.band_name}` : "Add a band"}</strong>
      <label className="field">
        <span className="label">Band name</span>
        <input
          className="input"
          value={name}
          maxLength={LIMITS.bandName}
          onChange={(event) => touch(setName)(event.target.value)}
          aria-invalid={showErrors && !!nameError}
          aria-describedby="band-name-error"
        />
        {showErrors && nameError && <FieldError id="band-name-error">{nameError}</FieldError>}
      </label>
      <label className="field">
        <span className="label">Your role or instruments</span>
        <input
          className="input"
          value={role}
          maxLength={LIMITS.bandRole}
          placeholder="e.g. Lead guitar, backing vocals"
          onChange={(event) => touch(setRole)(event.target.value)}
          aria-invalid={showErrors && !!roleError}
          aria-describedby="band-role-error"
        />
        {showErrors && roleError && <FieldError id="band-role-error">{roleError}</FieldError>}
      </label>
      <label className="check">
        <input type="checkbox" checked={current} onChange={(event) => touch(setCurrent)(event.target.checked)} />
        I&apos;m currently in this band
      </label>
      <VideoLinksEditor
        urls={videoUrls}
        onChange={touch(setVideoUrls)}
        limit={LIMITS.bandVideos}
        onDraftChange={setHasDraft}
        draftError={showErrors && hasDraft ? "Add the link you pasted, or clear the box." : null}
      />
      <span className="field-hint">{band ? "Photos are managed on the band card." : "You can add photos once the band is saved."}</span>
      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}
      <div className={styles.bandButtons}>
        <button type="button" className="btn btn-primary btn-sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : band ? "Save changes" : "Save band"}
        </button>
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={() => {
            onDirtyChange(false);
            onDone();
          }}
          disabled={saving}
        >
          Cancel
        </button>
      </div>
    </fieldset>
  );
}

interface BandCardProps {
  band: BandExperience;
  onEdit: () => void;
  onBusyChange: (busy: boolean) => void;
}

function BandCard({ band, onEdit, onBusyChange }: BandCardProps): React.JSX.Element {
  const { setProfile } = useWizard();
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = async (): Promise<void> => {
    setRemoving(true);
    setError(null);
    try {
      setProfile(await removeBandExperience(band.id));
    } catch (failure) {
      setError(apiErrorMessage(failure));
      setRemoving(false);
      setConfirming(false);
    }
  };

  return (
    <li className={`card ${styles.bandCard}`}>
      <div className={styles.bandHead}>
        <div className={styles.bandTitle}>
          <span className={styles.bandName}>
            {band.band_name}
            {band.is_current && <span className="chip chip-teal">Current</span>}
          </span>
          <span className="muted">{band.role}</span>
        </div>
        {!confirming && (
          <div className={styles.bandButtons}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onEdit}>
              Edit
            </button>
            <button type="button" className="btn btn-danger btn-sm" onClick={() => setConfirming(true)}>
              Remove
            </button>
          </div>
        )}
      </div>

      {confirming && (
        <div className={`inset ${styles.confirm}`}>
          <span>Remove {band.band_name}? Its photos and video links will be deleted too.</span>
          <span className={styles.bandButtons}>
            <button type="button" className="btn btn-danger btn-sm" onClick={remove} disabled={removing}>
              {removing ? "Removing…" : "Remove band"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(false)} disabled={removing}>
              Keep
            </button>
          </span>
        </div>
      )}
      {error && (
        <span className="field-error" role="alert">
          {error}
        </span>
      )}

      <MediaUploader
        mediaType={1}
        endpoints={profileUploadEndpoints({ media_type: 1, band_experience_id: band.id })}
        items={band.photos}
        limit={LIMITS.bandPhotos}
        label="Performance photos"
        hint="JPG, PNG or WebP. Large photos are resized before upload, so they go up quickly."
        onSaved={setProfile}
        onBusyChange={onBusyChange}
      />

      {band.videos.length > 0 && (
        <div className={styles.section}>
          <span className="label">Video links</span>
          <ul className={styles.videoList}>
            {band.videos.map((video) => (
              <li key={video.id} className={`inset ${styles.videoItem}`}>
                <span className="chip chip-teal">{VIDEO_PROVIDER_NAMES[video.provider]}</span>
                <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.videoUrl}>
                  {video.url}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

/** Step 8, the last: have you played in a band, and if so, which. Each band saves on its own. */
export function BandExperienceStep(): React.JSX.Element {
  const { profile, submit, setError } = useWizard();
  const bands = profile.band_experiences;
  const [answer, setAnswer] = useState<boolean | null>(bands.length ? true : profile.setup_step >= 8 ? false : null);
  /** The band being edited, "new" while adding one, null when no form is open. */
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [dirty, setDirty] = useState(false);
  const [uploads, setUploads] = useState(0);

  const onBusyChange = (busy: boolean): void => setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));
  // Answering "yes" with nothing saved yet opens the form straight away.
  const formOpen = editing !== null || (answer === true && bands.length === 0);

  const save = (mode: SaveMode): void => {
    if (answer === null) return setError("Choose Yes or No.");
    if (answer && formOpen && dirty) return setError("Save or cancel the band you're editing first.");
    if (answer && !bands.length) return setError("Add at least one band, or choose No.");
    if (!answer && bands.length) return setError("Remove the bands you added, or choose Yes.");
    void submit(mode, () => completeBandExperience(answer));
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
        <legend className="label">Are you in a band now, or have you been in one?</legend>
        <div className={styles.choices}>
          <label className={styles.choice}>
            <input
              type="radio"
              name="has-band"
              checked={answer === true}
              onChange={() => {
                setAnswer(true);
                setError(null);
              }}
            />
            <span className={styles.choiceText}>
              <strong>Yes</strong>
              <span className="muted">Add the bands, your role, photos and videos.</span>
            </span>
          </label>
          <label className={styles.choice}>
            <input
              type="radio"
              name="has-band"
              checked={answer === false}
              onChange={() => {
                setAnswer(false);
                setEditing(null);
                setError(null);
              }}
            />
            <span className={styles.choiceText}>
              <strong>No, not yet</strong>
              <span className="muted">That&apos;s fine. This is where it starts.</span>
            </span>
          </label>
        </div>
      </fieldset>

      {answer === false && bands.length > 0 && (
        <FieldError id="bands-conflict">You still have {bands.length === 1 ? "a band" : `${bands.length} bands`} listed below. Remove them, or choose Yes.</FieldError>
      )}

      {(answer === true || bands.length > 0) && (
        <div className={styles.section}>
          {bands.length > 0 && (
            <ul className={styles.queue}>
              {bands.map((band) =>
                editing === band.id ? (
                  <li key={band.id}>
                    <BandForm band={band} onDone={() => setEditing(null)} onDirtyChange={setDirty} />
                  </li>
                ) : (
                  <BandCard key={band.id} band={band} onEdit={() => setEditing(band.id)} onBusyChange={onBusyChange} />
                ),
              )}
            </ul>
          )}

          {formOpen && editing !== null && editing !== "new" ? null : formOpen ? (
            <BandForm band={null} onDone={() => setEditing(null)} onDirtyChange={setDirty} />
          ) : (
            answer === true &&
            bands.length < LIMITS.bands && (
              <button type="button" className={`btn btn-secondary btn-sm ${styles.addButton}`} onClick={() => setEditing("new")}>
                + Add another band
              </button>
            )
          )}
        </div>
      )}
      <StepActions onSave={save} busy={uploads > 0} busyLabel="Uploading…" />
    </form>
  );
}
