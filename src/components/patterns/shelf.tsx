"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import styles from "@/components/patterns/patterns.module.css";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/shell/shell-icons";

interface ShelfProps {
  title: string;
  /** "Show all" and the title link here. */
  href?: string;
  children: ReactNode;
}

/** A titled row of cards that scrolls sideways, with arrow buttons on hover while there's more to see. */
export function Shelf({ title, href, children }: ShelfProps): React.JSX.Element {
  const row = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: true });

  const measure = useCallback(() => {
    const element = row.current;
    if (!element) return;
    setEdges({ start: element.scrollLeft <= 4, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 4 });
  }, []);

  useEffect(() => {
    const element = row.current;
    if (!element) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [measure, children]);

  const page = (direction: 1 | -1): void => row.current?.scrollBy({ left: direction * row.current.clientWidth * 0.85, behavior: "smooth" });

  return (
    <section className={styles.shelf} aria-label={title}>
      <div className={styles.sectionHead}>
        {href ? (
          <Link href={href} className={styles.sectionTitle}>
            {title}
          </Link>
        ) : (
          <h2 className={styles.sectionTitle}>{title}</h2>
        )}
        {href && (
          <Link href={href} className={styles.showAll}>
            Show all
          </Link>
        )}
      </div>
      <button
        type="button"
        className={`${styles.scrollButton} ${styles.scrollPrev}`}
        aria-label={`Scroll ${title} back`}
        disabled={edges.start}
        onClick={() => page(-1)}
      >
        <ChevronLeftIcon size={18} />
      </button>
      <div ref={row} className={styles.row} onScroll={measure}>
        {children}
      </div>
      <button
        type="button"
        className={`${styles.scrollButton} ${styles.scrollNext}`}
        aria-label={`Scroll ${title} on`}
        disabled={edges.end}
        onClick={() => page(1)}
      >
        <ChevronRightIcon size={18} />
      </button>
    </section>
  );
}
