import type { Metadata } from "next";
import { Suspense } from "react";
import { BandPage } from "@/components/bands/band-page";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Band" };

async function BandRoute({ params }: { params: PageProps<"/bands/[slug]">["params"] }): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <BandPage slug={slug} />;
}

/** A published band, read from `GET /bands/:slug` by `BandPage`. */
export default function BandRoutePage({ params }: PageProps<"/bands/[slug]">): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.bands} />
      <Suspense fallback={<main className={page.page} />}>
        <BandRoute params={params} />
      </Suspense>
    </>
  );
}
