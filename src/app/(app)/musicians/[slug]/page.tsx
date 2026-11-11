import type { Metadata } from "next";
import { Suspense } from "react";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { MusicianPage } from "@/components/musicians/musician-page";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Musician" };

async function MusicianRoute({ params }: { params: PageProps<"/musicians/[slug]">["params"] }): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <MusicianPage slug={slug} />;
}

/** Any musician's public profile, read from `GET /musicians/:slug` by `MusicianPage`. */
export default function MusicianRoutePage({ params }: PageProps<"/musicians/[slug]">): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.musicians} />
      <Suspense fallback={<main className={page.page} />}>
        <MusicianRoute params={params} />
      </Suspense>
    </>
  );
}
