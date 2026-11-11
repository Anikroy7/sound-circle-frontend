import type { Metadata } from "next";
import { Suspense } from "react";
import { MusicianSearch } from "@/components/musicians/musician-search";

export const metadata: Metadata = { title: "Musicians" };

/** The filters live in the URL, read client-side, so the search sits in a Suspense boundary. */
export default function MusiciansPage(): React.JSX.Element {
  return (
    <Suspense>
      <MusicianSearch />
    </Suspense>
  );
}
