"use client";

import { useState } from "react";
import { MediaUploader } from "@/components/onboarding/media/media-uploader";
import { VideoLinksEditor } from "@/components/onboarding/media/video-links-editor";
import styles from "@/components/onboarding/onboarding.module.css";
import { StepActions } from "@/components/onboarding/step-actions";
import { useWizard, type SaveMode } from "@/components/onboarding/wizard-context";
import { profileUploadEndpoints, saveGallery } from "@/lib/api";
import { LIMITS } from "@/lib/profile-steps";

/**
 * Step 7, optional: audio samples and photos save as they upload; video links save with the step.
 * Continue waits for uploads in flight, so nothing is lost by moving on early.
 */
export function GalleryStep(): React.JSX.Element {
  const { profile, setProfile, submit } = useWizard();
  const [videoUrls, setVideoUrls] = useState(profile.videos.map((video) => video.url));
  const [uploads, setUploads] = useState(0);
  const [hasDraft, setHasDraft] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  const onBusyChange = (busy: boolean): void => setUploads((count) => Math.max(0, count + (busy ? 1 : -1)));

  const save = (mode: SaveMode): void => {
    if (hasDraft) {
      setDraftError("Add the link you pasted, or clear the box.");
      return;
    }
    void submit(mode, () => saveGallery(videoUrls));
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
      <div className={`card panel`}>
        <MediaUploader
          mediaType={3}
          endpoints={profileUploadEndpoints({ media_type: 3 })}
          items={profile.audio}
          limit={LIMITS.galleryAudio}
          label="Audio samples"
          hint="MP3, WAV, M4A, AAC, OGG or FLAC, up to 10 MB each. MP3 and M4A upload fastest; WAV and FLAC are about 10× larger."
          onSaved={setProfile}
          onBusyChange={onBusyChange}
        />
      </div>
      <div className={`card panel`}>
        <MediaUploader
          mediaType={1}
          endpoints={profileUploadEndpoints({ media_type: 1 })}
          items={profile.photos}
          limit={LIMITS.galleryPhotos}
          label="Performance photos"
          hint="JPG, PNG or WebP. Large photos are resized before upload, so they go up quickly."
          onSaved={setProfile}
          onBusyChange={onBusyChange}
        />
      </div>
      <div className={`card panel`}>
        <VideoLinksEditor
          urls={videoUrls}
          onChange={setVideoUrls}
          limit={LIMITS.galleryVideos}
          onDraftChange={(draft) => {
            setHasDraft(draft);
            setDraftError(null);
          }}
          draftError={draftError}
        />
      </div>
      <StepActions onSave={save} busy={uploads > 0} busyLabel="Uploading…" />
    </form>
  );
}
