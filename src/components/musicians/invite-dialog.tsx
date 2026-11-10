"use client";

import Link from "next/link";
import { useState } from "react";
import { EditorDialog } from "@/components/profile/editor-dialog";
import { announceInboxChange } from "@/components/requests/request-status";
import { apiErrorMessage, sendInvitation } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { InviteOption } from "@/types/discovery";
import type { CatalogItem } from "@/types/profile";
import styles from "@/components/musicians/musicians.module.css";

const MESSAGE_MAX = 1000;

const STATUS_NOTE: Record<NonNullable<InviteOption["status"]>, string> = {
  member: "already a member",
  invited: "invited",
  requested: "asked to join",
};

interface InviteDialogProps {
  musician: { user_id: number; name: string };
  /** What they play, best first. */
  instruments: CatalogItem[];
  options: InviteOption[];
  onClose: () => void;
  onSent: () => void;
}

/** Invite a musician to one of my bands, for something they play. A role matching an open position fills it. */
export function InviteDialog({ musician, instruments, options, onClose, onSent }: InviteDialogProps): React.JSX.Element {
  const invitable = options.filter((option) => option.status === null);
  const [bandId, setBandId] = useState<number | null>(invitable[0]?.band.id ?? null);
  const band = options.find((option) => option.band.id === bandId) ?? null;
  const openIds = new Set(band?.open_roles.map((role) => role.instrument_id) ?? []);
  const firstOpen = instruments.find((item) => openIds.has(item.id));
  const [instrumentId, setInstrumentId] = useState<string>(String((firstOpen ?? instruments[0])?.id ?? ""));
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chooseBand = (id: number): void => {
    setBandId(id);
    const next = options.find((option) => option.band.id === id);
    const open = instruments.find((item) => next?.open_roles.some((role) => role.instrument_id === item.id));
    if (open) setInstrumentId(String(open.id));
  };

  const send = async (event: React.FormEvent): Promise<void> => {
    event.preventDefault();
    if (!bandId) return;
    setPending(true);
    setError(null);
    try {
      await sendInvitation({
        band_id: bandId,
        user_id: musician.user_id,
        ...(instrumentId ? { instrument_id: Number(instrumentId) } : {}),
        ...(message.trim() ? { message: message.trim() } : {}),
      });
      announceInboxChange();
      onSent();
    } catch (failure) {
      setError(apiErrorMessage(failure));
      setPending(false);
    }
  };

  if (!options.length) {
    return (
      <EditorDialog id="invite" title="Invite to your band" pending={false} onClose={onClose}>
        <p className="muted">You need a published band before you can invite musicians.</p>
        <div className={styles.dialogActions}>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <Link className="btn btn-primary" href={routes.createBand}>
            Create a band
          </Link>
        </div>
      </EditorDialog>
    );
  }

  return (
    <EditorDialog id="invite" title={`Invite ${musician.name}`} pending={pending} onClose={onClose}>
      <form className={styles.dialogForm} onSubmit={send}>
        {!invitable.length && <p className="muted">{musician.name} is already in or talking with every band you own.</p>}

        {options.length > 1 && (
          <label className="field">
            <span className="label">Band</span>
            <select className="input" value={bandId ?? ""} onChange={(event) => chooseBand(Number(event.target.value))}>
              {options.map((option) => (
                <option key={option.band.id} value={option.band.id} disabled={option.status !== null}>
                  {option.band.name}
                  {option.status ? ` (${STATUS_NOTE[option.status]})` : ""}
                </option>
              ))}
            </select>
          </label>
        )}

        {invitable.length > 0 && (
          <>
            <label className="field">
              <span className="label">Role</span>
              <select className="input" value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)}>
                {instruments.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                    {openIds.has(item.id) ? " — open position" : ""}
                  </option>
                ))}
                <option value="">No specific role</option>
              </select>
            </label>

            <label className="field">
              <span className="label">
                Message <span className="muted">(optional)</span>
              </span>
              <textarea className="input" rows={3} maxLength={MESSAGE_MAX} value={message} onChange={(event) => setMessage(event.target.value)} />
            </label>
          </>
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
          {invitable.length > 0 && (
            <button type="submit" className="btn btn-primary" disabled={pending || !bandId || band?.status !== null}>
              {pending ? "Sending…" : "Send invitation"}
            </button>
          )}
        </div>
      </form>
    </EditorDialog>
  );
}
