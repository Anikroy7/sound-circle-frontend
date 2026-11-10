import type { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { MyProfile } from "@/components/profile/my-profile";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "My profile" };

/** The profile lives behind the signed-in API, so the page is a static shell and `MyProfile` loads it client-side. */
export default function MyProfilePage(): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.myProfile} />
      <MyProfile />
    </>
  );
}
