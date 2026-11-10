"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "@/components/bands/chemistry.module.css";
import { CardShare, MembershipCardView } from "@/components/bands/membership-card";
import page from "@/components/layout/page.module.css";
import { ApiError, apiErrorMessage, getMembershipCard } from "@/lib/api";
import { routes } from "@/lib/routes";
import type { MembershipCard } from "@/types/band-api";

/** A member's shareable membership card, from `GET /bands/:slug/members/:memberId/card`. */
export function CardPage({ slug, memberId }: { slug: string; memberId: number }): React.JSX.Element {
  const [card, setCard] = useState<MembershipCard | null>(null);
  const [error, setError] = useState<{ status: number; message: string } | null>(null);

  useEffect(() => {
    let live = true;
    getMembershipCard(slug, memberId).then(
      (loaded) => live && setCard(loaded),
      (failure: unknown) => live && setError({ status: failure instanceof ApiError ? failure.status : 0, message: apiErrorMessage(failure) }),
    );
    return () => {
      live = false;
      setCard(null);
      setError(null);
    };
  }, [slug, memberId]);

  if (error) {
    return (
      <main className={page.page}>
        <div className="card panel" role="alert">
          <h1 className="panel-title">{error.status === 404 ? "Card not found" : "We couldn't load this card"}</h1>
          {error.status !== 404 && <p className="muted">{error.message}</p>}
          <Link href={routes.bands}>Browse bands</Link>
        </div>
      </main>
    );
  }

  if (!card) {
    return (
      <main className={page.page} aria-busy="true">
        <span className="muted">Loading…</span>
      </main>
    );
  }

  return (
    <main className={page.page}>
      <div className={styles.cardPage}>
        <MembershipCardView card={card} />
        <CardShare card={card} memberId={card.member.id} />
        <Link href={routes.band(card.band.slug)}>Visit {card.band.name}</Link>
      </div>
    </main>
  );
}
