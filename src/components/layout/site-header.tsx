import Link from "next/link";
import styles from "@/components/layout/site-header.module.css";
import { Avatar } from "@/components/ui/avatar";
import { Equalizer } from "@/components/ui/equalizer";
import { BellIcon } from "@/components/ui/icons";
import { LogoMark } from "@/components/ui/logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { bandProfile } from "@/demo-data/band-profile";
import { routes } from "@/lib/routes";
import type { Viewer } from "@/types/account";

interface SiteHeaderProps {
  /** Passed by the page rather than read from the URL, so the header stays a server component. */
  activeHref: string;
  /** Omitted for visitors, who get Log in / Sign up instead of notifications and the avatar. */
  viewer?: Viewer;
  /** Floats the header over a full-bleed cover photo. */
  overlay?: boolean;
}

export function SiteHeader({ activeHref, viewer, overlay = false }: SiteHeaderProps): React.JSX.Element {
  const navItems = [
    { href: routes.home, label: "Home" },
    { href: routes.musicians, label: "Discover Musicians" },
    // There is no band directory design yet, so "Bands" opens the demo band, as in the design.
    { href: routes.band(bandProfile.slug), label: "Bands" },
    { href: routes.createBand, label: "Create a Band" },
    { href: routes.invitations, label: "Invitations", badge: viewer?.newInvitations },
    { href: routes.dashboard, label: "My Dashboard" },
  ];

  return (
    <header className={`${styles.header} ${overlay ? styles.overlay : ""}`}>
      <div className={styles.capsule}>
        <Link href={routes.home} className={styles.brand}>
          <LogoMark />
          <span className={`display ${styles.brandName}`}>SoundCircle</span>
        </Link>
        <nav aria-label="Main" className={styles.rail}>
          {navItems.map((item, index) => {
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
                {item.badge ? (
                  <span className={styles.badge} aria-label={`${item.badge} new`}>
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className={styles.actions}>
          <ThemeSwitcher />
          {viewer ? (
            <>
              <button type="button" className={styles.iconButton} aria-label={`Notifications, ${viewer.unreadNotifications} unread`}>
                <BellIcon />
                {viewer.unreadNotifications > 0 && <span className={styles.unreadDot} />}
              </button>
              <Link href={routes.dashboard} className={styles.me} aria-label={`${viewer.name}, my dashboard`}>
                <Avatar initials={viewer.initials} tone={viewer.tone} size={26} />
              </Link>
            </>
          ) : (
            <>
              <Link className={`btn btn-secondary ${styles.authButton}`} href={routes.login}>
                Log in
              </Link>
              <Link className={`btn btn-primary ${styles.authButton}`} href={routes.signup}>
                Sign up free
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
