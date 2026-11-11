import { AppShell } from "@/components/shell/app-shell";

/** Every page outside sign-up / log-in / profile setup lives in the app shell (sidebar, top bar, tabs). */
export default function AppLayout({ children }: LayoutProps<"/">): React.JSX.Element {
  return <AppShell>{children}</AppShell>;
}
