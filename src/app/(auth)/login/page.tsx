import type { Metadata } from "next";
import Link from "next/link";
import { SocialSignInButton } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { loginDraft } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Log in" };

/** Drawn in the design's wrong-password state. Until auth exists, "Log in" links straight to the dashboard. */
export default function LoginPage(): React.JSX.Element {
  return (
    <>
      <div className={styles.heading}>
        <h2 className={`display ${styles.title}`}>Welcome back</h2>
        <p className="muted">
          New here? <Link href={routes.signup}>Create an account</Link>
        </p>
      </div>
      <div role="alert" className="alert alert-error">
        That password doesn&apos;t match this account. Try again or reset it.
      </div>
      <SocialSignInButton />
      <form className={styles.form}>
        <label className="field">
          <span className="label">Email or mobile number</span>
          <input className="input" name="contact" autoComplete="username" defaultValue={loginDraft.contact} />
        </label>
        <div className="field">
          <span className={styles.labelRow}>
            <label className="label" htmlFor="login-password">
              Password
            </label>
            <Link href={routes.forgotPassword} className={styles.small}>
              Forgot password?
            </Link>
          </span>
          <input id="login-password" className="input" type="password" name="password" autoComplete="current-password" aria-invalid="true" />
        </div>
        <label className="check">
          <input type="checkbox" name="remember" defaultChecked />
          Keep me logged in on this device
        </label>
        <Link className="btn btn-primary btn-block btn-tall" href={routes.dashboard}>
          Log in
        </Link>
      </form>
    </>
  );
}
