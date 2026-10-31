import type { Metadata } from "next";
import { CreateBandShell } from "@/components/bands/create-band-shell";
import { DetailsStep } from "@/components/bands/create-band-steps";

export const metadata: Metadata = { title: "Create a band" };

export default function CreateBandDetailsStepPage(): React.JSX.Element {
  return (
    <CreateBandShell step="details">
      <DetailsStep />
    </CreateBandShell>
  );
}
