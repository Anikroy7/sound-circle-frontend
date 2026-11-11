import type { Metadata } from "next";
import { MyProfile } from "@/components/profile/my-profile";

export const metadata: Metadata = { title: "My profile" };

/** The profile lives behind the signed-in API, so the page is a static shell and `MyProfile` loads it client-side. */
export default function MyProfilePage(): React.JSX.Element {
  return (
    <>
      <MyProfile />
    </>
  );
}
