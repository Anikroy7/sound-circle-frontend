"use client";

import Link from "next/link";
import { useBandWizard } from "@/components/bands/create/band-wizard";
import styles from "@/components/bands/bands.module.css";
import { MembersEditor } from "@/components/bands/members-editor";
import { routes } from "@/lib/routes";

/** Step 2: the line-up. Members save as they are added, so Continue only moves on. Adding anyone is optional. */
export function BandMembersStep(): React.JSX.Element {
  const { band, setBand } = useBandWizard();
  if (!band) return <span className="muted">Loading…</span>;

  return (
    <>
      <p className={`muted ${styles.stepLead}`}>
        Add the people in the band: find them on SoundCircle, or add someone who isn&apos;t on it yet. You can invite more members later from the
        band&apos;s page.
      </p>
      <MembersEditor band={band} onBand={setBand} />
      <div className={styles.actionsRow}>
        <Link className="btn btn-secondary" href={routes.createBandStep.details}>
          Back
        </Link>
        <Link className="btn btn-primary" href={routes.createBandStep.media}>
          Continue to performance media
        </Link>
      </div>
    </>
  );
}
