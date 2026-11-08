import type { Metadata } from "next";
import { Suspense } from "react";
import { BandPage } from "@/components/bands/band-page";
import styles from "@/components/bands/bands.module.css";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { BandProfileView } from "@/components/profile/band-profile";
import { bandProfile } from "@/demo-data/band-profile";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Band" };

/** The demo band is prerendered; every other slug is a real band, loaded at request time. */
export function generateStaticParams(): { slug: string }[] {
  return [{ slug: bandProfile.slug }];
}

/**
 * The demo band (the header's "Bands" link, until a band directory exists) keeps its static page;
 * any other slug is a band created on SoundCircle, read from `GET /bands/:slug` by `BandPage`.
 */
async function BandRoute({ params }: { params: PageProps<"/bands/[slug]">["params"] }): Promise<React.JSX.Element> {
  const { slug } = await params;
  return slug === bandProfile.slug ? <BandProfileView band={bandProfile} /> : <BandPage slug={slug} />;
}

export default function BandRoutePage({ params }: PageProps<"/bands/[slug]">): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.band(bandProfile.slug)} viewer={currentViewer} />
      <Suspense
        fallback={
          <main className={page.page}>
            <div className={`card ${styles.stepCard}`}>
              <span className="muted">Loading the band…</span>
            </div>
          </main>
        }
      >
        <BandRoute params={params} />
      </Suspense>
    </>
  );
}
