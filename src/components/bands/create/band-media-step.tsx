"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useBandWizard } from "@/components/bands/create/band-wizard";
import styles from "@/components/bands/bands.module.css";
import { MediaUploader } from "@/components/onboarding/media/media-uploader";
import { VideoLinksEditor } from "@/components/onboarding/media/video-links-editor";
import onboarding from "@/components/onboarding/onboarding.module.css";
import { ApiError, apiErrorMessage, bandPhotoEndpoints, publishBand, saveBandVideos } from "@/lib/api";
import { BAND_LIMITS } from "@/lib/band-steps";
import { routes } from "@/lib/routes";

/**
 * Step 3, optional: performance photos save as they upload; video links save on Publish, which then
 * makes the band public and opens its page.
 */
export function BandMediaStep(): React.JSX.Element {
  const router = useRouter();
  const { band, setBand } = useBandWizard();
  const [videoUrls, setVideoUrls] = useState(band?.videos.map((video) => video.url) ?? []);
  const [hasDraft, setHasDraft] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [uploads, setUploads] = useState(0);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!band) return <span className="muted">Loading…</span>;

  const onBusyChange = (busy: boolean): void => setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));

  const publish = async (): Promise<void> => {
    setShowErrors(true);
    if (hasDraft) return;
    setPending(true);
    setError(null);
    try {
      setBand(await saveBandVideos(band.id, videoUrls));
      const published = await publishBand(band.id);
      if (!published.slug) throw new Error("The band was published without an address");
      router.push(routes.band(published.slug));
    } catch (failure) {
      setPending(false);
      if (failure instanceof ApiError && failure.status === 401) return router.push(routes.login);
      setError(apiErrorMessage(failure));
    }
  };

  return (
    <form
      className={onboarding.form}
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void publish();
      }}
    >
      <p className={`muted ${styles.stepLead}`}>Photos and videos of the band playing. Both are optional, and you can publish without them.</p>

      <div className="card panel">
        <MediaUploader
          mediaType={1}
          endpoints={bandPhotoEndpoints(band.id)}
          items={band.photos}
          limit={BAND_LIMITS.photos}
          label="Performance photos"
          hint="JPG, PNG or WebP. Large photos are resized before upload, so they go up quickly."
          onSaved={setBand}
          onBusyChange={onBusyChange}
        />
      </div>

      <div className="card panel">
        <VideoLinksEditor
          urls={videoUrls}
          onChange={setVideoUrls}
          limit={BAND_LIMITS.videos}
          onDraftChange={setHasDraft}
          draftError={showErrors && hasDraft ? "Add the link you pasted, or clear the box." : null}
        />
      </div>

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}
      <div className={styles.actionsRow}>
        <Link className="btn btn-secondary" href={routes.createBandStep.members}>
          Back
        </Link>
        <button type="submit" className="btn btn-primary" disabled={pending || uploads > 0}>
          {uploads > 0 ? "Uploading…" : pending ? "Publishing…" : "Publish band"}
        </button>
      </div>
    </form>
  );
}
