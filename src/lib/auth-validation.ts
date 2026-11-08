/**
 * Client-side checks for the sign-up and log-in forms. The limits mirror the API's DTOs
 * (`CreateUserDto`, `LoginDto`), so a form that passes here is not then refused there.
 */
export const NAME_MAX = 100;
export const EMAIL_MAX = 255;
export const PASSWORD_MIN = 8;
export const PASSWORD_MAX = 72;

/** Deliberately loose (something@something.tld); the API's `@IsEmail()` has the final word. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emailError(email: string): string | null {
  const value = email.trim();
  if (!value) return "Enter your email address.";
  if (value.length > EMAIL_MAX || !EMAIL_PATTERN.test(value)) return "Enter a valid email address, like name@example.com.";
  return null;
}

/** 0–4, one point each for length, a 12+ length, mixed case, and a number or symbol. Drives the strength bars. */
export function passwordStrength(password: string): number {
  if (password.length < PASSWORD_MIN) return password ? 1 : 0;
  return 1 + Number(password.length >= 12) + Number(/[a-z]/.test(password) && /[A-Z]/.test(password)) + Number(/[\d\W_]/.test(password));
}

export const STRENGTH_LABELS = ["", "Weak password.", "Fair password.", "Good password.", "Strong password."];
