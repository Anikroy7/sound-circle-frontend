"use client";

import { useEffect, useState } from "react";
import { getInbox, getMyBands } from "@/lib/api";
import { useAuthStatus } from "@/lib/auth-session";
import type { MyBand } from "@/types/discovery";

/** Fired after anything that changes the inbox or the line-up (`announceInboxChange`). */
const CHANGED = "sc:inbox-changed";

/**
 * What the shell shows about the signed-in user: how many invitations and join requests wait on them,
 * and the bands in their library. Refreshed on every navigation (`key`, empty until the route is known) and whenever the app announces
 * a change, so an answered request drops off the badge without a reload. Empty for a visitor.
 */
export function useShellData(key: string): { pending: number; bands: MyBand[] | null } {
  const status = useAuthStatus();
  const [pending, setPending] = useState(0);
  const [bands, setBands] = useState<MyBand[] | null>(null);

  useEffect(() => {
    if (status !== "signed-in" || !key) return;
    let live = true;
    const refresh = (): void => {
      getInbox().then(
        (inbox) => live && setPending(inbox.invitations_received.length + inbox.join_requests_received.length),
        () => undefined,
      );
      getMyBands().then(
        (rows) => live && setBands(rows),
        () => live && setBands([]),
      );
    };
    refresh();
    window.addEventListener(CHANGED, refresh);
    return () => {
      live = false;
      window.removeEventListener(CHANGED, refresh);
    };
  }, [status, key]);

  return status === "signed-in" ? { pending, bands } : { pending: 0, bands: null };
}
