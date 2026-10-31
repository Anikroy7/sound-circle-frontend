import type { Metadata } from "next";
import Link from "next/link";
import styles from "@/components/auth/auth.module.css";
import { CheckIcon } from "@/components/ui/icons";
import { profileDraft } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Your profile is live" };

export default function OnboardingDonePage(): React.JSX.Element {
  return (
    <div className={`card ${styles.done}`}>
      <span className="success-badge">
        <CheckIcon />
      </span>
      <h2 className={`display ${styles.stepTitle}`}>Your profile is live</h2>
      <p className={`muted ${styles.doneText}`}>
        Musicians in {profileDraft.area} can now find you. Add a sample to reach 100% and show up higher in search.
      </p>
      <div className={styles.completion}>
        <div className={styles.completionLabel}>
          <span className="muted">Profile complete</span>
          <strong>{profileDraft.completion}%</strong>
        </div>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${profileDraft.completion}%` }} />
        </div>
      </div>
      <div className={styles.centerRow}>
        <Link className="btn btn-primary" href={routes.musicians}>
          Explore Musicians
        </Link>
        <Link className="btn btn-secondary" href={routes.createBand}>
          Create a Band
        </Link>
      </div>
      <Link href={routes.dashboard} className={styles.small}>
        Go to my dashboard
      </Link>
    </div>
  );
}
