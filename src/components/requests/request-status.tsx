import type { RequestStatus } from "@/types/discovery";

const STATUS: Record<RequestStatus, { label: string; chip: string }> = {
  1: { label: "Pending", chip: "chip-amber" },
  2: { label: "Accepted", chip: "chip-teal" },
  3: { label: "Declined", chip: "chip-rose" },
  4: { label: "Withdrawn", chip: "chip-muted" },
  5: { label: "Expired", chip: "chip-muted" },
};

export function RequestStatusChip({ status, className = "" }: { status: RequestStatus; className?: string }): React.JSX.Element {
  const { label, chip } = STATUS[status] ?? STATUS[1];
  return <span className={`chip ${chip} ${className}`}>{label}</span>;
}

/** Tells the header badge (and anything else listening) that an invitation or request was answered or sent. */
export const announceInboxChange = (): void => {
  window.dispatchEvent(new Event("sc:inbox-changed"));
};

/** "3 days ago", "just now": enough for a dashboard row. */
export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units: [number, string][] = [
    [86400 * 30, "month"],
    [86400 * 7, "week"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];
  for (const [size, name] of units) {
    const count = Math.floor(seconds / size);
    if (count >= 1) return `${count} ${name}${count === 1 ? "" : "s"} ago`;
  }
  return "just now";
}
