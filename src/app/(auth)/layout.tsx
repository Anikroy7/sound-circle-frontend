import Link from "next/link";
import styles from "@/components/auth/auth.module.css";
import { Avatar } from "@/components/ui/avatar";
import { LogoMark } from "@/components/ui/logo";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { authHighlight } from "@/demo-data/onboarding";
import { routes } from "@/lib/routes";

/** Sign up, log in and profile setup share the brand panel on the left. */
export default function AuthLayout({ children }: LayoutProps<"/">): React.JSX.Element {
  return (
    <div className={styles.shell}>
      <aside className={styles.aside}>
        <div className={styles.asideTop}>
          <Link href={routes.home} className={styles.brand}>
            <LogoMark />
            <span className={`display ${styles.brandName}`}>SoundCircle</span>
          </Link>
          <ThemeSwitcher />
        </div>
        <div className={styles.pitch}>
          <h1 className={`display ${styles.pitchTitle}`}>Every band starts with one profile.</h1>
          <p className={`muted ${styles.pitchLead}`}>
            Tell other musicians what you play and where you are. It takes about three minutes.
          </p>
        </div>
        <div className={`card ${styles.highlight}`}>
          <Avatar initials={authHighlight.initials} tone={authHighlight.tone} size={52} />
          <div>
            <strong>{authHighlight.title}</strong>
            <div className={`muted ${styles.small}`}>{authHighlight.meta}</div>
          </div>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.column}>{children}</div>
      </main>
    </div>
  );
}
