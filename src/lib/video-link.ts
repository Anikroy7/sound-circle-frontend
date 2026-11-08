import type { VideoProvider } from "@/types/profile";

/**
 * Which platform a video link is on, for the preview badge and instant feedback — or null when the
 * link is not a YouTube, Facebook or Vimeo video. A lighter mirror of the API's `video-link.util.ts`,
 * which has the final say.
 */
export function detectVideoProvider(raw: string): VideoProvider | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^(www|m|mobile|web|music)\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "youtu.be" && /^[\w-]{11}$/.test(parts[0] ?? "")) return 1;
  if (host === "youtube.com") {
    const id = parts[0] === "watch" ? url.searchParams.get("v") : ["shorts", "embed", "live", "v"].includes(parts[0]) ? parts[1] : null;
    if (id && /^[\w-]{11}$/.test(id)) return 1;
  }
  if ((host === "vimeo.com" || host === "player.vimeo.com") && parts.some((part) => /^\d{5,20}$/.test(part))) return 2;
  if (host === "fb.watch" && parts[0]) return 3;
  if ((host === "facebook.com" || host === "fb.com") && (url.searchParams.get("v") || parts[0] === "reel" || parts.includes("videos"))) return 3;
  return null;
}
