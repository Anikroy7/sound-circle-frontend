"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { FieldError } from "@/components/auth/auth-parts";
import styles from "@/components/auth/auth.module.css";
import { ApiError, logIn, signUp } from "@/lib/api";
import { markSignedIn } from "@/lib/auth-session";
import { emailError, NAME_MAX, PASSWORD_MAX, PASSWORD_MIN, passwordStrength, STRENGTH_LABELS } from "@/lib/auth-validation";
import { routes } from "@/lib/routes";

type Field = "name" | "email" | "password" | "confirm";
type Values = Record<Field, string>;

const FIELDS: Field[] = ["name", "email", "password", "confirm"];
const INITIAL_VALUES: Values = { name: "", email: "", password: "", confirm: "" };
const STRENGTH_STEPS = [1, 2, 3, 4];

function validate(values: Values): Partial<Record<Field, string>> {
  const errors: Partial<Record<Field, string>> = {};
  const name = values.name.trim();

  if (!name) errors.name = "Enter your full name.";
  else if (name.length > NAME_MAX) errors.name = `Use ${NAME_MAX} characters or fewer.`;

  const email = emailError(values.email);
  if (email) errors.email = email;

  if (!values.password) errors.password = "Create a password.";
  else if (values.password.length < PASSWORD_MIN) errors.password = `Use at least ${PASSWORD_MIN} characters.`;
  else if (values.password.length > PASSWORD_MAX) errors.password = `Use ${PASSWORD_MAX} characters or fewer.`;

  if (!values.confirm) errors.confirm = "Re-enter your password.";
  else if (values.confirm !== values.password) errors.confirm = "Passwords don't match.";

  return errors;
}

/** A taken email comes back as a 400 `{ email: { IsUnique: … } }` from `@IsUnique` or, if two sign-ups race, a 409. */
function isEmailTaken(error: ApiError): boolean {
  if (error.status === 409) return true;
  const message = error.apiMessage as { email?: Record<string, string> } | undefined;
  return error.status === 400 && Object.keys(message?.email ?? {}).some((rule) => rule.toLowerCase() === "isunique");
}

/**
 * Errors show once a field is left or the form is submitted, never while the user is still typing
 * their first attempt. On success the account is signed in and taken to profile setup.
 */
