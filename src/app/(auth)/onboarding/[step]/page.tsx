import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProfileWizard } from "@/components/onboarding/profile-wizard";
import { SETUP_STAGES, stageOfSection, type SetupStageSlug } from "@/lib/profile-steps";
import { routes } from "@/lib/routes";

/**
 * The four setup pages are prerendered. Cache Components forbids `dynamicParams = false`, so any other
 * slug reaches the page: an old one-section link (`/onboarding/genres`) goes to the page that holds
 * that section now, anything else is `notFound()`.
 */
export function generateStaticParams(): { step: SetupStageSlug }[] {
  return SETUP_STAGES.map((stage) => ({ step: stage.slug }));
}

const find = (slug: string): (typeof SETUP_STAGES)[number] | undefined => SETUP_STAGES.find((stage) => stage.slug === slug);

export async function generateMetadata({ params }: PageProps<"/onboarding/[step]">): Promise<Metadata> {
  const { step } = await params;
  return { title: `${find(step)?.title ?? "Profile setup"} · Profile setup` };
}

/** The profile lives behind the signed-in API, so the page is a static shell and the wizard loads it client-side. */
export default async function OnboardingStepPage({ params }: PageProps<"/onboarding/[step]">): Promise<React.JSX.Element> {
  const { step } = await params;
  const match = find(step);
  if (!match) {
    const holder = stageOfSection(step);
    if (holder) redirect(routes.onboarding.step(holder.slug));
    notFound();
  }

  return <ProfileWizard slug={match.slug} />;
}
