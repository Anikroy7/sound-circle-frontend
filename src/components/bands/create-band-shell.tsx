import Link from "next/link";
import type { ReactNode } from "react";
import styles from "@/components/bands/bands.module.css";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import { bandDraft } from "@/demo-data/create-band";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";
import { chipClass, tones } from "@/lib/tones";

export type CreateBandStep = keyof typeof routes.createBandStep;

const steps: { key: CreateBandStep; label: string }[] = [
  { key: "details", label: "Band details" },
  { key: "roles", label: "Roles" },
  { key: "invite", label: "Invite musicians" },
  { key: "publish", label: "Publish" },
];

const checklistMarks = { done: "✓", missing: "!", optional: "○" };

/** Page frame for every Create-a-band step: heading, step indicator and the live preview beside the form. */
export function CreateBandShell({ step, children }: { step: CreateBandStep; children: ReactNode }): React.JSX.Element {
  const current = steps.findIndex((item) => item.key === step);
  const draft = bandDraft;

  return (
    <>
      <SiteHeader activeHref={routes.createBand} viewer={currentViewer} />
      <main className={page.page}>
        <div className={page.head}>
          <div className={page.titleGroup}>
            <Link href={routes.dashboard} className={page.backLink}>
              ← My Dashboard
            </Link>
            <h1 className={`display ${page.title}`}>Create a band</h1>
          </div>
          <span className={`muted ${styles.small}`}>Draft saved 1 min ago</span>
        </div>

        <nav aria-label="Steps">
          <ol className={styles.steps}>
            {steps.map((item, index) => (
              <li key={item.key} className={styles.stepItem}>
                <Link
                  href={routes.createBandStep[item.key]}
                  className={`${styles.step} ${index === current ? styles.stepCurrent : ""} ${index < current ? styles.stepDone : ""}`}
                  aria-current={index === current ? "step" : undefined}
                >
                  <span className={styles.stepNumber}>{index < current ? "✓" : index + 1}</span>
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>

        <div className={page.split}>
          <div className={`card ${styles.stepCard}`}>{children}</div>

          <aside className={page.aside}>
            <div className={`card ${styles.previewCard}`}>
              <div className={`photo-placeholder ${styles.previewCover}`} style={{ backgroundColor: tones[draft.tone].tint }} />
              <div className={styles.previewBody}>
                <Avatar
                  initials={draft.monogram}
                  tone={draft.tone}
                  size={64}
                  shape="square"
                  className={`display ${styles.previewLogo}`}
                />
                <strong className={`display ${styles.previewName}`}>{draft.name}</strong>
                <span className={`muted ${styles.small}`}>
                  {draft.genre} · {draft.area}, {draft.city} · {draft.stage}
                </span>
                <div className={styles.chipRow}>
                  {draft.roles.map((role) => (
                    <span key={role.role} className={`chip ${chipClass(role.status.tone)}`}>
                      {role.short}
                      {role.status.tone === "teal" && " ✓"}
                    </span>
                  ))}
                </div>
                <span className={`muted ${styles.previewCaption}`}>Live preview of your public band card</span>
              </div>
            </div>

            <div className={`card panel ${styles.checklistCard}`}>
              <strong>Before you publish</strong>
              <ul className={styles.checklist}>
                {draft.checklist.map((item) => (
                  <li key={item.label}>
                    <span
                      className={item.state === "done" ? styles.markDone : item.state === "missing" ? styles.markMissing : "muted"}
                      aria-hidden="true"
                    >
                      {checklistMarks[item.state]}
                    </span>
                    {item.label}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}
