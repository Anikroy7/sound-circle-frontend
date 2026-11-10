"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/components/band-dashboard/band-dashboard.module.css";

interface PopoverProps {
  /** The button that opens it; gets `aria-expanded`. */
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "menu" }) => ReactNode;
  /** The menu's items; `close` dismisses it after an action. */
  children: (close: () => void) => ReactNode;
  align?: "left" | "right";
}

/** A menu under a button. Closes on an outside click, Escape, or after an item is chosen. */
export function Popover({ trigger, children, align = "left" }: PopoverProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent): void => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  return (
    <div ref={root} className={styles.switcher}>
      {trigger({ onClick: () => setOpen((current) => !current), "aria-expanded": open, "aria-haspopup": "menu" })}
      {open && (
        <ul className={`${styles.menu} ${align === "right" ? styles.menuRight : ""}`} role="menu">
          {children(() => setOpen(false))}
        </ul>
      )}
    </div>
  );
}
