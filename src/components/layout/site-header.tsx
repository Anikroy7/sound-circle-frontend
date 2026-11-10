import Link from "next/link";
import { HeaderAuth } from "@/components/layout/header-auth";
import { PendingBadge } from "@/components/layout/pending-badge";
import styles from "@/components/layout/site-header.module.css";
import { Equalizer } from "@/components/ui/equalizer";
import { LogoMark } from "@/components/ui/logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { routes } from "@/lib/routes";

interface SiteHeaderProps {
  /** Passed by the page rather than read from the URL, so the header stays a server component. */
  activeHref: string;
}

const NAV_ITEMS = [
  { href: routes.home, label: "Home" },
  { href: routes.musicians, label: "Musicians" },
  { href: routes.bands, label: "Bands" },
  { href: routes.createBand, label: "Create a Band" },
  { href: routes.dashboard, label: "Dashboard", pending: true },
];

export function SiteHeader({ activeHref }: SiteHeaderProps): React.JSX.Element {
  return (
    <header className={styles.header}>
      <div className={styles.capsule}>
        <Link href={routes.home} className={styles.brand}>
          <LogoMark />
          <span className={`display ${styles.brandName}`}>SoundCircle</span>
        </Link>
        <nav aria-label="Main" className={styles.rail}>
          {NAV_ITEMS.map((item, index) => {
            const active = item.href === activeHref;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`${styles.navItem} ${active ? styles.navItemActive : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <Equalizer bars={[12, 8, 11]} barWidth={3} gap={2} />
                ) : (
                  <span className={styles.navNumber}>{String(index + 1).padStart(2, "0")}</span>
                )}
                {item.label}
                {item.pending && <PendingBadge />}
              </Link>
            );
          })}
        </nav>
        <div className={styles.actions}>
          <ThemeSwitcher />
          <HeaderAuth />
        </div>
      </div>
    </header>
  );
}
