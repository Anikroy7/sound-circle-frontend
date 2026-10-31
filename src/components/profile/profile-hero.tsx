import type { ReactNode } from "react";
import page from "@/components/layout/page.module.css";
import styles from "@/components/profile/profile.module.css";
import { Avatar } from "@/components/ui/avatar";
import { tones } from "@/lib/tones";
import type { Tone } from "@/types/common";

interface ProfileCoverProps {
  tone: Tone;
  caption: string;
  className: string;
}

/** Full-bleed striped stand-in for the cover photo, captioned bottom-right. */
export function ProfileCover({ tone, caption, className }: ProfileCoverProps): React.JSX.Element {
  return (
    <div className={`photo-placeholder ${page.cover} ${className}`} style={{ backgroundColor: tones[tone].tint }}>
      <div className={page.coverInner}>
        <span className={`chip ${page.coverCaption}`}>Cover photo · {caption}</span>
      </div>
    </div>
  );
}

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
  /** How far the hero is pulled up over the cover, in px. */
  overlap: number;
  className?: string;
}

/** Avatar, name, status chip and the main actions, overlapping the bottom of the cover. */
export function ProfileHero({
  initials,
  tone,
  avatarSize,
  avatarVariant,
  name,
  status,
  details,
  actions,
  overlap,
  className,
}: ProfileHeroProps): React.JSX.Element {
  return (
    <section className={`${styles.hero} ${className ?? ""}`} style={{ marginTop: -overlap }}>
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
