import styles from "@/components/bands/chemistry.module.css";
import { InstrumentIcon } from "@/components/ui/instrument-icon";
import { familyInfo } from "@/lib/band-chemistry";
import type { LineupSlot } from "@/types/band-api";

/** Dots per section: one per member, a dashed one per open position, capped so a big section stays tidy. */
const MAX_DOTS = 6;

/**
 * Band chemistry: members per instrument section, with the sections the band is recruiting for
 * highlighted. The five core sections always show, so a gap is visible at a glance.
 */
export function LineupPanel({ lineup }: { lineup: LineupSlot[] }): React.JSX.Element {
  const core = lineup.slice(0, 5);
  const covered = core.filter((slot) => slot.count > 0).length;
  const needed = lineup.filter((slot) => slot.needed > 0).map((slot) => familyInfo(slot.family).label);

  return (
    <section className="card panel" aria-labelledby="chemistry">
      <h2 id="chemistry" className="panel-title">
        Band chemistry
      </h2>
      <p className={styles.summary}>
        {covered} of 5 core sections covered{needed.length > 0 && ` · looking for ${needed.join(", ").toLowerCase()}`}
      </p>
      <ul className={styles.lineup} role="list">
        {lineup.map((slot) => {
          const { label, icon } = familyInfo(slot.family);
          const members = Math.min(slot.count, MAX_DOTS);
          const open = Math.min(slot.needed, MAX_DOTS - members);
          return (
            <li
              key={slot.family ?? "other"}
              className={`${styles.slot} ${slot.needed ? styles.slotNeeded : ""} ${!slot.count && !slot.needed ? styles.slotEmpty : ""}`}
              aria-label={`${label}: ${slot.count} ${slot.count === 1 ? "member" : "members"}${slot.needed ? `, ${slot.needed} needed` : ""}`}
            >
              <span className={styles.slotHead}>
                <InstrumentIcon slug={icon} size={24} />
                {slot.needed > 0 && <span className={styles.neededTag}>Needed</span>}
              </span>
              <span className={styles.slotCount}>{slot.count}</span>
              <span className={styles.slotLabel}>{label}</span>
              <span className={styles.dots} aria-hidden="true">
                {Array.from({ length: members }, (_, index) => (
                  <span key={`m${index}`} />
                ))}
                {Array.from({ length: open }, (_, index) => (
                  <span key={`n${index}`} className={styles.dotNeeded} />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
