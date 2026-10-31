/** Line-art path per instrument slug. An instrument without its own drawing gets the music note. */
const paths: Record<string, string> = {
  guitar:
    "M14 10l6-6M18 2l4 4-2 2-4-4zM11.5 9.5a3.5 3.5 0 0 0-4.3.8 3 3 0 0 0-3.4 1.5 4.6 4.6 0 0 0 1.1 5.8 4.6 4.6 0 0 0 5.8 1.1 3 3 0 0 0 1.5-3.4 3.5 3.5 0 0 0 .8-4.3zM9 15h.01",
  drums: "M4 11c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3zM4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6M6 3l5 6M18 3l-5 6",
  bass: "M13 11l8-8M19 2l3 3M10.5 10.5a3.5 3.5 0 0 0-4.6.5 3.3 3.3 0 0 0-3.2 2.2 4.4 4.4 0 0 0 1.4 5.7 4.4 4.4 0 0 0 5.7 1.4 3.3 3.3 0 0 0 2.2-3.2 3.5 3.5 0 0 0 .5-4.6zM7 16l2-2",
  vocals: "M12 3a3 3 0 0 0-3 3v5a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3M8 21h8",
  keyboard: "M2 6h20v12H2zM6 6v7M10 6v7M14 6v7M18 6v7M8 13v5M12 13v5M16 13v5",
  tabla:
    "M2 10c0-1.1 1.8-2 4-2s4 .9 4 2-1.8 2-4 2-4-.9-4-2zM2 10l1 9h6l1-9M13 12c0-1.4 2.2-2.5 5-2.5s5 1.1 5 2.5-2.2 2.5-5 2.5-5-1.1-5-2.5zM13 12l1.5 7h7l1.5-7",
  bansuri: "M3 19L21 5M7 16h.01M10 13.7h.01M13 11.4h.01M16 9.1h.01",
  violin: "M12 2v5M10.5 2h3M9 8a2.5 2.5 0 0 0 .5 4.5A3.5 3.5 0 0 0 10 20h4a3.5 3.5 0 0 0 .5-7.5A2.5 2.5 0 0 0 15 8zM12 12v5M4 21L20 9",
};

const fallback = "M9 18V5l11-2v13M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM17 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z";

export function InstrumentIcon({ slug, size = 28 }: { slug: string; size?: number }): React.JSX.Element {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[slug] ?? fallback} />
    </svg>
  );
}
