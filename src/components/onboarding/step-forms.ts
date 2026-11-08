import { AboutStep } from "@/components/onboarding/steps/about-step";
import { AvailabilityStep } from "@/components/onboarding/steps/availability-step";
import { BandExperienceStep } from "@/components/onboarding/steps/band-experience-step";
import { BandInterestStep } from "@/components/onboarding/steps/band-interest-step";
import { ContactStep } from "@/components/onboarding/steps/contact-step";
import { GalleryStep } from "@/components/onboarding/steps/gallery-step";
import { GenresStep } from "@/components/onboarding/steps/genres-step";
import { InstrumentsStep } from "@/components/onboarding/steps/instruments-step";
import type { ProfileStepSlug } from "@/lib/profile-steps";

/** Each step's form. Used by the setup wizard and, in edit mode, by the profile page's editor. */
export const STEP_FORMS: Record<ProfileStepSlug, () => React.JSX.Element> = {
  about: AboutStep,
  genres: GenresStep,
  instruments: InstrumentsStep,
  contact: ContactStep,
  availability: AvailabilityStep,
  "band-interest": BandInterestStep,
  gallery: GalleryStep,
  "band-experience": BandExperienceStep,
};
