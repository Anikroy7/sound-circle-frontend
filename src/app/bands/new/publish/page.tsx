import type { Metadata } from "next";
import { CreateBandShell } from "@/components/bands/create-band-shell";
import { PublishStep } from "@/components/bands/create-band-steps";

export const metadata: Metadata = { title: "Create a band: publish" };

export default function CreateBandPublishStepPage(): React.JSX.Element {
  return (
    <CreateBandShell step="publish">
      <PublishStep />
    </CreateBandShell>
  );
}
