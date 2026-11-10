import styles from "@/components/bands/chemistry.module.css";
import { formatDate, MILESTONES } from "@/lib/band-chemistry";
import type { MilestoneProgress } from "@/types/band-api";

/** Milestones the band has unlocked, as badges, with the next ones dimmed so there's something to aim for. */
export function MilestonesPanel({ milestones, small = false }: { milestones: MilestoneProgress[]; small?: boolean }): React.JSX.Element {
  const unlocked = milestones.filter((milestone) => milestone.achieved_at).length;

  return (
    <section className="card panel" aria-labelledby="milestones">
      <div className={styles.head}>
        <h2 id="milestones" className={`panel-title ${small ? "panel-title-sm" : ""}`}>
          Milestones
        </h2>
        <span className={styles.summary}>
          {unlocked} of {milestones.length}
        </span>
      </div>
      <ol className={styles.milestones}>
        {milestones.map((milestone) => {
          const { title, detail } = MILESTONES[milestone.milestone];
          const done = !!milestone.achieved_at;
          return (
            <li key={milestone.milestone} className={`${styles.milestone} ${done ? "" : styles.locked}`}>
              <span className={`${styles.badge} ${done ? "" : styles.badgeLocked}`} aria-hidden="true">
                {milestone.members}
              </span>
              <span className={styles.milestoneText}>
                <strong>{title}</strong>
                <span className={styles.milestoneMeta}>
                  {done ? `Unlocked ${formatDate(milestone.achieved_at!)}` : `${detail} · ${milestone.members} members`}
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
