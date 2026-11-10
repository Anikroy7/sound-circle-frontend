"use client";

import { useEffect, useRef, useState } from "react";
import styles from "@/components/bands/chemistry.module.css";
import { IntroForm } from "@/components/bands/intro-form";
import { Avatar } from "@/components/ui/avatar";
import { Equalizer } from "@/components/ui/equalizer";
import { getMyProfile, markWelcomed } from "@/lib/api";
import { INTRO_LIMITS } from "@/lib/band-chemistry";
import { initialsOf, toneFor } from "@/lib/person";
import type { Band, BandMember } from "@/types/band-api";

/** A stable pseudo-random in [0, 1) per piece, so the confetti is the same every render (and pure). */
const random = (index: number, salt: number): number => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
};

const COLOURS = ["var(--teal)", "var(--violet)", "var(--amber-soft)", "var(--tone-rose-ink)", "var(--teal-pale)"];
const NOTES = ["♪", "♫", "♬", "♩"];

/** Confetti strips and falling notes: positions, timing, drift and spin, decided once. */
const PIECES = Array.from({ length: 34 }, (_, index) => ({
  note: index % 3 === 0 ? NOTES[index % NOTES.length] : null,
  colour: COLOURS[index % COLOURS.length],
  style: {
    left: `${Math.round(random(index, 1) * 100)}%`,
    "--delay": `${(random(index, 2) * 1.2).toFixed(2)}s`,
    "--duration": `${(2.2 + random(index, 3) * 1.6).toFixed(2)}s`,
    "--drift": `${Math.round((random(index, 4) - 0.5) * 120)}px`,
    "--spin": `${Math.round((random(index, 5) - 0.5) * 720)}deg`,
  } as React.CSSProperties,
}));

function Confetti(): React.JSX.Element {
  return (
    <div className={styles.confetti} aria-hidden="true">
      {PIECES.map((piece, index) =>
        piece.note ? (
          <span key={index} className={`${styles.piece} ${styles.note}`} style={{ ...piece.style, color: piece.colour }}>
            {piece.note}
          </span>
        ) : (
          <span key={index} className={`${styles.piece} ${styles.paper}`} style={{ ...piece.style, background: piece.colour }} />
        ),
      )}
    </div>
  );
}

interface WelcomeModalProps {
  band: Band;
  member: BandMember;
  /** The welcome is done (seen, skipped or introduced): the band as it is now. */
  onDone: (band: Band) => void;
}

/**
 * Shown once to a new member: a celebration, then an optional introduction to the band. Closing at any
 * point counts as seen, so it never shows again.
 */
export function WelcomeModal({ band, member, onDone }: WelcomeModalProps): React.JSX.Element {
  const dialog = useRef<HTMLDialogElement>(null);
  const [step, setStep] = useState<"welcome" | "intro">("welcome");
  const [genres, setGenres] = useState<number[] | null>(null);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    return () => element?.close();
  }, []);

  // Start their favourite genres from the ones on their profile.
  useEffect(() => {
    getMyProfile().then(
      (profile) => setGenres(profile.performs_genre_ids.slice(0, INTRO_LIMITS.genres)),
      () => setGenres([]),
    );
  }, []);

  const skip = async (): Promise<void> => {
    setClosing(true);
    try {
      onDone(await markWelcomed(band.id));
    } catch {
      onDone(band);
    }
  };

  const instrument = member.instrument?.name ?? member.position;

  return (
    <dialog
      ref={dialog}
      className={styles.welcome}
      aria-labelledby="welcome-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!closing) skip();
      }}
    >
      {step === "welcome" ? (
        <div className={styles.welcomeStage}>
          <Confetti />
          <div className={styles.pair}>
            <Avatar initials={initialsOf(band.name)} tone={toneFor(band.id)} size={88} shape="square" photoUrl={band.logo_url} className="display" />
            <Avatar initials={initialsOf(member.name)} tone={member.user_id ? toneFor(member.user_id) : "slate"} size={88} photoUrl={member.photo_url} className="display" />
          </div>
          <Equalizer bars={[14, 22, 10, 26, 16]} barWidth={5} gap={4} />
          <h2 id="welcome-title" className={`display ${styles.welcomeTitle}`}>
            Welcome to the Band!
          </h2>
          <p className={styles.welcomeLead}>
            <strong>{member.name}</strong>, you&apos;re now part of <strong>{band.name}</strong>
            {instrument && ` on ${instrument.toLowerCase()}`}.
          </p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setStep("intro")}>
            Explore Your Band
          </button>
        </div>
      ) : (
        <div className={styles.introStep}>
          <div>
            <h2 id="welcome-title" className="panel-title">
              Introduce yourself
            </h2>
            <p className="muted">Let {band.name} know who&apos;s joining. You can do this later from the band dashboard.</p>
          </div>
          {genres === null ? (
            <span className="muted">Loading…</span>
          ) : (
            <IntroForm
              bandId={band.id}
              initial={{ intro: "", genre_ids: genres, interests: [] }}
              onSaved={onDone}
              secondary={
                <button type="button" className="btn btn-ghost" onClick={skip} disabled={closing}>
                  Skip for now
                </button>
              }
            />
          )}
        </div>
      )}
    </dialog>
  );
}
