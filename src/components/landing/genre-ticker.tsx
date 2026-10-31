import { Fragment } from "react";
import styles from "@/components/landing/landing.module.css";
import { tickerGenres } from "@/demo-data/hero";

/** Every other word is outlined. The list is rendered twice so the marquee loops without a gap. */
export function GenreTicker(): React.JSX.Element {
  const words = [...tickerGenres, ...tickerGenres];

  return (
    <div className={styles.ticker} aria-hidden="true">
      <div className={styles.tickerTrack}>
        {words.map((word, index) => (
          <Fragment key={index}>
            <span
              className={`display ${styles.tickerWord} ${index % 2 ? styles.tickerWordOutline : ""}`}
              style={index % 2 ? undefined : { color: index % 4 === 0 ? "var(--teal)" : "var(--violet-soft)" }}
            >
              {word}
            </span>
            <span className={styles.tickerStar}>✦</span>
          </Fragment>
        ))}
      </div>
    </div>
  );
}
