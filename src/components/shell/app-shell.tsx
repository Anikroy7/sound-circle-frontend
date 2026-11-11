"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import styles from "@/components/shell/shell.module.css";
import { HomeIcon, LibraryIcon, RecordIcon, SearchIcon } from "@/components/shell/shell-icons";
import { Sidebar } from "@/components/shell/sidebar";
import { TopBar } from "@/components/shell/top-bar";
import { useShellData } from "@/components/shell/use-shell-data";
import { useAuthStatus } from "@/lib/auth-session";
import { routes } from "@/lib/routes";

const COLLAPSED_KEY = "sc:sidebar-collapsed";
const COLLAPSED_EVENT = "sc:sidebar-toggled";

/** The sidebar's collapsed state, remembered per browser. Unreadable storage (a private window) just means expanded. */
const readCollapsed = (): boolean => {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
};
const subscribeCollapsed = (onChange: () => void): (() => void) => {
  window.addEventListener(COLLAPSED_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(COLLAPSED_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
};
const setCollapsed = (value: boolean): void => {
  try {
    localStorage.setItem(COLLAPSED_KEY, value ? "1" : "0");
  } catch {
    // Not remembered; the toggle still applies below.
  }
  window.dispatchEvent(new Event(COLLAPSED_EVENT));
};

/**
 * The current path, for the parts of the shell that highlight where you are. Rendered inside Suspense:
 * the path is only known at request time, and the page itself shouldn't wait for it.
 */
function WithPathname({ children }: { children: (pathname: string) => ReactNode }): ReactNode {
  return children(usePathname());
}

/** Tells the shell when the route changes, so its counts refresh on every navigation. */
function RouteChange({ onChange }: { onChange: (pathname: string) => void }): null {
  const pathname = usePathname();
  useEffect(() => onChange(pathname), [pathname, onChange]);
  return null;
}

const footerLinks = [
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
  { href: routes.communityGuidelines, label: "Community guidelines" },
  { href: routes.privacy, label: "Privacy" },
];

/**
 * Every app page's frame: the sidebar beside the page, a top bar over the page
 * and a tab bar on phones. The sidebar's collapsed state is remembered per browser.
 */
export function AppShell({ children }: { children: ReactNode }): React.JSX.Element {
  const status = useAuthStatus();
  const [route, setRoute] = useState("");
  const { pending, bands } = useShellData(route);
  // The server can't see this browser's choice, so it renders expanded.
  const collapsed = useSyncExternalStore(subscribeCollapsed, readCollapsed, () => false);
  const toggle = (): void => setCollapsed(!collapsed);

  const tabs = (pathname: string): { href: string; label: string; Icon: typeof HomeIcon; active: boolean }[] => [
    { href: routes.home, label: "Home", Icon: HomeIcon, active: pathname === routes.home },
    { href: routes.musicians, label: "Search", Icon: SearchIcon, active: pathname.startsWith(routes.musicians) },
    { href: routes.bands, label: "Bands", Icon: RecordIcon, active: pathname === routes.bands },
    { href: status === "signed-in" ? routes.dashboard : routes.login, label: "You", Icon: LibraryIcon, active: pathname === routes.dashboard },
  ];

  return (
    <div className={styles.shell} data-collapsed={collapsed}>
      <Suspense fallback={<aside className={styles.sidebar} aria-label="Sidebar" />}>
        <RouteChange onChange={setRoute} />
        <WithPathname>{(pathname) => <Sidebar pathname={pathname} pending={pending} bands={bands} onToggle={toggle} />}</WithPathname>
      </Suspense>

      <div className={styles.main}>
        <TopBar pending={pending} />
        <div className={styles.content}>{children}</div>
        <footer className={styles.footer}>
          <nav aria-label="Footer" className={styles.footerLinks}>
            {footerLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <span>© 2026 SoundCircle · Made for musicians across Bangladesh</span>
        </footer>
      </div>

      <Suspense>
        <WithPathname>
          {(pathname) => (
            <nav className={styles.tabbar} aria-label="Tabs">
              {tabs(pathname).map(({ href, label, Icon, active }) => (
                <Link key={label} href={href} className={styles.tab} aria-current={active ? "page" : undefined}>
                  <Icon size={22} filled={active && label === "Home"} />
                  {label}
                  {label === "You" && pending > 0 && <span className={styles.badge}>{pending}</span>}
                </Link>
              ))}
            </nav>
          )}
        </WithPathname>
      </Suspense>
    </div>
  );
}
