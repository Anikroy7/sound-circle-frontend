"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "@/components/layout/site-header.module.css";
import { Avatar } from "@/components/ui/avatar";
import { logOut } from "@/lib/api";
import { markSignedOut, useAuthStatus, useCurrentUser } from "@/lib/auth-session";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";

/**
 * Log in / Sign up free for a visitor; the signed-in user's avatar (linking to their profile) and
 * Logout otherwise. Renders nothing until the status is known, so neither set flashes before being
 * swapped for the other. `children` (notifications) shows only when signed in.
 */
export function HeaderAuth({ children }: { children?: React.ReactNode }): React.JSX.Element | null {
  const status = useAuthStatus();
  const user = useCurrentUser();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  if (status === "loading") return null;

  if (status === "signed-out") {
    return (
      <>
        <Link className={`btn btn-secondary ${styles.authButton}`} href={routes.login}>
          Log in
        </Link>
        <Link className={`btn btn-primary ${styles.authButton}`} href={routes.signup}>
          Sign up free
        </Link>
      </>
    );
  }

  const leave = async (): Promise<void> => {
    setLeaving(true);
    try {
      await logOut();
    } catch {
      // The cookies are still set, so staying signed in is the honest state; the button comes back to retry.
      setLeaving(false);
      return;
    }
    // Reset too: pages are hidden, not unmounted, so this header would otherwise show "Logging out…" after the next login.
    setLeaving(false);
    markSignedOut();
    router.push(routes.home);
    router.refresh();
  };

  return (
    <>
      {children}
      {user && (
        <Link href={routes.myProfile} className={styles.me} aria-label={`${user.name}, my profile`}>
          <Avatar initials={initialsOf(user.name)} tone={toneFor(user.id)} size={26} photoUrl={user.photo_url} />
        </Link>
      )}
      <button type="button" className={`btn btn-secondary ${styles.authButton}`} onClick={leave} disabled={leaving}>
        {leaving ? "Logging out…" : "Logout"}
      </button>
    </>
  );
}
