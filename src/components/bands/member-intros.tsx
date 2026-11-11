import Link from "next/link";
import styles from "@/components/bands/chemistry.module.css";
import { Avatar } from "@/components/ui/avatar";
import { interestLabel } from "@/lib/band-chemistry";
import { initialsOf, toneFor } from "@/lib/person";
import { routes } from "@/lib/routes";
import type { BandMember } from "@/types/band-api";

const hasIntro = (member: BandMember): boolean => !!member.intro || member.intro_genres.length > 0 || member.interests.length > 0;

/**
 * "Meet the band": each member's introduction as a card. Shows nothing until someone has introduced
 * themselves; `onIntroduce` offers the viewer the chance when they're a member who hasn't yet.
 */
export function MemberIntros({
  members,
  viewerMemberId,
  introduceHref,
}: {
  members: BandMember[];
  viewerMemberId: number | null;
  introduceHref?: string;
}): React.JSX.Element | null {
  const introduced = members.filter(hasIntro);
  const me = members.find((member) => member.id === viewerMemberId);
  const invite = me && !hasIntro(me) && introduceHref;
  if (!introduced.length && !invite) return null;

  return (
    <section className="card panel" aria-labelledby="meet">
      <div className={styles.head}>
        <h2 id="meet" className="panel-title">
          Meet the band
        </h2>
        {invite && (
          <Link href={introduceHref} className="btn btn-secondary btn-sm">
            Introduce yourself
          </Link>
        )}
      </div>
      {introduced.length ? (
        <div className={styles.intros}>
          {introduced.map((member) => (
            <article key={member.id} className={styles.introCard}>
              <div className={styles.introHead}>
                <Avatar
                  initials={initialsOf(member.name)}
                  tone={member.user_id ? toneFor(member.user_id) : "slate"}
                  size={40}
                  photoUrl={member.photo_url}
                />
                <span>
                  {member.profile_slug ? (
                    <Link href={routes.musician(member.profile_slug)}>
                      <strong>{member.name}</strong>
                    </Link>
                  ) : (
                    <strong>{member.name}</strong>
                  )}
                  {member.instrument?.name ?? member.position ?? (member.is_owner ? "Founder" : "Member")}
                </span>
              </div>
              {member.intro && <p className={styles.introText}>{member.intro}</p>}
              {(member.intro_genres.length > 0 || member.interests.length > 0) && (
                <div className={styles.tags}>
                  {member.intro_genres.map((genre) => (
                    <span key={`g${genre.id}`} className="chip chip-teal">
                      {genre.name}
                    </span>
                  ))}
                  {member.interests.map((interest) => (
                    <span key={`i${interest}`} className="chip chip-violet">
                      {interestLabel(interest)}
                    </span>
                  ))}
                </div>
              )}
            </article>
          ))}
        </div>
      ) : (
        <span className="muted">No introductions yet.</span>
      )}
    </section>
  );
}
