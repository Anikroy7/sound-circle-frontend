import type { ReactNode } from "react";
import styles from "@/components/profile/profile.module.css";
import { Avatar } from "@/components/ui/avatar";
import type { Tone } from "@/types/common";

interface ProfileHeroProps {
  initials: string;
  tone: Tone;
  avatarSize: number;
  /** Photo placeholder for musicians, solid monogram for bands. */
  avatarVariant: "solid" | "tinted";
  name: string;
  status: ReactNode;
  details: ReactNode;
  actions: ReactNode;
  className?: string;
}

/** Avatar, name, status chip and the main actions, at the top of a profile. */
export function ProfileHero({
  initials,
  tone,
  avatarSize,
  avatarVariant,
  name,
  status,
  details,
  actions,
  className,
}: ProfileHeroProps): React.JSX.Element {
  return (
    <section className={`${styles.hero} ${className ?? ""}`}>
      <Avatar
        initials={initials}
        tone={tone}
        size={avatarSize}
        shape="square"
        variant={avatarVariant}
        className={`display ${styles.heroAvatar}`}
      />
      <div className={styles.heroText}>
        <div className={styles.nameRow}>
          <h1 className={`display ${styles.name}`}>{name}</h1>
          {status}
        </div>
        {details}
      </div>
      <div className={styles.heroActions}>{actions}</div>
    </section>
  );
}
