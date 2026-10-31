import styles from "@/components/dashboard/dashboard.module.css";
import type { Dashboard } from "@/types/dashboard";

/** Profile completion, profile views and notifications, side by side. */
export function OverviewTiles({ data }: { data: Dashboard }): React.JSX.Element {
  const peak = Math.max(...data.views.daily);

  return (
    <div className={styles.tiles}>
      <section className={`card panel ${styles.tile}`}>
        <div className={styles.head}>
          <h2 className={`panel-title ${styles.title}`}>Profile completion</h2>
          <strong className={`display ${styles.percent}`}>{data.completion.percent}%</strong>
        </div>
        <div className="progress" role="img" aria-label={`${data.completion.percent}% complete`}>
          <span style={{ width: `${data.completion.percent}%` }} />
        </div>
        <ul className={styles.checklist}>
          {data.completion.items.map((item) => (
            <li key={item.label} className={styles.checkItem}>
              <span>
                <span className={item.done ? styles.tick : "muted"} aria-hidden="true">
                  {item.done ? "✓" : "○"}
                </span>
                {item.label}
                {!item.done && <span className="visually-hidden"> (to do)</span>}
              </span>
              {!item.done && (
                <a href="#" className={styles.addLink}>
                  Add
                </a>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className={`card panel ${styles.tile}`}>
        <h2 className={`panel-title ${styles.title}`}>Profile views</h2>
        <div className={styles.bigNumber}>
          <strong className="display">{data.views.total}</strong>
          <span className="muted">{data.views.period}</span>
        </div>
        <div className={styles.bars} aria-hidden="true">
          {data.views.daily.map((views, index) => (
            <span key={index} style={{ height: `${Math.round((views / peak) * 100)}%` }} />
          ))}
        </div>
        <p className={`muted ${styles.small}`}>{data.views.insight}</p>
      </section>

      <section className={`card panel ${styles.tile} ${styles.notifications}`}>
        <div className={styles.head}>
          <h2 className={`panel-title ${styles.title}`}>Notifications</h2>
          <a href="#" className={styles.small}>
            Mark all read
          </a>
        </div>
        {data.notifications.map((notification) => (
          <div key={notification.text} className={styles.notification}>
            <span className={`${styles.notificationDot} ${notification.unread ? styles.unread : ""}`} aria-hidden="true" />
            <div>
              <span>
                {notification.unread && <span className="visually-hidden">Unread: </span>}
                {notification.text}
              </span>
              <div className={`muted ${styles.time}`}>{notification.time}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
