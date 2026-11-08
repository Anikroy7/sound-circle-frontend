import { useEffect, useSyncExternalStore } from "react";
import { getCurrentUser } from "@/lib/api";
import type { AccountUser, AuthStatus } from "@/types/auth";

/**
 * Whether this browser is signed in, and as whom, shared by every component that asks. The tokens
 * are httpOnly cookies no script can read, so the answer comes from `GET /auth/me`: asked once per
 * page load, then kept current by `markSignedIn` / `markSignedOut` as the forms and Logout change it.
 */
let status: AuthStatus = "loading";
let user: AccountUser | null = null;
let checking = false;
const listeners = new Set<() => void>();

function setSession(nextStatus: AuthStatus, nextUser: AccountUser | null): void {
  status = nextStatus;
  user = nextUser;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** An unreachable API counts as signed out, so the header still offers Log in. */
function check(): void {
  if (status !== "loading" || checking) return;
  checking = true;
  getCurrentUser()
    .then(
      (current) => setSession(current ? "signed-in" : "signed-out", current),
      () => setSession("signed-out", null),
    )
    .finally(() => {
      checking = false;
    });
}

export function markSignedIn(account: AccountUser): void {
  if (account) setSession("signed-in", account);
}

/** After the profile photo changes, so the header avatar follows without a reload. */
export function updateSessionPhoto(photoUrl: string | null): void {
  if (user && user.photo_url !== photoUrl) setSession(status, { ...user, photo_url: photoUrl });
}

export function markSignedOut(): void {
  setSession("signed-out", null);
}

/** The server always renders `loading`: it cannot see the API's cookies. */
export function useAuthStatus(): AuthStatus {
  const current = useSyncExternalStore(
    subscribe,
    () => status,
    () => "loading" as const,
  );
  useEffect(check, []);
  return current;
}

/** The signed-in account, or null while loading and for a visitor. */
export function useCurrentUser(): AccountUser | null {
  const current = useSyncExternalStore(
    subscribe,
    () => user,
    () => null,
  );
  useEffect(check, []);
  return current;
}
