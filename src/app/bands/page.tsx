import type { Metadata } from "next";
import { Suspense } from "react";
import { BandSearch } from "@/components/bands/band-search";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Bands" };

/** The filters live in the URL, read client-side, so the search sits in a Suspense boundary. */
export default function BandsPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.bands} />
      <main className={page.page}>
        <h1 className={`display ${page.title}`}>Bands</h1>
        <Suspense>
          <BandSearch />
        </Suspense>
      </main>
    </>
  );
}
