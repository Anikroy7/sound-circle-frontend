"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { ApiError, getMyProfile, logIn } from "@/lib/api";
import { markSignedIn } from "@/lib/auth-session";
import { emailError, PASSWORD_MAX } from "@/lib/auth-validation";
import { PROFILE_STEPS, profileDestination } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";

type Field = "email" | "password";

/** Email and password, checked by `POST /auth/login`. A wrong pair never says which half was wrong. */
export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const emailInput = useRef<HTMLInputElement>(null);
  const passwordInput = useRef<HTMLInputElement>(null);

  // Cache Components hides this page on navigation instead of unmounting it, so without this a later
  // visit (e.g. after Logout) comes back still "Logging in…" with the last password filled in.
  // The email and the "keep me logged in" choice are kept on purpose.
  useLayoutEffect(
    () => () => {
      setPassword("");
      setTouched({});
      setSubmitted(false);
      setPending(false);
      setFormError(null);
    },
    [],
  );

  const errors: Partial<Record<Field, string>> = {
    email: emailError(email) ?? undefined,
    password: password ? undefined : "Enter your password.",
  };
  const shown = (field: Field): string | undefined => (touched[field] || submitted ? errors[field] : undefined);
  const blur = (field: Field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setFormError(null);

    if (errors.email || errors.password) {
      (errors.email ? emailInput : passwordInput).current?.focus();
      return;
    }

    setPending(true);
    try {
      markSignedIn(await logIn({ email: email.trim().toLowerCase(), password, remember }));
      // An unfinished profile resumes where it stopped; a finished one goes to the dashboard. If the
      // profile can't be read, profile setup's own page will sort it out.
      const profile = await getMyProfile().catch(() => null);
      router.push(profile && profile.setup_step >= PROFILE_STEPS.length ? routes.dashboard : profile ? profileDestination(profile) : routes.onboarding.resume);
    } catch (error) {
      setPending(false);
      if (error instanceof ApiError && error.status === 401) {
        setFormError("That email and password don't match an account. Try again or reset your password.");
        // A fresh, empty password field — without an "Enter your password" error on top of the alert.
        setPassword("");
        setSubmitted(false);
        setTouched((current) => ({ ...current, password: false }));
        passwordInput.current?.focus();
      } else if (error instanceof ApiError && error.status === 0) {
        setFormError("We couldn't reach SoundCircle. Check your connection and try again.");
      } else {
        setFormError("Something went wrong on our side. Please try again.");
      }
    }
  };

  return (
    <>
      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}
      <form className={styles.form} onSubmit={submit} noValidate>
        <label className="field">
          <span className="label">Email address</span>
          <input
            ref={emailInput}
            className="input"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            spellCheck={false}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={blur("email")}
            aria-invalid={!!shown("email")}
            aria-describedby={shown("email") ? "login-email-error" : undefined}
          />
          {shown("email") && <FieldError id="login-email-error">{shown("email")}</FieldError>}
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
          <input
            ref={passwordInput}
            id="login-password"
            className="input"
            type="password"
            name="password"
            autoComplete="current-password"
            maxLength={PASSWORD_MAX}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            onBlur={blur("password")}
            aria-invalid={!!shown("password")}
            aria-describedby={shown("password") ? "login-password-error" : undefined}
          />
          {shown("password") && <FieldError id="login-password-error">{shown("password")}</FieldError>}
        </div>
        <label className="check">
          <input type="checkbox" name="remember" checked={remember} onChange={(event) => setRemember(event.target.checked)} />
          Keep me logged in on this device
        </label>
        <button type="submit" className="btn btn-primary btn-block btn-tall" disabled={pending}>
          {pending ? "Logging in…" : "Log in"}
        </button>
      </form>
    </>
  );
}
