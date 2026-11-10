import type { Metadata } from "next";
import { Suspense } from "react";
import { CardPage } from "@/components/bands/card-page";
import page from "@/components/layout/page.module.css";
import { SiteHeader } from "@/components/layout/site-header";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Membership card" };

async function CardRoute({ params }: { params: PageProps<"/bands/[slug]/card/[memberId]">["params"] }): Promise<React.JSX.Element> {
  const { slug, memberId } = await params;
  return <CardPage slug={slug} memberId={Number(memberId)} />;
}

/** A band member's shareable digital membership card. Public. */
export default function MembershipCardPage({ params }: PageProps<"/bands/[slug]/card/[memberId]">): React.JSX.Element {
  return (
    <>
      <SiteHeader activeHref={routes.bands} />
      <Suspense fallback={<main className={page.page} />}>
        <CardRoute params={params} />
      </Suspense>
    </>
  );
}
