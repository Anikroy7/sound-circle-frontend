import type { Metadata } from "next";
import { Suspense } from "react";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { MusicianSearch } from "@/components/musicians/musician-search";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Musicians" };

/** The filters live in the URL, read client-side, so the search sits in a Suspense boundary. */
export default function MusiciansPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.musicians} />
      <main className={page.page}>
        <h1 className={`display ${page.title}`}>Musicians</h1>
        <Suspense>
          <MusicianSearch />
        </Suspense>
      </main>
    </>
  );
}
