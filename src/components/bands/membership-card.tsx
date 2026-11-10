"use client";

import { useState } from "react";
import styles from "@/components/bands/chemistry.module.css";
import { Avatar } from "@/components/ui/avatar";
import { Waveform } from "@/components/ui/waveform";
import { formatDate } from "@/lib/band-chemistry";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";

/** What a card shows: the same for the public card page and the band dashboard. */
export interface CardData {
  code: string;
  band: { id: number; name: string; slug: string | null; logo_url: string | null };
  member: { name: string; photo_url: string | null; instrument: string | null; is_owner: boolean; joined_at: string; user_id?: number | null };
}

const WAVE = [30, 55, 40, 80, 60, 95, 70, 45, 85, 50, 65, 35, 75, 90, 55, 40, 70, 60, 85, 45, 30, 65, 50, 80, 40, 60, 35, 70, 55, 45];

/** A member's digital membership card. */
export function MembershipCardView({ card }: { card: CardData }): React.JSX.Element {
  const role = [card.member.instrument, card.member.is_owner ? "Founder" : null].filter(Boolean).join(" · ") || "Member";
  return (
    <div className={styles.card} role="img" aria-label={`${card.band.name} membership card for ${card.member.name}, ${role}, number ${card.code}`}>
      <div className={styles.cardTop}>
        <span className={styles.cardBand}>
          <Avatar initials={initialsOf(card.band.name)} tone={toneFor(card.band.id)} size={40} shape="square" photoUrl={card.band.logo_url} />
          <span className={styles.cardWho}>
            <span className={styles.cardKicker}>Official member</span>
            <span className={styles.cardBandName}>{card.band.name}</span>
          </span>
        </span>
        <span className={styles.cardKicker}>SoundCircle</span>
      </div>
      <Waveform bars={WAVE} color="#93c5fd" className={styles.cardWave} />
      <div>
        <div className={styles.cardBottom}>
          <Avatar initials={initialsOf(card.member.name)} tone={toneFor(card.member.user_id ?? card.band.id)} size={60} photoUrl={card.member.photo_url} />
          <span className={styles.cardWho}>
            <span className={styles.cardName}>{card.member.name}</span>
            <span className={styles.cardRole}>{role}</span>
          </span>
        </div>
        <div className={styles.cardMeta}>
          <span>MEMBER SINCE {formatDate(card.member.joined_at).toUpperCase()}</span>
          <span>{card.code}</span>
        </div>
      </div>
    </div>
  );
}

/** Share (the system share sheet where there is one) and copy the card's public link. */
export function CardShare({ card, memberId }: { card: CardData; memberId: number }): React.JSX.Element | null {
  const [copied, setCopied] = useState(false);
  if (!card.band.slug) return null;
  const url = (): string => `${window.location.origin}${routes.membershipCard(card.band.slug!, memberId)}`;
  const title = `${card.member.name} · ${card.band.name} membership card`;

  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(url());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url());
    }
  };

  const share = async (): Promise<void> => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `I'm a member of ${card.band.name} on SoundCircle`, url: url() });
        return;
      } catch {
        // Cancelled, or the share sheet failed: fall back to copying.
      }
    }
    await copy();
  };

  return (
    <div className={styles.cardActions}>
      <button type="button" className="btn btn-primary btn-sm" onClick={share}>
        Share card
      </button>
      <button type="button" className="btn btn-secondary btn-sm" onClick={copy} aria-live="polite">
        {copied ? "Link copied" : "Copy link"}
      </button>
    </div>
  );
}