export function SignupForm(): React.JSX.Element {
  const router = useRouter();
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);
  const [takenEmail, setTakenEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const inputs = useRef<Partial<Record<Field, HTMLInputElement | null>>>({});
  const created = useRef(false);

  // Cache Components hides this page on navigation instead of unmounting it, so without this a later
  // visit comes back still "Creating account…" with the passwords filled in. A half-typed name and
  // email survive a detour to Log in, but not a finished sign-up.
  useLayoutEffect(
    () => () => {
      setValues((current) => (created.current ? INITIAL_VALUES : { ...current, password: "", confirm: "" }));
      created.current = false;
      setTouched({});
      setSubmitted(false);
      setPending(false);
      setTakenEmail(null);
      setFormError(null);
    },
    [],
  );

  const errors = validate(values);
  const emailTaken = takenEmail !== null && takenEmail === values.email.trim().toLowerCase();
  const shown = (field: Field): string | undefined => (touched[field] || submitted ? errors[field] : undefined);
  const strength = passwordStrength(values.password);

  const change = (field: Field) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setValues((current) => ({ ...current, [field]: event.target.value }));
  const blur = (field: Field) => () => setTouched((current) => ({ ...current, [field]: true }));

  const submit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (pending) return;
    setSubmitted(true);
    setFormError(null);

    const firstInvalid = FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      inputs.current[firstInvalid]?.focus();
      return;
    }
    if (emailTaken) {
      inputs.current.email?.focus();
      return;
    }

    const email = values.email.trim().toLowerCase();
    setPending(true);
    try {
      await signUp({ name: values.name.trim(), email, password: values.password });
    } catch (error) {
      setPending(false);
      if (error instanceof ApiError && isEmailTaken(error)) {
        setTakenEmail(email);
        inputs.current.email?.focus();
      } else if (error instanceof ApiError && error.status === 0) {
        setFormError("We couldn't reach SoundCircle. Check your connection and try again.");
      } else {
        setFormError("We couldn't create your account. Please check your details and try again.");
      }
      return;
    }
    created.current = true;

    try {
      markSignedIn(await logIn({ email, password: values.password, remember: false }));
      router.push(routes.onboarding.step("about"));
    } catch {
      // The account exists; only the automatic sign-in failed, so let the user do it themselves.
      router.push(routes.login);
    }
  };

  const describedBy = (field: Field, hint?: string): string | undefined =>
    [shown(field) || (field === "email" && emailTaken) ? `signup-${field}-error` : null, hint].filter(Boolean).join(" ") || undefined;

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {formError && (
        <div role="alert" className="alert alert-error">
          {formError}
        </div>
      )}

      <label className="field">
        <span className="label">Full name</span>
        <input
          ref={(element) => {
            inputs.current.name = element;
          }}
          className="input"
          name="name"
          autoComplete="name"
          maxLength={NAME_MAX}
          value={values.name}
          onChange={change("name")}
          onBlur={blur("name")}
          aria-invalid={!!shown("name")}
          aria-describedby={describedBy("name")}
        />
        {shown("name") && <FieldError id="signup-name-error">{shown("name")}</FieldError>}
      </label>

      <label className="field">
        <span className="label">Email address</span>
        <input
          ref={(element) => {
            inputs.current.email = element;
          }}
          className="input"
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          value={values.email}
          onChange={change("email")}
          onBlur={blur("email")}
          aria-invalid={!!shown("email") || emailTaken}
          aria-describedby={describedBy("email")}
        />
        {shown("email") ? (
          <FieldError id="signup-email-error">{shown("email")}</FieldError>
        ) : (
          emailTaken && (
            <FieldError id="signup-email-error">
              This email already has an account.{" "}
              <Link href={routes.login} className={styles.underline}>
                Log in instead
              </Link>
            </FieldError>
          )
        )}
      </label>

      <label className="field">
        <span className="label">Password</span>
        <input
          ref={(element) => {
            inputs.current.password = element;
          }}
          className="input"
          type="password"
          name="password"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX}
          value={values.password}
          onChange={change("password")}
          onBlur={blur("password")}
          aria-invalid={!!shown("password")}
          aria-describedby={describedBy("password", "signup-password-hint")}
        />
        {values.password && (
          <span className={styles.strength} aria-hidden="true">
            {STRENGTH_STEPS.map((step) => (
              <span key={step} className={step <= strength ? styles.strengthOn : undefined} />
            ))}
          </span>
        )}
        {shown("password") && <FieldError id="signup-password-error">{shown("password")}</FieldError>}
        <span id="signup-password-hint" className="field-hint" aria-live="polite">
          {values.password && !errors.password ? `${STRENGTH_LABELS[strength]} ` : ""}
          At least {PASSWORD_MIN} characters. Mixing cases, numbers and symbols makes it stronger.
        </span>
      </label>

      <label className="field">
        <span className="label">Confirm password</span>
        <input
          ref={(element) => {
            inputs.current.confirm = element;
          }}
          className="input"
          type="password"
          name="confirmPassword"
          autoComplete="new-password"
          maxLength={PASSWORD_MAX}
          value={values.confirm}
          onChange={change("confirm")}
          onBlur={blur("confirm")}
          aria-invalid={!!shown("confirm")}
          aria-describedby={describedBy("confirm")}
        />
        {shown("confirm") && <FieldError id="signup-confirm-error">{shown("confirm")}</FieldError>}
      </label>

      <button type="submit" className="btn btn-primary btn-block btn-tall" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </button>
    </form>
  );
}
