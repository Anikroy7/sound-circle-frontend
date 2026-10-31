import Link from "next/link";
import styles from "@/components/landing/landing.module.css";
import { Waveform } from "@/components/ui/waveform";
import { routes } from "@/lib/routes";
import { waveformBars } from "@/lib/waveform";

const FOOTER_BARS = waveformBars(160, 3.3, 10, 100);

const footerLinks = [
  { href: routes.about, label: "About" },
  { href: routes.contact, label: "Contact" },
  { href: routes.communityGuidelines, label: "Community Guidelines" },
  { href: routes.privacy, label: "Privacy Policy" },
];

/** Cached, so the copyright year is read once when the page is prerendered rather than on every request. */
export async function SiteFooter(): Promise<React.JSX.Element> {
  "use cache";

  return (
    <footer className={styles.footer}>
      <Waveform bars={FOOTER_BARS} color="var(--teal)" className={styles.footerWave} />
      <div className={`${styles.container} ${styles.footerInner}`}>
        <div className={styles.footerBrand}>
          <span className={`display ${styles.footerName}`}>SoundCircle</span>
          <span className={`muted ${styles.footerCopy}`}>Made for musicians in Bangladesh · © {new Date().getFullYear()} SoundCircle</span>
        </div>
        <nav aria-label="Footer" className={styles.footerNav}>
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
