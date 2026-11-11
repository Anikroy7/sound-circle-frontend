import type { Metadata } from "next";
import { Suspense } from "react";
import page from "@/components/layout/page.module.css";
import { MusicianPage } from "@/components/musicians/musician-page";

export const metadata: Metadata = { title: "Musician" };

async function MusicianRoute({ params }: { params: PageProps<"/musicians/[slug]">["params"] }): Promise<React.JSX.Element> {
  const { slug } = await params;
  return <MusicianPage slug={slug} />;
}

/** Any musician's public profile, read from `GET /musicians/:slug` by `MusicianPage`. */
export default function MusicianRoutePage({ params }: PageProps<"/musicians/[slug]">): React.JSX.Element {
  return (
    <>
      <Suspense fallback={<main className={page.page} />}>
        <MusicianRoute params={params} />
      </Suspense>
    </>
  );
}
