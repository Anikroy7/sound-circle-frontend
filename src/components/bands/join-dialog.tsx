"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/musicians/musicians.module.css";
import { EditorDialog } from "@/components/profile/editor-dialog";
import { announceInboxChange } from "@/components/requests/request-status";
import { apiErrorMessage, sendJoinRequest } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { Band } from "@/types/band-api";

const MESSAGE_MAX = 1000;

interface JoinDialogProps {
  band: Band;
  /** The position the viewer clicked, if any. */
  roleId: number | null;
  onClose: () => void;
  onSent: () => void;
}

/** Ask to fill one of the band's open positions. Only positions for an instrument on the viewer's profile can be picked. */
export function JoinDialog({ band, roleId, onClose, onSent }: JoinDialogProps): React.JSX.Element {
  const fillable = new Set(band.viewer.fillable_role_ids);
  const [chosen, setChosen] = useState<number | null>(roleId && fillable.has(roleId) ? roleId : (band.viewer.fillable_role_ids[0] ?? null));
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const send = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!chosen) return;
    setPending(true);
    setError(null);
    try {
      await sendJoinRequest({ band_id: band.id, open_role_id: chosen, ...(message.trim() ? { message: message.trim() } : {}) });
      announceInboxChange();
      onSent();
    } catch (failure) {
      setError(apiErrorMessage(failure));
      setPending(false);
    }
  };

  return (
    <EditorDialog id="join" title={`Join ${band.name}`} pending={pending} onClose={onClose}>
      <form className={styles.dialogForm} onSubmit={send}>
        <fieldset className="fieldset">
          <legend className="label">Position</legend>
          {band.open_roles.map((role) => {
            const allowed = fillable.has(role.id);
            return (
              <label key={role.id} className={styles.roleOption}>
                <input type="radio" name="role" value={role.id} checked={chosen === role.id} disabled={!allowed} onChange={() => setChosen(role.id)} />
                <span className={styles.roleText}>
                  <strong>{role.instrument_name}</strong>
                  {role.description && <span className="muted">{role.description}</span>}
                  {!allowed && <span className="muted">Not on your profile</span>}
                </span>
              </label>
            );
          })}
        </fieldset>

        {!fillable.size && (
          <p className="muted">
            You can apply for an instrument you play. <Link href={routes.myProfile}>Update your instruments</Link>
          </p>
        )}

        {fillable.size > 0 && (
          <label className="field">
            <span className="label">
              Message <span className="muted">(optional)</span>
            </span>
            <textarea className="input" rows={3} maxLength={MESSAGE_MAX} value={message} onChange={(event) => setMessage(event.target.value)} />
          </label>
        )}

        {error && (
          <div role="alert" className="alert alert-error">
            {error}
          </div>
        )}

        <div className={styles.dialogActions}>
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={pending}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={pending || !chosen}>
            {pending ? "Sending…" : "Send request"}
          </button>
        </div>
      </form>
    </EditorDialog>
  );
}
