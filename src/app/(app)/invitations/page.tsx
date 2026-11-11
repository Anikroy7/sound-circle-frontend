import { redirect } from "next/navigation";
import { routes } from "@/lib/routes";

/** Invitations are answered on the dashboard now; old links land there. */
export default function InvitationsPage(): never {
  redirect(routes.dashboard);
}
