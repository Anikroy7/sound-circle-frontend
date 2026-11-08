import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { MusicianProfileView } from "@/components/profile/musician-profile";
import { musicianProfile } from "@/demo-data/musician-profile";
import { currentViewer } from "@/demo-data/session";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: `${musicianProfile.name}, drummer` };

export function generateStaticParams(): { slug: string }[] {
  return [{ slug: musicianProfile.slug }];
}

/** Demo: every musician slug renders the one profile in `demo-data` until the API exists. */
export default function MusicianPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.musicians} viewer={currentViewer} />
      <MusicianProfileView musician={musicianProfile} />
    </>
  );
}
