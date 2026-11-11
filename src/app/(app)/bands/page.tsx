import type { Metadata } from "next";
import { Suspense } from "react";
import { BandSearch } from "@/components/bands/band-search";

export const metadata: Metadata = { title: "Bands" };

/** The filters live in the URL, read client-side, so the search sits in a Suspense boundary. */
export default function BandsPage(): React.JSX.Element {
  return (
    <Suspense>
      <BandSearch />
    </Suspense>
  );
}
