import type { Metadata } from "next";
import { CreateBandShell } from "@/components/bands/create-band-shell";
import { InviteStep } from "@/components/bands/create-band-steps";

export const metadata: Metadata = { title: "Create a band: invite musicians" };

export default function CreateBandInviteStepPage(): React.JSX.Element {
  return (
    <CreateBandShell step="invite">
      <InviteStep />
    </CreateBandShell>
  );
}
