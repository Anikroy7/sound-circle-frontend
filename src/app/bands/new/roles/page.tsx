import type { Metadata } from "next";
import { CreateBandShell } from "@/components/bands/create-band-shell";
import { RolesStep } from "@/components/bands/create-band-steps";

export const metadata: Metadata = { title: "Create a band: roles" };

export default function CreateBandRolesStepPage(): React.JSX.Element {
  return (
    <CreateBandShell step="roles">
      <RolesStep />
    </CreateBandShell>
  );
}
