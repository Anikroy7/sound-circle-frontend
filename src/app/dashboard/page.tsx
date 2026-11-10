import type { Metadata } from "next";
import { Dashboard } from "@/components/dashboard/dashboard";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Dashboard" };

/** Signed-in data, so the page is a static shell and `Dashboard` loads it client-side. */
export default function DashboardPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.dashboard} />
      <Dashboard />
    </>
  );
}
