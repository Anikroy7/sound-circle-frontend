import type { Metadata } from "next";
import { BandWizard } from "@/components/bands/create/band-wizard";

export const metadata: Metadata = { title: "Create a band · Members" };

/** The draft lives behind the signed-in API, so the page is a static shell and the wizard loads it client-side. */
export default function CreateBandMembersPage(): React.JSX.Element {
  return (
    <>
      <BandWizard step="members" />
    </>
  );
}
