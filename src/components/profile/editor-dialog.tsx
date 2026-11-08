"use client";

import { useEffect, useRef, type ReactNode } from "react";
import styles from "@/components/profile/profile.module.css";

interface EditorDialogProps {
  /** For `aria-labelledby`; unique on the page. */
  id: string;
  title: string;
  lead?: string;
  /** While a save is in flight, Esc and × do nothing. */
  pending: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** The modal every profile-page editor opens in: a title, a lead, × to close, Esc to cancel. */
export function EditorDialog({ id, title, lead, pending, onClose, children }: EditorDialogProps): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);

  return (
    <dialog
      ref={dialog}
      className={styles.editor}
      aria-labelledby={`${id}-title`}
      onCancel={(event) => {
        event.preventDefault();
        if (!pending) onClose();
      }}
    >
      <div className={styles.editorHead}>
        <div>
          <h2 id={`${id}-title`} className="panel-title">
            {title}
          </h2>
          {lead && <p className={`muted ${styles.small}`}>{lead}</p>}
        </div>
        <button type="button" className={styles.editorClose} onClick={onClose} disabled={pending} aria-label="Close">
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
