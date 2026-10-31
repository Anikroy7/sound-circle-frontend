import Link from "next/link";
import styles from "@/components/dashboard/dashboard.module.css";
import { Avatar } from "@/components/ui/avatar";
import { routes } from "@/lib/routes";
import { chipClass } from "@/lib/tones";
import type { DashboardBand } from "@/types/dashboard";

function BandRow({ band, href }: { band: DashboardBand; href: string }): React.JSX.Element {
  const roles = band.roles;

  return (
    <Link href={href} className={`inset ${styles.band}`}>
      <Avatar initials={band.monogram} tone={band.tone} size={56} shape="square" />
      <span className={styles.bandText}>
        <strong className={`display ${styles.bandName}`}>{band.name}</strong>
        <span className={`muted ${styles.small}`}>{band.meta}</span>
        {roles && (
          <span className={styles.roleMeter} role="img" aria-label={`${roles.filled} of ${roles.total} roles filled`}>
            {Array.from({ length: roles.total }, (_, index) => (
              <span key={index} className={index < roles.filled ? styles.filled : undefined} />
            ))}
          </span>
        )}
      </span>
      <span className={styles.bandBadges}>
        <span className={`chip ${chipClass(band.badge.tone)}`}>{band.badge.label}</span>
        {roles && (
          <span className={`muted ${styles.small}`}>
            {roles.filled} of {roles.total} roles filled
          </span>
        )}
      </span>
    </Link>
  );
}

export function MyBands({ owned, member }: { owned: DashboardBand[]; member: DashboardBand[] }): React.JSX.Element {
  return (
    <div className={styles.twoUp}>
      <section className={`card panel ${styles.tile}`}>
        <div className={styles.head}>
          <h2 className={`panel-title ${styles.title}`}>My created bands</h2>
          <Link className="btn btn-secondary btn-sm" href={routes.createBand}>
            + New band
          </Link>
        </div>
        {owned.map((band) => (
          <BandRow key={band.slug} band={band} href={routes.manageBand(band.slug)} />
        ))}
      </section>
      <section className={`card panel ${styles.tile}`}>
        <h2 className={`panel-title ${styles.title}`}>Bands I belong to</h2>
        {member.map((band) => (
          <BandRow key={band.slug} band={band} href={routes.band(band.slug)} />
        ))}
      </section>
    </div>
  );
}
