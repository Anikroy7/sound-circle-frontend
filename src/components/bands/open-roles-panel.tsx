"use client";

import { useEffect, useState } from "react";
import styles from "@/components/bands/bands.module.css";
import profile from "@/components/profile/profile.module.css";
import { addOpenRole, apiErrorMessage, closeOpenRole, getInstruments } from "@/lib/api";
import type { Band } from "@/types/band-api";
import type { CatalogItem } from "@/types/profile";

interface OpenRolesPanelProps {
  band: Band;
  onBand: (band: Band) => void;
  /** Opens the join dialog on this position; absent when the viewer can't apply. */
  onApply?: (roleId: number) => void;
}

/** The positions a band is looking to fill. Its owner adds and removes them here; others apply. */
export function OpenRolesPanel({ band, onBand, onApply }: OpenRolesPanelProps): React.JSX.Element | null {
  const [instruments, setInstruments] = useState<CatalogItem[]>([]);
  const [instrumentId, setInstrumentId] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (band.is_owner) getInstruments().then(setInstruments, () => undefined);
  }, [band.is_owner]);

  if (!band.is_owner && !band.open_roles.length) return null;

  const run = async (work: () => Promise<Band>): Promise<void> => {
    setPending(true);
    setError(null);
    try {
      onBand(await work());
      setInstrumentId("");
      setNote("");
    } catch (failure) {
      setError(apiErrorMessage(failure));
    } finally {
      setPending(false);
    }
  };

  const fillable = new Set(band.viewer.fillable_role_ids);
  const taken = new Set(band.open_roles.map((role) => role.instrument_id));

  return (
    <section className="card panel">
      <h2 className="panel-title">Looking for</h2>

      {band.open_roles.length ? (
        <ul className={styles.roleList}>
          {band.open_roles.map((role) => (
            <li key={role.id} className={profile.openRole}>
              <span className={styles.roleText}>
                <strong>{role.instrument_name}</strong>
                {role.description && <span className="muted">{role.description}</span>}
              </span>
              {band.is_owner ? (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  disabled={pending}
                  onClick={() => run(() => closeOpenRole(band.id, role.id))}
                  aria-label={`Remove ${role.instrument_name}`}
                >
                  Remove
                </button>
              ) : (
                onApply &&
                fillable.has(role.id) && (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onApply(role.id)}>
                    Apply
                  </button>
                )
              )}
            </li>
          ))}
        </ul>
      ) : (
        <span className="muted">Not looking for anyone right now.</span>
      )}

      {band.is_owner && (
        <form
          className={styles.roleForm}
          onSubmit={(event) => {
            event.preventDefault();
            if (instrumentId) run(() => addOpenRole(band.id, Number(instrumentId), note));
          }}
        >
          <select className="input" aria-label="Instrument" value={instrumentId} onChange={(event) => setInstrumentId(event.target.value)}>
            <option value="">Add a position…</option>
            {instruments
              .filter((item) => !taken.has(item.id))
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
          </select>
          <input
            className="input"
            aria-label="Note"
            placeholder="Note (optional)"
            maxLength={500}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={pending || !instrumentId}>
            Add
          </button>
        </form>
      )}

      {error && (
        <div role="alert" className="alert alert-error">
          {error}
        </div>
      )}
    </section>
  );
}
