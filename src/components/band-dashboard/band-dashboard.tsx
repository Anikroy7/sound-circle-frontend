"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import styles from "@/components/band-dashboard/band-dashboard.module.css";
import { MembersView } from "@/components/band-dashboard/members-view";
import { Popover } from "@/components/band-dashboard/popover";
import { RequestsView } from "@/components/band-dashboard/requests-view";
import { IntroForm } from "@/components/bands/intro-form";
import { LineupPanel } from "@/components/bands/lineup-panel";
import { CardShare, MembershipCardView, type CardData } from "@/components/bands/membership-card";
import { MilestonesPanel } from "@/components/bands/milestones-panel";
import { OpenRolesPanel } from "@/components/bands/open-roles-panel";
import { Avatar } from "@/components/ui/avatar";
import { ApiError, apiErrorMessage, getBand, getBandDashboard, getCurrentUser, getMyBands } from "@/lib/api";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import { useUrlQuery } from "@/lib/use-url-query";
import type { AccountUser } from "@/types/auth";
import type { Band, BandDashboard as Dashboard, BandMember } from "@/types/band-api";
import type { MyBand } from "@/types/discovery";

type View = "overview" | "members" | "requests" | "positions" | "card" | "introduction";

const SECTIONS: { view: View; label: string; ownerOnly?: boolean; group: "band" | "you" }[] = [
  { view: "overview", label: "Overview", group: "band" },
  { view: "members", label: "Members", group: "band" },
  { view: "requests", label: "Requests", group: "band", ownerOnly: true },
  { view: "positions", label: "Open positions", group: "band", ownerOnly: true },
  { view: "card", label: "Membership card", group: "you" },
  { view: "introduction", label: "Introduction", group: "you" },
];

interface Loaded {
  user: AccountUser;
  dashboard: Dashboard;
  myBands: MyBand[];
}

const cardOf = (band: Band, me: BandMember): CardData => ({
  code: me.card_code,
  band: { id: band.id, name: band.name, slug: band.slug, logo_url: band.logo_url },
  member: { name: me.name, photo_url: me.photo_url, instrument: me.instrument?.name ?? me.position, is_owner: me.is_owner, joined_at: me.joined_at, user_id: me.user_id },
});

/** The overview: headline numbers, band chemistry and milestones. */
function Overview({ dashboard, me }: { dashboard: Dashboard; me: BandMember }): React.JSX.Element {
  const { band } = dashboard;
  const unlocked = band.milestones.filter((milestone) => milestone.achieved_at).length;
  const stats = [
    { value: band.members.length, label: band.members.length === 1 ? "Member" : "Members" },
    { value: band.open_roles.length, label: band.open_roles.length === 1 ? "Open position" : "Open positions" },
    band.is_owner
      ? { value: dashboard.join_requests.length, label: "Join requests waiting" }
      : { value: me.instrument?.name ?? me.position ?? "—", label: "Your role" },
    { value: `${unlocked}/${band.milestones.length}`, label: "Milestones" },
  ];

  return (
    <>
      <div className={styles.stats}>
        {stats.map((stat) => (
          <div key={stat.label} className={`card ${styles.stat}`}>
            <span className={styles.statValue}>{stat.value}</span>
            <span className={styles.statLabel}>{stat.label}</span>
          </div>
        ))}
      </div>
      <div className={styles.split}>
        <LineupPanel lineup={band.lineup} />
        <MilestonesPanel milestones={band.milestones} small />
      </div>
    </>
  );
}

/**
 * A band's own dashboard, for its members (`/bands/:slug/manage`): members, requests, open positions,
 * and the viewer's membership card and introduction. The owner sees everything; a member sees what's theirs.
 */
