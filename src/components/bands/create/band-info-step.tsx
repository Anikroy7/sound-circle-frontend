"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import { useBandWizard } from "@/components/bands/create/band-wizard";
import { PracticeLocationSelect, type PracticeLocation } from "@/components/bands/create/practice-location-select";
import styles from "@/components/bands/bands.module.css";
import { GenrePicker } from "@/components/onboarding/steps/genres-step";
import onboarding from "@/components/onboarding/onboarding.module.css";
import { Avatar } from "@/components/ui/avatar";
import { ApiError, apiErrorMessage, getBandLogoTicket, saveBandDraft, setBandLogo } from "@/lib/api";
import { BAND_LIMITS, BAND_TYPES } from "@/lib/band-steps";
import { UploadError, uploadToCloudinary } from "@/lib/cloudinary-upload";
import { MAX_SOURCE_PHOTO_BYTES, shrinkImage } from "@/lib/image-shrink";
import { initialsOf } from "@/lib/person";
import { formatBytes, LIMITS } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { Band, BandType } from "@/types/band-api";

const LOGO_FORMATS = ["jpg", "jpeg", "png", "webp"];
/** A logo is shown at most 144 px wide; 1024 keeps it sharp anywhere. */
const LOGO_EDGE = 1024;

/** Shrinks, uploads and saves a logo for an existing band. */
async function uploadLogo(bandId: number, file: File, onProgress: (fraction: number) => void): Promise<Band> {
  const ticket = await getBandLogoTicket(bandId);
  const publicId = await uploadToCloudinary(ticket, file, onProgress);
  return setBandLogo(bandId, publicId);
}

