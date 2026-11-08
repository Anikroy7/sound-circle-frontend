import type { Metadata } from "next";
import { ProfileDone } from "@/components/onboarding/profile-done";

export const metadata: Metadata = { title: "Your profile is ready" };

export default function OnboardingDonePage(): React.JSX.Element {
  return <ProfileDone />;
}
