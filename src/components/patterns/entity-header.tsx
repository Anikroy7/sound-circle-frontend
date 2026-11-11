"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import styles from "@/components/patterns/patterns.module.css";
import { tones } from "@/lib/tones";
import type { Tone } from "@/types/common";

const noSubscription = (): (() => void) => () => undefined;
const findSlot = (): HTMLElement | null => document.getElementById("sc-topbar-slot");

interface EntityHeaderProps {
  /** "Musician", "Band", "Dashboard". */
  kind: string;
  title: string;
  /** The big picture: an `Avatar`, or the profile-photo uploader. */
  art: ReactNode;
  /** Short facts under the title, joined with dots. Empty entries are skipped. */
  meta?: ReactNode[];
  /** The entity's colour: a soft glow in the header's corner. */
  tone: Tone;
  /** The row under the header: the main action first. */
  actions?: ReactNode;
  /** A compact copy of the main action, shown in the top bar once the header has scrolled away. */
  miniAction?: ReactNode;
}

/**
 * The top of a musician's, band's or dashboard page: a card with the art, a kind label, the title and
 * the facts under it, then the action row. Once the title scrolls under the top bar, a compact title
 * (and the main action) appears in the bar instead.
 */
export function EntityHeader({ kind, title, art, meta = [], tone, actions, miniAction }: EntityHeaderProps): React.JSX.Element {
  const heading = useRef<HTMLHeadingElement>(null);
  // The top bar's slot, once on the client (the server has no DOM to portal into).
  const slot = useSyncExternalStore(noSubscription, findSlot, () => null);
  const [past, setPast] = useState(false);
  const tint = tones[tone].ink;

  useEffect(() => {
    const element = heading.current;
    if (!element) return;
    // "Past" once the title has gone under the 64px top bar.
    const observer = new IntersectionObserver(([entry]) => setPast(!entry.isIntersecting && entry.boundingClientRect.top < 64), {
      rootMargin: "-64px 0px 0px 0px",
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const facts = meta.filter((fact) => fact !== null && fact !== undefined && fact !== false && fact !== "");

  return (
    <>
      <header className={styles.entity} style={{ "--tint": tint } as React.CSSProperties}>
        <div className={styles.entityInner}>
          {art}
          <div className={styles.entityText}>
            <span className={styles.entityKind}>{kind}</span>
            <h1 ref={heading} className={styles.entityTitle}>
              {title}
            </h1>
            {facts.length > 0 && (
              <div className={styles.entityMeta}>
                {facts.map((fact, index) => (
                  <span key={index}>
                    {index > 0 && (
                      <span className={styles.dot} aria-hidden="true">
                        {" "}
                        •{" "}
                      </span>
                    )}
                    {fact}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>
      {actions && (
        <div className={styles.actionBar} style={{ "--tint": tint } as React.CSSProperties}>
          {actions}
        </div>
      )}
      {slot &&
        past &&
        createPortal(
          <div className={styles.mini}>
            <span className={styles.miniTitle}>{title}</span>
            {miniAction}
          </div>,
          slot,
        )}
    </>
  );
}
