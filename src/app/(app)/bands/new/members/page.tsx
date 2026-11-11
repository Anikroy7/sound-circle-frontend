import type { Metadata } from "next";
import { BandWizard } from "@/components/bands/create/band-wizard";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Create a band · Members" };

/** The draft lives behind the signed-in API, so the page is a static shell and the wizard loads it client-side. */
export default function CreateBandMembersPage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.createBand} />
      <BandWizard step="members" />
    </>
  );
}