/** Step 1: logo, name, genres, practice location, description and band type. Continue creates or updates the draft. */
export function BandInfoStep(): React.JSX.Element {
  const router = useRouter();
  const { band, setBand, genres } = useBandWizard();
  const input = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(band?.name ?? "");
  const [genreIds, setGenreIds] = useState<number[]>(band?.genres.map((genre) => genre.id) ?? []);
  const [location, setLocation] = useState<PracticeLocation | null>(band?.location ? { id: band.location.id, label: band.location.label } : null);
  const [bio, setBio] = useState(band?.bio ?? "");
  const [bandType, setBandType] = useState<BandType | null>(band?.band_type ?? null);

  /** Before the draft exists, the chosen logo waits here and uploads right after the first save. */
  const [pendingLogo, setPendingLogo] = useState<{ file: File; preview: string } | null>(null);
  const [logoStatus, setLogoStatus] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Each preview URL is released once it is replaced or the form goes away.
  useEffect(
    () => () => {
      if (pendingLogo) URL.revokeObjectURL(pendingLogo.preview);
    },
    [pendingLogo],
  );

  const trimmedName = name.trim();
  const bioLength = bio.trim().length;
  const errors = {
    name: !trimmedName ? "Enter the band's name." : trimmedName.length < BAND_LIMITS.nameMin ? `Use at least ${BAND_LIMITS.nameMin} characters.` : null,
    genres: genreIds.length ? null : "Pick at least one genre the band performs.",
    location: location ? null : "Choose where the band practises.",
    bio: !bioLength
      ? "Write a short description of the band."
      : bioLength < BAND_LIMITS.bioMin
        ? `Write at least ${BAND_LIMITS.bioMin} characters — ${BAND_LIMITS.bioMin - bioLength} to go.`
        : null,
    type: bandType ? null : "Say whether the band is new or already playing.",
  };
  const shown = (key: keyof typeof errors): string | null => (showErrors ? errors[key] : null);
  const busy = pending || logoStatus !== null;

  const chooseLogo = async (files: FileList | null): Promise<void> => {
    const original = files?.[0];
    if (input.current) input.current.value = "";
    if (!original) return;
    setLogoError(null);

    const extension = original.name.split(".").pop()?.toLowerCase() ?? "";
    if (!LOGO_FORMATS.includes(extension)) return setLogoError("Use a JPG, PNG or WebP image.");
    if (original.size > MAX_SOURCE_PHOTO_BYTES) return setLogoError(`${formatBytes(original.size)} is too large.`);

    setLogoStatus("Optimizing…");
    const file = await shrinkImage(original, LOGO_EDGE);
    if (file.size > LIMITS.fileBytes) {
      setLogoStatus(null);
      return setLogoError(`${formatBytes(file.size)} is still over 10 MB. Try a smaller image.`);
    }

    if (!band) {
      setPendingLogo({ file, preview: URL.createObjectURL(file) });
      setLogoStatus(null);
      return;
    }
    try {
      setBand(await uploadLogo(band.id, file, (fraction) => setLogoStatus(`Uploading… ${Math.round(fraction * 100)}%`)));
    } catch (failure) {
      setLogoError(failure instanceof UploadError ? `Upload failed: ${failure.message}` : apiErrorMessage(failure));
    } finally {
      setLogoStatus(null);
    }
  };

  const save = async (): Promise<void> => {
    setShowErrors(true);
    if (Object.values(errors).some(Boolean) || !location || !bandType) return;
    setPending(true);
    setFormError(null);

    let saved: Band;
    try {
      saved = await saveBandDraft({ name: trimmedName, genre_ids: genreIds, location_id: location.id, bio: bio.trim(), band_type: bandType });
      setBand(saved);
    } catch (failure) {
      setPending(false);
      if (failure instanceof ApiError && failure.status === 401) return router.push(routes.login);
      return setFormError(apiErrorMessage(failure));
    }

    if (pendingLogo) {
      try {
        setBand(await uploadLogo(saved.id, pendingLogo.file, (fraction) => setLogoStatus(`Uploading logo… ${Math.round(fraction * 100)}%`)));
        setPendingLogo(null);
      } catch (failure) {
        // The band is saved; only the logo is not. Stay, so it can be tried again.
        setLogoStatus(null);
        setPending(false);
        setPendingLogo(null);
        return setLogoError(`Your band is saved, but the logo didn't upload: ${failure instanceof UploadError ? failure.message : apiErrorMessage(failure)}`);
      }
    }
    router.push(routes.createBandStep.members);
  };

  const logoUrl = pendingLogo?.preview ?? band?.logo_url ?? null;

  return (
    <form
      className={onboarding.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void save();
      }}
    >
      <div className={styles.logoRow}>
        <div className={`field ${styles.logoField}`}>
          <span className="label">
            Band logo <span className="muted">(optional)</span>
          </span>
          <Avatar initials={trimmedName ? initialsOf(trimmedName) : "?"} tone="violet" size={104} shape="square" photoUrl={logoUrl} className="display" />
          <input
            ref={input}
            type="file"
            accept={LOGO_FORMATS.map((format) => `.${format}`).join(",")}
            className="visually-hidden"
            tabIndex={-1}
            onChange={(event) => void chooseLogo(event.target.files)}
          />
          <button type="button" className={`btn btn-ghost btn-sm ${styles.changeLogo}`} onClick={() => input.current?.click()} disabled={busy}>
            {logoUrl ? "Change logo" : "Upload logo"}
          </button>
          {logoStatus && (
            <span className="muted" aria-live="polite">
              {logoStatus}
            </span>
          )}
          {!band && pendingLogo && <span className="field-hint">Uploads when you continue.</span>}
          {logoError && (
            <span className="field-error" role="alert">
              {logoError}
            </span>
          )}
        </div>

        <div className={styles.logoFields}>
          <label className="field">
            <span className="label">
              Band name <span className={styles.required}>*</span>
            </span>
            <input
              className="input"
              name="name"
              value={name}
              maxLength={BAND_LIMITS.nameMax}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={!!shown("name")}
              aria-describedby={shown("name") ? "band-name-error" : undefined}
            />
            {shown("name") && <FieldError id="band-name-error">{shown("name")}</FieldError>}
          </label>

          <div className="field">
            <span className="label">
              Band type <span className={styles.required}>*</span>
            </span>
            <div className={styles.segments} role="radiogroup" aria-label="Band type">
              {BAND_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  role="radio"
                  aria-checked={bandType === type.value}
                  className={styles.segment}
                  onClick={() => setBandType(type.value)}
                >
                  <strong>{type.label}</strong>
                  <span className={`muted ${styles.small}`}>{type.hint}</span>
                </button>
              ))}
            </div>
            {shown("type") && <FieldError id="band-type-error">{shown("type")}</FieldError>}
          </div>
        </div>
      </div>

      <GenrePicker
        id="band-genres"
        legend="Music genres"
        hint="Every genre the band performs."
        genres={genres}
        selected={genreIds}
        onChange={setGenreIds}
        limit={BAND_LIMITS.genres}
        error={shown("genres")}
      />

      <PracticeLocationSelect value={location} onChange={setLocation} error={shown("location")} />

      <label className="field">
        <span className="label">
          Description <span className={styles.required}>*</span>
        </span>
        <textarea
          className="input"
          name="bio"
          rows={5}
          maxLength={BAND_LIMITS.bioMax}
          value={bio}
          onChange={(event) => setBio(event.target.value)}
          placeholder="Your sound, influences, what you're working on and how often you rehearse."
          aria-invalid={!!shown("bio")}
          aria-describedby="band-bio-hint band-bio-error"
        />
        <span className={onboarding.sectionHead}>
          <span id="band-bio-hint" className="field-hint">
            At least {BAND_LIMITS.bioMin} characters, so musicians know what you&apos;re about.
          </span>
          <span className={onboarding.counter}>
            {bio.length} / {BAND_LIMITS.bioMax}
          </span>
        </span>
        {shown("bio") && <FieldError id="band-bio-error">{shown("bio")}</FieldError>}
      </label>

      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}
      <div className={styles.actionsEnd}>
        <button type="submit" className="btn btn-primary" disabled={busy}>
          {pending ? "Saving…" : "Continue to members"}
        </button>
      </div>
    </form>
  );
}
