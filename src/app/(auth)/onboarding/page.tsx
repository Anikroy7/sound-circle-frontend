import type { Metadata } from "next";
import { ResumeRedirect } from "@/components/onboarding/resume-redirect";

export const metadata: Metadata = { title: "Profile setup" };

/** Where "continue later" leads back to: sends the musician on to their first unfinished step. */
export default function OnboardingResumePage(): React.JSX.Element {
  return <ResumeRedirect />;
}
