import type { Metadata } from "next";
import { Suspense } from "react";
import { BandDashboard } from "@/components/band-dashboard/band-dashboard";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Band dashboard" };

async function DashboardRoute({ params }: { params: PageProps<"/bands/[slug]/manage">["params"] }): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <BandDashboard slug={slug} />;
}

/** A band's own dashboard, for its members. Signed-in data and a `?view=` section, so it renders client-side. */
export default function BandDashboardPage({ params }: PageProps<"/bands/[slug]/manage">): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.dashboard} />
      <Suspense>
        <DashboardRoute params={params} />
      </Suspense>
    </>
  );
}
