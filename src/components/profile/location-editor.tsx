"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LocationPicker, toLocationPicks, type LocationPick } from "@/components/onboarding/location-picker";
import onboarding from "@/components/onboarding/onboarding.module.css";
import { EditorDialog } from "@/components/profile/editor-dialog";
import { ApiError, apiErrorMessage, saveLocations } from "@/lib/api";
import { LIMITS } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";
import type { MusicianProfile } from "@/types/profile";

interface LocationEditorProps {
  profile: MusicianProfile;
  onProfile: (profile: MusicianProfile) => void;
  onClose: () => void;
}

/** The profile page's Location editor: the same picker as setup step 1, saved on its own (`PUT /profiles/me/locations`). */
export function LocationEditor({ profile, onProfile, onClose }: LocationEditorProps): React.JSX.Element {
  const router = useRouter();
  const [locations, setLocations] = useState<LocationPick[]>(() => toLocationPicks(profile.locations));
  const [showError, setShowError] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const emptyError = locations.length ? null : "Add at least one location.";

  const save = async (): Promise<void> => {
    setShowError(true);
    if (emptyError) return;
    setPending(true);
    setError(null);
    try {
      onProfile(await saveLocations(locations.map((pick) => pick.id)));
      onClose();
    } catch (failure) {
      setPending(false);
      if (failure instanceof ApiError && failure.status === 401) return router.push(routes.login);
      setError(apiErrorMessage(failure));
    }
  };

  return (
    <EditorDialog id="edit-location" title="Edit location" lead="Where you're based, and any other areas you can play." pending={pending} onClose={onClose}>
      <form
        className={onboarding.form}
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void save();
        }}
      >
        <LocationPicker value={locations} onChange={setLocations} limit={LIMITS.locations} error={showError ? emptyError : null} />
        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}
        <div className={`${onboarding.actions} ${onboarding.editActions}`}>
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </EditorDialog>
  );
}
