import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfileWizard } from "@/components/onboarding/profile-wizard";
import { PROFILE_STEPS, type ProfileStepSlug } from "@/lib/profile-steps";

/**
 * The eight steps are prerendered. Cache Components forbids `dynamicParams = false`, so any other slug
 * reaches the page and gets `notFound()` there.
 */
export function generateStaticParams(): { step: ProfileStepSlug }[] {
  return PROFILE_STEPS.map((step) => ({ step: step.slug }));
}

const find = (slug: string): (typeof PROFILE_STEPS)[number] | undefined => PROFILE_STEPS.find((step) => step.slug === slug);

export async function generateMetadata({ params }: PageProps<"/onboarding/[step]">): Promise<Metadata> {
  const { step } = await params;
  return { title: `${find(step)?.title ?? "Profile setup"} · Profile setup` };
}

/** The profile lives behind the signed-in API, so the page is a static shell and the wizard loads it client-side. */
export default async function OnboardingStepPage({ params }: PageProps<"/onboarding/[step]">): Promise<React.JSX.Element> {
  const { step } = await params;
  const match = find(step);
  if (!match) notFound();

  return <ProfileWizard slug={match.slug} />;
}