export function BandDashboard({ slug }: { slug: string }): React.JSX.Element {
  const router = useRouter();
  const query = useUrlQuery();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let live = true;
    (async () => {
      const user = await getCurrentUser();
      if (!user) return router.replace(routes.login);
      const band = await getBand(slug);
      const [dashboard, myBands] = await Promise.all([getBandDashboard(band.id), getMyBands()]);
      if (live) setData({ user, dashboard, myBands: myBands.filter((row) => !row.is_draft) });
    })().catch((failure: unknown) => {
      if (live) setError({ status: failure instanceof ApiError ? failure.status : 0, message: apiErrorMessage(failure) });
    });
    return () => {
      live = false;
      setData(null);
      setError(null);
      setNotice(null);
    };
  }, [slug, attempt, router]);

  const reload = useCallback(
    async (message: string | null) => {
      if (!data) return;
      const dashboard = await getBandDashboard(data.dashboard.band.id).catch(() => data.dashboard);
      setData((current) => current && { ...current, dashboard });
      setNotice(message);
    },
    [data],
  );

  const setBand = useCallback((band: Band) => setData((current) => current && { ...current, dashboard: { ...current.dashboard, band } }), []);

  if (error) {
    return (
      <main className={styles.shell}>
        <div className={`card ${styles.block}`} role="alert" style={{ gridColumn: "1 / -1" }}>
          <h1 className={styles.blockTitle}>{error.status === 404 ? "This dashboard is for band members" : "We couldn't load the dashboard"}</h1>
          <p className={styles.blockLead}>{error.status === 404 ? "Only members of this band can open it." : error.message}</p>
          <div className={styles.blockActions}>
            <Link className="btn btn-secondary" href={routes.band(slug)}>
              View the band
            </Link>
            {error.status !== 404 && (
              <button type="button" className="btn btn-primary" onClick={() => setAttempt((count) => count + 1)}>
                Try again
              </button>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (!data) {
    return (
      <main className={styles.shell} aria-busy="true">
        <span className="muted">Loading…</span>
      </main>
    );
  }

  const { user, dashboard, myBands } = data;
  const { band } = dashboard;
  const me = band.members.find((member) => member.id === band.viewer.member_id);
  const sections = SECTIONS.filter((section) => !section.ownerOnly || band.is_owner);
  const requested = query.get("view") as View;
  const view: View = sections.some((section) => section.view === requested) ? requested : "overview";
  const current = sections.find((section) => section.view === view);

  return (
    <main className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Band dashboard">
        <Popover
          trigger={(props) => (
            <button type="button" className={styles.switcherButton} {...props}>
              <Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={36} shape="square" photoUrl={band.logo_url} />
              <span className={styles.switcherName}>{band.name}</span>
              <svg className={styles.chevron} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M7 15l5 5 5-5M7 9l5-5 5 5" />
              </svg>
            </button>
          )}
        >
          {(close) => (
            <>
              {myBands.map((row) => (
                <li key={row.id} role="none">
                  <Link role="menuitem" className={styles.menuItem} href={routes.bandDashboard(row.slug!)} onClick={close}>
                    <Avatar initials={initialsOf(row.name)} tone={toneFor(row.id)} size={24} shape="square" photoUrl={row.logo_url} />
                    {row.name}
                  </Link>
                </li>
              ))}
              <li role="none">
                <Link role="menuitem" className={styles.menuItem} href={routes.band(band.slug!)} onClick={close}>
                  View public page
                </Link>
              </li>
            </>
          )}
        </Popover>

        <nav className={styles.nav} aria-label="Sections">
          {(["band", "you"] as const).map((group) => (
            <div key={group} className={styles.navGroup}>
              <span className={styles.navLabel}>{group === "band" ? "Band" : "You"}</span>
              {sections
                .filter((section) => section.group === group)
                .map((section) => (
                  <button
                    key={section.view}
                    type="button"
                    className={styles.navItem}
                    aria-current={view === section.view ? "page" : undefined}
                    onClick={() => {
                      setNotice(null);
                      query.set({ view: section.view === "overview" ? null : section.view });
                    }}
                  >
                    {section.label}
                    {section.view === "requests" && dashboard.join_requests.length > 0 && <span className={styles.navCount}>{dashboard.join_requests.length}</span>}
                  </button>
                ))}
            </div>
          ))}
        </nav>

        <div className={styles.you}>
          <Avatar initials={initialsOf(user.name)} tone={toneFor(user.id)} size={36} photoUrl={user.photo_url} />
          <span className={styles.youText}>
            <strong>{user.name}</strong>
            {band.is_owner ? "Owner" : (me?.instrument?.name ?? "Member")}
          </span>
        </div>
      </aside>

      <div className={styles.content}>
        <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
          <Link href={routes.dashboard}>Dashboard</Link>
          <span className={styles.crumbSep}>›</span>
          <Link href={routes.band(band.slug!)}>{band.name}</Link>
          <span className={styles.crumbSep}>›</span>
          <span aria-current="page">{current?.label}</span>
        </nav>

        {notice && (
          <div role="status" className="alert alert-success">
            {notice}
          </div>
        )}

        {view === "overview" && me && <Overview dashboard={dashboard} me={me} />}
        {view === "members" && <MembersView band={band} onBand={setBand} />}
        {view === "requests" && <RequestsView joinRequests={dashboard.join_requests} invitations={dashboard.invitations} onChanged={reload} />}
        {view === "positions" && <OpenRolesPanel band={band} onBand={setBand} />}

        {view === "card" && me && band.slug && (
          <section className={`card ${styles.block}`} aria-labelledby="card-title">
            <div>
              <h2 id="card-title" className={styles.blockTitle}>
                Membership Card
              </h2>
              <p className={styles.blockLead}>Your official card for {band.name}. Share it anywhere.</p>
            </div>
            <MembershipCardView card={cardOf(band, me)} />
            <CardShare card={cardOf(band, me)} memberId={me.id} />
          </section>
        )}

        {view === "introduction" && me && (
          <section className={`card ${styles.block}`} aria-labelledby="intro-title">
            <div>
              <h2 id="intro-title" className={styles.blockTitle}>
                Your Introduction
              </h2>
              <p className={styles.blockLead}>Shown on the band&apos;s page under “Meet the band”.</p>
            </div>
            <IntroForm
              key={me.id}
              bandId={band.id}
              initial={{ intro: me.intro ?? "", genre_ids: me.intro_genres.map((genre) => genre.id), interests: me.interests }}
              onSaved={(updated) => {
                setBand(updated);
                setNotice("Introduction saved.");
              }}
            />
          </section>
        )}
      </div>
    </main>
  );
}
