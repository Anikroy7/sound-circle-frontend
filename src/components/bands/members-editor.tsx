"use client";

import { useEffect, useId, useRef, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/bands/bands.module.css";
import { Avatar } from "@/components/ui/avatar";
import { addBandMember, apiErrorMessage, getMemberPhotoTicket, removeBandMember, searchMemberCandidates } from "@/lib/api";
import { BAND_LIMITS } from "@/lib/band-steps";
import { UploadError, uploadToCloudinary } from "@/lib/cloudinary-upload";
import { MAX_SOURCE_PHOTO_BYTES, shrinkImage } from "@/lib/image-shrink";
import { initialsOf, toneFor } from "@/lib/person";
import { formatBytes, LIMITS } from "@/lib/profile-steps";
import type { Band, MemberCandidate } from "@/types/band-api";

const PHOTO_FORMATS = ["jpg", "jpeg", "png", "webp"];
const SEARCH_DELAY_MS = 300;

/** Search SoundCircle and add a user, optionally with their role in the band. */
function MemberSearch({ band, onBand, full }: { band: Band; onBand: (band: Band) => void; full: boolean }): React.JSX.Element {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<MemberCandidate[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [chosen, setChosen] = useState<MemberCandidate | null>(null);
  const [position, setPosition] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  const text = query.trim();

  // Debounced: one request once typing pauses; a stale answer never replaces a newer one.
  useEffect(() => {
    if (text.length < BAND_LIMITS.searchMin) return;
    let live = true;
    const timer = setTimeout(() => {
      setSearching(true);
      searchMemberCandidates(band.id, text).then(
        (found) => {
          if (!live) return;
          setResults(found);
          setSearchError(null);
          setSearching(false);
        },
        (failure: unknown) => {
          if (!live) return;
          setSearchError(apiErrorMessage(failure));
          setSearching(false);
        },
      );
    }, SEARCH_DELAY_MS);
    return () => {
      live = false;
      clearTimeout(timer);
    };
  }, [band.id, text]);

  const add = async (): Promise<void> => {
    if (!chosen) return;
    setAdding(true);
    setAddError(null);
    try {
      onBand(await addBandMember(band.id, { user_id: chosen.id, ...(position.trim() ? { position: position.trim() } : {}) }));
      setResults((current) => current?.filter((candidate) => candidate.id !== chosen.id) ?? null);
      setChosen(null);
      setPosition("");
    } catch (failure) {
      setAddError(apiErrorMessage(failure));
    } finally {
      setAdding(false);
    }
  };

  const showResults = text.length >= BAND_LIMITS.searchMin;

  return (
    <section className={`inset ${styles.memberSection}`} aria-labelledby={`${inputId}-title`}>
      <strong id={`${inputId}-title`}>Add a SoundCircle member</strong>
      <label className="field">
        <span className="label">Search by name</span>
        <input
          id={inputId}
          className="input"
          type="search"
          value={query}
          placeholder="e.g. Rafiq"
          autoComplete="off"
          disabled={full}
          onChange={(event) => {
            setQuery(event.target.value);
            setChosen(null);
            if (event.target.value.trim().length < BAND_LIMITS.searchMin) setResults(null);
          }}
        />
        <span className="field-hint">Type at least {BAND_LIMITS.searchMin} letters.</span>
      </label>

      {searchError && (
        <span className="field-error" role="alert">
          {searchError}
        </span>
      )}
      {showResults && (
        <div aria-live="polite">
          {searching && !results ? (
            <span className="muted">Searching…</span>
          ) : results && results.length === 0 ? (
            <span className="muted">No SoundCircle members match &ldquo;{text}&rdquo;. You can add them below as someone not on SoundCircle.</span>
          ) : (
            <ul className={styles.candidateList}>
              {results?.map((candidate) => (
                <li key={candidate.id} className={styles.candidate}>
                  <Avatar initials={initialsOf(candidate.name)} tone={toneFor(candidate.id)} size={40} photoUrl={candidate.photo_url} />
                  <span className={styles.candidateText}>
                    <strong>{candidate.name}</strong>
                    <span className={`muted ${styles.small}`}>{candidate.instruments ?? "No instruments on their profile yet"}</span>
                  </span>
                  {chosen?.id !== candidate.id && (
                    <button type="button" className="btn btn-secondary btn-sm" onClick={() => setChosen(candidate)} disabled={full}>
                      Select
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {chosen && (
        <div className={`card ${styles.memberConfirm}`}>
          <span>
            Add <strong>{chosen.name}</strong> to the band
          </span>
          <label className="field">
            <span className="label">
              Their role or instrument <span className="muted">(optional)</span>
            </span>
            <input className="input" value={position} maxLength={BAND_LIMITS.position} placeholder="e.g. Lead guitar" onChange={(event) => setPosition(event.target.value)} />
          </label>
          {addError && (
            <span className="field-error" role="alert">
              {addError}
            </span>
          )}
          <span className={styles.buttonPair}>
            <button type="button" className="btn btn-primary btn-sm" onClick={() => void add()} disabled={adding}>
              {adding ? "Adding…" : "Add member"}
            </button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setChosen(null)} disabled={adding}>
              Cancel
            </button>
          </span>
        </div>
      )}
    </section>
  );
}

/** Add someone who is not on SoundCircle: their name, role or instrument, and (optionally) a photo. */
function ExternalMemberForm({ band, onBand, full }: { band: Band; onBand: (band: Band) => void; full: boolean }): React.JSX.Element {
  const fileInput = useRef<HTMLInputElement>(null);
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  /** The photo is uploaded as soon as it is chosen; the member is saved with its id. */
  const [photo, setPhoto] = useState<{ publicId: string; preview: string } | null>(null);
  const [photoStatus, setPhotoStatus] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showErrors, setShowErrors] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (photo) URL.revokeObjectURL(photo.preview);
    },
    [photo],
  );

  const errors = { name: name.trim() ? null : "Enter their name.", position: position.trim() ? null : "Enter their role or instrument." };

  const choosePhoto = async (files: FileList | null): Promise<void> => {
    const original = files?.[0];
    if (fileInput.current) fileInput.current.value = "";
    if (!original) return;
    setPhotoError(null);
    const extension = original.name.split(".").pop()?.toLowerCase() ?? "";
    if (!PHOTO_FORMATS.includes(extension)) return setPhotoError("Use a JPG, PNG or WebP photo.");
    if (original.size > MAX_SOURCE_PHOTO_BYTES) return setPhotoError(`${formatBytes(original.size)} is too large.`);

    try {
      setPhotoStatus("Optimizing…");
      const file = await shrinkImage(original, 1024);
      if (file.size > LIMITS.fileBytes) throw new UploadError(`${formatBytes(file.size)} is still over 10 MB`);
      const ticket = await getMemberPhotoTicket(band.id);
      const publicId = await uploadToCloudinary(ticket, file, (fraction) => setPhotoStatus(`Uploading… ${Math.round(fraction * 100)}%`));
      setPhoto({ publicId, preview: URL.createObjectURL(file) });
    } catch (failure) {
      setPhotoError(failure instanceof UploadError ? `Upload failed: ${failure.message}` : apiErrorMessage(failure));
    } finally {
      setPhotoStatus(null);
    }
  };

  const add = async (): Promise<void> => {
    setShowErrors(true);
    if (errors.name || errors.position) return;
    setAdding(true);
    setAddError(null);
    try {
      onBand(await addBandMember(band.id, { name: name.trim(), position: position.trim(), ...(photo ? { photo_public_id: photo.publicId } : {}) }));
      setName("");
      setPosition("");
      setPhoto(null);
      setShowErrors(false);
    } catch (failure) {
      setAddError(apiErrorMessage(failure));
    } finally {
      setAdding(false);
    }
  };

  return (
    <section className={`inset ${styles.memberSection}`} aria-label="Add someone not on SoundCircle">
      <strong>Add someone not on SoundCircle</strong>
      <div className={styles.externalRow}>
        <div className={styles.externalPhoto}>
          <Avatar initials={name.trim() ? initialsOf(name) : "?"} tone="slate" size={64} photoUrl={photo?.preview} />
          <input
            ref={fileInput}
            type="file"
            accept={PHOTO_FORMATS.map((format) => `.${format}`).join(",")}
            className="visually-hidden"
            tabIndex={-1}
            onChange={(event) => void choosePhoto(event.target.files)}
          />
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileInput.current?.click()} disabled={!!photoStatus || full}>
            {photo ? "Change photo" : "Add photo"}
          </button>
        </div>
        <div className={styles.externalFields}>
          <label className="field">
            <span className="label">Name</span>
            <input
              className="input"
              value={name}
              maxLength={BAND_LIMITS.memberName}
              disabled={full}
              onChange={(event) => setName(event.target.value)}
              aria-invalid={showErrors && !!errors.name}
              aria-describedby="external-name-error"
            />
            {showErrors && errors.name && <FieldError id="external-name-error">{errors.name}</FieldError>}
          </label>
          <label className="field">
            <span className="label">Role or instrument</span>
            <input
              className="input"
              value={position}
              maxLength={BAND_LIMITS.position}
              placeholder="e.g. Drums"
              disabled={full}
              onChange={(event) => setPosition(event.target.value)}
              aria-invalid={showErrors && !!errors.position}
              aria-describedby="external-position-error"
            />
            {showErrors && errors.position && <FieldError id="external-position-error">{errors.position}</FieldError>}
          </label>
        </div>
      </div>
      {photoStatus && (
        <span className="muted" aria-live="polite">
          {photoStatus}
        </span>
      )}
      {photoError && (
        <span className="field-error" role="alert">
          {photoError}
        </span>
      )}
      {addError && (
        <span className="field-error" role="alert">
          {addError}
        </span>
      )}
      <button type="button" className={`btn btn-secondary btn-sm ${styles.alignStart}`} onClick={() => void add()} disabled={adding || !!photoStatus || full}>
        {adding ? "Adding…" : "Add member"}
      </button>
    </section>
  );
}

/**
 * The band's line-up and the two ways to grow it: a SoundCircle user from the search, or someone outside
 * it. Every change saves at once. Used by creation step 2 and by the band page's Invite Members.
 */
export function MembersEditor({ band, onBand }: { band: Band; onBand: (band: Band) => void }): React.JSX.Element {
  const [confirming, setConfirming] = useState<number | null>(null);
  const [removing, setRemoving] = useState<number | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);
  const full = band.members.length >= BAND_LIMITS.members;

  const remove = async (memberId: number): Promise<void> => {
    setRemoving(memberId);
    setRemoveError(null);
    try {
      onBand(await removeBandMember(band.id, memberId));
    } catch (failure) {
      setRemoveError(apiErrorMessage(failure));
    } finally {
      setRemoving(null);
      setConfirming(null);
    }
  };

  return (
    <div className={styles.membersEditor}>
      <div className={styles.memberSection}>
        <span className={styles.sectionHead}>
          <strong>Line-up</strong>
          <span className={`muted ${styles.small}`}>
            {band.members.length} / {BAND_LIMITS.members}
          </span>
        </span>
        <ul className={styles.lineup} aria-live="polite">
          {band.members.map((member) => (
            <li key={member.id} className={`inset ${styles.lineupRow}`}>
              <Avatar initials={initialsOf(member.name)} tone={member.user_id ? toneFor(member.user_id) : "slate"} size={40} photoUrl={member.photo_url} />
              <span className={styles.candidateText}>
                <strong>{member.name}</strong>
                <span className={`muted ${styles.small}`}>{member.position ?? "Role not set"}</span>
              </span>
              {member.is_owner ? (
                <span className="chip chip-violet">Owner</span>
              ) : (
                <span className={`chip ${member.user_id ? "chip-teal" : ""}`}>{member.user_id ? "On SoundCircle" : "Not on SoundCircle"}</span>
              )}
              {!member.is_owner &&
                (confirming === member.id ? (
                  <span className={styles.buttonPair}>
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => void remove(member.id)} disabled={removing === member.id}>
                      {removing === member.id ? "Removing…" : "Remove"}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(null)} disabled={removing === member.id}>
                      Keep
                    </button>
                  </span>
                ) : (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setConfirming(member.id)} aria-label={`Remove ${member.name}`}>
                    Remove
                  </button>
                ))}
            </li>
          ))}
        </ul>
        {removeError && (
          <span className="field-error" role="alert">
            {removeError}
          </span>
        )}
        {full && <span className="field-hint">The band has {BAND_LIMITS.members} members, the most allowed.</span>}
      </div>

      <MemberSearch band={band} onBand={onBand} full={full} />
      <ExternalMemberForm band={band} onBand={onBand} full={full} />
    </div>
  );
}
