"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import styles from "@/components/shell/shell.module.css";
import { BellIcon, SearchIcon } from "@/components/shell/shell-icons";
import { Avatar } from "@/components/ui/avatar";
import { LogoMark } from "@/components/ui/logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { logOut } from "@/lib/api";
import { markSignedOut, useAuthStatus, useCurrentUser } from "@/lib/auth-session";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";

/** Where the top bar's search writes its text straight into the page's `?q=` as you type. */
const LIVE_SEARCH: string[] = [routes.musicians, routes.bands];

/**
 * The pill in the middle of the top bar. On Search and Bands it is that page's search box, updating
 * the results as you type; anywhere else, Enter takes you to Search with the text.
 */
function SearchPill(): React.JSX.Element {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const live = LIVE_SEARCH.includes(pathname);
  const urlText = live ? (params.get("q") ?? "") : "";
  const [text, setText] = useState(urlText);
  const [seen, setSeen] = useState(urlText);

  // The URL changed from outside (a filter was cleared, the back button): follow it.
  if (urlText !== seen) {
    setSeen(urlText);
    if (urlText !== text.trim()) setText(urlText);
  }

  useEffect(() => {
    if (!live || text.trim() === urlText) return;
    const timer = setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (text.trim()) next.set("q", text.trim());
      else next.delete("q");
      next.delete("page");
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [text, live, urlText, params, pathname, router]);

  const placeholder = pathname === routes.bands ? "Which band are you looking for?" : "Search musicians or instruments";

  return (
    <form
      role="search"
      className={styles.search}
      onSubmit={(event) => {
        event.preventDefault();
        if (!live && text.trim()) router.push(`${routes.musicians}?${new URLSearchParams({ q: text.trim() })}`);
      }}
    >
      <span className={styles.searchIcon}>
        <SearchIcon size={20} />
      </span>
      <input
        className={styles.searchInput}
        type="search"
        aria-label={placeholder}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </form>
  );
}

/** The signed-in user's menu: profile, dashboard, theme, log out. */
function AccountMenu(): React.JSX.Element | null {
  const user = useCurrentUser();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const outside = (event: MouseEvent): void => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const escape = (event: KeyboardEvent): void => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", outside);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("mousedown", outside);
      document.removeEventListener("keydown", escape);
    };
  }, [open]);

  if (!user) return null;

  const leave = async (): Promise<void> => {
    setOpen(false);
    try {
      await logOut();
    } catch {
      // Still signed in: the cookies are there. Nothing to undo.
      return;
    }
    markSignedOut();
    router.push(routes.home);
    router.refresh();
  };

  return (
    <div ref={root} className={styles.menuWrap}>
      <button
        type="button"
        className={styles.avatarButton}
        aria-label={`${user.name}, account menu`}
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((current) => !current)}
      >
        <Avatar initials={initialsOf(user.name)} tone={toneFor(user.id)} size={32} photoUrl={user.photo_url} />
      </button>
      {open && (
        <div className={styles.menu} role="menu">
          <Link role="menuitem" href={routes.myProfile} className={styles.menuItem} onClick={() => setOpen(false)}>
            Profile
          </Link>
          <Link role="menuitem" href={routes.dashboard} className={styles.menuItem} onClick={() => setOpen(false)}>
            Dashboard
          </Link>
          <div className={styles.menuDivider} />
          <div className={styles.menuTheme}>
            Theme
            <ThemeSwitcher />
          </div>
          <div className={styles.menuDivider} />
          <button type="button" role="menuitem" className={styles.menuItem} onClick={leave}>
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

interface TopBarProps {
  pending: number;
}

/**
 * The bar across the top of the page: search on the left, the account on the right; a hairline appears
 * once scrolled. An entity page shows its title and main action in the slot once its header is gone.
 */
export function TopBar({ pending }: TopBarProps): React.JSX.Element {
  const status = useAuthStatus();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = (): void => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={styles.topbar} data-scrolled={scrolled}>
      <Link href={routes.home} className={styles.mobileBrand} aria-label="SoundCircle home">
        <LogoMark size={28} />
      </Link>
      <div id="sc-topbar-slot" className={styles.slot} />

      <div className={styles.center}>
        <Suspense fallback={<div className={styles.search} />}>
          <SearchPill />
        </Suspense>
      </div>

      <div className={styles.actions}>
        {status === "signed-in" ? (
          <>
            <Link
              href={routes.dashboard}
              className={styles.iconButton}
              aria-label={pending ? `Dashboard, ${pending} waiting for you` : "Dashboard"}
              title="Dashboard"
            >
              <BellIcon size={20} />
              {pending > 0 && <span className={styles.badge}>{pending}</span>}
            </Link>
            <AccountMenu />
          </>
        ) : (
          status === "signed-out" && (
            <>
              <Link href={routes.signup} className={styles.ghostLink}>
                Sign up
              </Link>
              <Link href={routes.login} className={styles.loginButton}>
                Log in
              </Link>
            </>
          )
        )}
      </div>
    </header>
  );
}
