import type { Metadata } from "next";
import Link from "next/link";
import { SocialSignInButton } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { LocationPicker } from "@/components/auth/location-picker";
import { AlertCircleIcon } from "@/components/ui/icons";
import { signupDraft } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Create your account" };

const STRENGTH_STEPS = [1, 2, 3, 4];

/**
 * Drawn in the design's error state (the email is taken). Until auth exists, "Create account"
 * is a link into profile setup rather than a submit.
 */
export default function SignupPage(): React.JSX.Element {
  return (
    <>
      <div className={styles.heading}>
        <h2 className={`display ${styles.title}`}>Create your account</h2>
        <p className="muted">
          Already on SoundCircle? <Link href={routes.login}>Log in</Link>
        </p>
      </div>
      <SocialSignInButton />
      <div className={`muted ${styles.divider}`}>or with email or phone</div>
      <form className={styles.form}>
        <label className="field">
          <span className="label">Full name</span>
          <input className="input" name="fullName" autoComplete="name" defaultValue={signupDraft.fullName} />
        </label>
        <label className="field">
          <span className="label">Email or mobile number</span>
          <input
            className="input"
            name="contact"
            autoComplete="username"
            defaultValue={signupDraft.contact}
            aria-invalid="true"
            aria-describedby="signup-contact-error"
          />
          <span id="signup-contact-error" className="field-error">
            <AlertCircleIcon />
            This email already has an account.
            <Link href={routes.login} className={styles.underline}>
              Log in instead
            </Link>
          </span>
        </label>
        <label className="field">
          <span className="label">Password</span>
          <input className="input" type="password" name="password" autoComplete="new-password" aria-describedby="signup-password-hint" />
          <span className={styles.strength} aria-hidden="true">
            {STRENGTH_STEPS.map((step) => (
              <span key={step} className={step <= signupDraft.passwordStrength ? styles.strengthOn : undefined} />
            ))}
          </span>
          <span id="signup-password-hint" className="field-hint">
            Good password. At least 8 characters with a number.
          </span>
        </label>
        <LocationPicker />
        <label className="check">
          <input type="checkbox" name="terms" defaultChecked />
          <span>
            I agree to the <Link href={routes.communityGuidelines}>Community Guidelines</Link> and{" "}
            <Link href={routes.privacy}>Privacy Policy</Link>
          </span>
        </label>
        <Link className="btn btn-primary btn-block btn-tall" href={routes.onboarding.about}>
          Create account
        </Link>
      </form>
    </>
  );
}
