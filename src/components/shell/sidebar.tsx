"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "@/components/shell/shell.module.css";
import { HomeIcon, LibraryIcon, PanelIcon, PlusIcon, RecordIcon, SearchIcon } from "@/components/shell/shell-icons";
import { Avatar } from "@/components/ui/avatar";
import { LogoMark } from "@/components/ui/logo";
import { useAuthStatus, useCurrentUser } from "@/lib/auth-session";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import type { MyBand } from "@/types/discovery";

type Filter = "all" | "owner" | "member";

interface SidebarProps {
  pathname: string;
  pending: number;
  bands: MyBand[] | null;
  onToggle: () => void;
}

const isAt = (pathname: string, href: string): boolean =>
  href === routes.home ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

/**
 * The left column: where to go (Home, Search, Bands), then "Your circle" — the signed-in user's
 * dashboard, profile and bands, filterable by role. A visitor's circle is two prompts instead.
 */
export function Sidebar({ pathname, pending, bands, onToggle }: SidebarProps): React.JSX.Element {
  const status = useAuthStatus();
  const user = useCurrentUser();
  const [filter, setFilter] = useState<Filter>("all");

  const nav = [
    { href: routes.home, label: "Home", Icon: HomeIcon },
    { href: routes.musicians, label: "Search", Icon: SearchIcon },
    { href: routes.bands, label: "Bands", Icon: RecordIcon },
  ];
  const shown = (bands ?? []).filter((band) => filter === "all" || (filter === "owner") === band.is_owner);
  const owns = bands?.some((band) => band.is_owner);
  const joins = bands?.some((band) => !band.is_owner);

  return (
    <aside className={styles.sidebar} aria-label="Sidebar">
      <nav className={`${styles.panel} ${styles.navPanel}`} aria-label="Main">
        <Link href={routes.home} className={styles.brand}>
          <LogoMark size={28} />
          <span className={styles.brandName}>SoundCircle</span>
        </Link>
        {nav.map(({ href, label, Icon }) => {
          // "Bands" is the directory; a band's own pages live in the library below.
          const active = href === routes.bands ? pathname === href : isAt(pathname, href);
          return (
            <Link key={href} href={href} className={styles.navLink} aria-current={active ? "page" : undefined} title={label}>
              <Icon />
              <span className={styles.navLabel}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <section className={`${styles.panel} ${styles.library}`} aria-label="Your circle">
        <div className={styles.libraryHead}>
          <button type="button" className={styles.libraryTitle} onClick={onToggle} title="Collapse or expand the sidebar">
            <LibraryIcon />
            <span className={styles.libraryLabel}>Your circle</span>
          </button>
          <span className={styles.libraryAdd}>
            <Link href={routes.createBand} className={styles.iconButton} aria-label="Create a band" title="Create a band">
              <PlusIcon size={18} />
            </Link>
            <button type="button" className={styles.iconButton} onClick={onToggle} aria-label="Collapse the sidebar" title="Collapse">
              <PanelIcon size={18} />
            </button>
          </span>
        </div>

        {status === "signed-in" ? (
          <>
            {owns && joins && (
              <div className={styles.chips} role="group" aria-label="Filter your bands">
                {(["all", "owner", "member"] as const).map((value) => (
                  <button key={value} type="button" className={styles.chip} aria-pressed={filter === value} onClick={() => setFilter(value)}>
                    {value === "all" ? "All" : value === "owner" ? "Owned" : "Joined"}
                  </button>
                ))}
              </div>
            )}
            <ul className={styles.libraryList}>
              <li>
                <Link
                  href={routes.dashboard}
                  className={styles.libraryItem}
                  aria-current={isAt(pathname, routes.dashboard) ? "page" : undefined}
                  title="Dashboard"
                >
                  <span className={`${styles.iconTile} ${styles.iconTileAccent}`}>
                    <LibraryIcon />
                  </span>
                  <span className={styles.libraryText}>
                    <span className={styles.libraryName}>Dashboard</span>
                    <span className={styles.librarySub}>{pending ? `${pending} waiting for you` : "Invitations and requests"}</span>
                  </span>
                  {pending > 0 && <span className={styles.count}>{pending}</span>}
                </Link>
              </li>
              {user && (
                <li>
                  <Link
                    href={routes.myProfile}
                    className={styles.libraryItem}
                    aria-current={isAt(pathname, routes.myProfile) ? "page" : undefined}
                    title="Your profile"
                  >
                    <Avatar initials={initialsOf(user.name)} tone={toneFor(user.id)} size={40} photoUrl={user.photo_url} />
                    <span className={styles.libraryText}>
                      <span className={styles.libraryName}>{user.name}</span>
                      <span className={styles.librarySub}>Profile</span>
                    </span>
                  </Link>
                </li>
              )}
              {shown.map((band) => {
                const href = band.slug ? routes.band(band.slug) : routes.createBand;
                return (
                  <li key={band.id}>
                    <Link
                      href={href}
                      className={styles.libraryItem}
                      aria-current={band.slug && isAt(pathname, routes.band(band.slug)) ? "page" : undefined}
                      title={band.name}
                    >
                      <Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={40} shape="square" photoUrl={band.logo_url} />
                      <span className={styles.libraryText}>
                        <span className={styles.libraryName}>{band.name}</span>
                        <span className={styles.librarySub}>
                          {band.is_draft
                            ? "Draft · finish setting up"
                            : `Band · ${band.is_owner ? "Owner" : "Member"} · ${band.member_count} members`}
                        </span>
                      </span>
                    </Link>
                  </li>
                );
              })}
              {bands && !bands.length && (
                <li className={styles.prompt}>
                  <strong>Start your first band</strong>
                  <span>It&apos;s easy, we&apos;ll help you.</span>
                  <Link href={routes.createBand} className={styles.pill}>
                    Create a band
                  </Link>
                </li>
              )}
            </ul>
          </>
        ) : (
          status === "signed-out" && (
            <div className={styles.libraryList}>
              <div className={styles.prompt}>
                <strong>Create your first band</strong>
                <span>Name it, add your line-up, then invite players.</span>
                <Link href={routes.createBand} className={styles.pill}>
                  Create a band
                </Link>
              </div>
              <div className={styles.prompt}>
                <strong>Find musicians near you</strong>
                <span>Drummers, vocalists, bassists and more.</span>
                <Link href={routes.musicians} className={styles.pill}>
                  Browse musicians
                </Link>
              </div>
            </div>
          )
        )}
      </section>
    </aside>
  );
}
