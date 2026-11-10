"use client";

import { useEffect, useState } from "react";
import styles from "@/components/layout/site-header.module.css";
import { getInbox } from "@/lib/api";
import { useAuthStatus } from "@/lib/auth-session";

/** How many invitations and join requests wait on the signed-in user's answer. Nothing for a visitor or at zero. */
export function PendingBadge(): React.JSX.Element | null {
  const status = useAuthStatus();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (status !== "signed-in") return;
    let live = true;
    const refresh = (): void => {
      getInbox().then(
        (inbox) => live && setCount(inbox.invitations_received.length + inbox.join_requests_received.length),
        () => undefined,
      );
    };
    refresh();
    // The dashboard announces answers, so the badge drops without a reload.
    window.addEventListener("sc:inbox-changed", refresh);
    return () => {
      live = false;
      window.removeEventListener("sc:inbox-changed", refresh);
    };
  }, [status]);

  if (status !== "signed-in" || !count) return null;
  return (
    <span className={styles.badge} aria-label={`${count} waiting for your answer`}>
      {count}
    </span>
  );
}
