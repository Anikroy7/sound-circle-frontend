/** The signed-in account, as `GET /auth/me` and `POST /auth/login` return it. */
export interface AccountUser {
  id: number;
  name: string;
  email: string | null;
  /** The profile photo, for the header avatar; null before one is added. */
  photo_url: string | null;
}

/** `POST /users`: what the sign-up form sends. */
export interface SignupRequest {
  name: string;
  email: string;
  password: string;
}

/** `POST /auth/login`. `remember` keeps the session cookies after the browser closes. */
export interface LoginRequest {
  email: string;
  password: string;
  remember: boolean;
}

/** `loading` until the first `GET /auth/me` answers; the header shows no auth actions until then. */
export type AuthStatus = "loading" | "signed-in" | "signed-out";
