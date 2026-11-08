import type { UploadEndpoints } from "@/lib/cloudinary-upload";
import type { AccountUser, LoginRequest, SignupRequest } from "@/types/auth";
import type { AddMemberRequest, Band, BandInfoRequest, MemberCandidate } from "@/types/band-api";
import type { LocationNode } from "@/types/location";
import type {
  AvailabilitySlot,
  BandExperienceRequest,
  BandInterest,
  CatalogItem,
  MediaTarget,
  MusicianProfile,
  UploadTicket,
} from "@/types/profile";

/** The SoundCircle API. Override with `NEXT_PUBLIC_API_BASE_URL` in `.env.local`. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8020/api/v1";

/** Every API success is wrapped in this envelope. */
interface ApiEnvelope<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}

/**
 * A non-2xx answer. `message` is the API's: a string, or for a validation 400 an object of
 * `{ field: { rule: text } }`. `status` is 0 when the API could not be reached at all.
 */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }

  /** The API's `message`, whatever its shape. */
  get apiMessage(): unknown {
    return (this.body as { message?: unknown } | null)?.message;
  }
}

/** JSON in, envelope out. `credentials: "include"` so the httpOnly auth cookies travel with every call. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: init.body ? { "Content-Type": "application/json" } : undefined,
    });
  } catch {
    throw new ApiError(0, null);
  }

  const body = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(response.status, body);
  return (body as ApiEnvelope<T>).data;
}

/** `{ level: 1 }` lists the divisions; `{ parent_id: id }` lists the children of one location. */
export async function getLocations(query: Record<string, number>): Promise<LocationNode[]> {
  const params = new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
  const response = await fetch(`${API_BASE_URL}/locations?${params}`);
  if (!response.ok) throw new Error(`GET /locations?${params} returned ${response.status}`);

  const body: ApiEnvelope<LocationNode[]> = await response.json();
  return body.data;
}

export function signUp(account: SignupRequest): Promise<AccountUser> {
  return request("/users", { method: "POST", body: JSON.stringify(account) });
}

/** Sets the auth cookies. 401 for a wrong email or password. */
export function logIn(credentials: LoginRequest): Promise<AccountUser> {
  return request("/auth/login", { method: "POST", body: JSON.stringify(credentials) });
}

export function logOut(): Promise<null> {
  return request("/auth/logout", { method: "POST" });
}

/**
 * The signed-in account, or null for a visitor. The access cookie lives 15 minutes, so a 401
 * is retried once after swapping the refresh cookie for a fresh pair.
 */
export async function getCurrentUser(): Promise<AccountUser | null> {
  const me = (): Promise<AccountUser> => request("/auth/me");
  try {
    return await me();
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
  }

  try {
    await request("/auth/refresh", { method: "POST" });
    return await me();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  }
}

/* ------------------------------------------------------------------ profile setup (/profiles/me) */

/** The reference lists change only when the seed does, so each is fetched once per page load. */
const catalogCache = new Map<string, Promise<CatalogItem[]>>();

function catalog(path: "/instruments" | "/genres"): Promise<CatalogItem[]> {
  if (!catalogCache.has(path)) {
    const pending = request<CatalogItem[]>(path);
    // A failed load is not cached, so the next visit tries again.
    pending.catch(() => catalogCache.delete(path));
    catalogCache.set(path, pending);
  }
  return catalogCache.get(path)!;
}

export const getInstruments = (): Promise<CatalogItem[]> => catalog("/instruments");
export const getGenres = (): Promise<CatalogItem[]> => catalog("/genres");

/** The signed-in musician's profile; `id` is null before step 1. 401 for a visitor. */
export const getMyProfile = (): Promise<MusicianProfile> => request("/profiles/me");

const put = (step: string, body: unknown): Promise<MusicianProfile> =>
  request(`/profiles/me/${step}`, { method: "PUT", body: JSON.stringify(body) });

export const saveAbout = (bio: string, locationIds: number[]): Promise<MusicianProfile> => put("about", { bio, location_ids: locationIds });
/** The location set on its own, from the profile page (step 1 sends it with the bio). */
export const saveLocations = (locationIds: number[]): Promise<MusicianProfile> => put("locations", { location_ids: locationIds });
export const saveGenres = (performs: number[], listens: number[]): Promise<MusicianProfile> =>
  put("genres", { performs_genre_ids: performs, listens_genre_ids: listens });
export const saveInstruments = (instruments: MusicianProfile["instruments"]): Promise<MusicianProfile> => put("instruments", { instruments });
export const saveContact = (phone: string, showPhone: boolean): Promise<MusicianProfile> => put("contact", { phone, show_phone: showPhone });
export const saveAvailability = (slots: AvailabilitySlot[]): Promise<MusicianProfile> => put("availability", { slots });
export const saveBandInterest = (bandInterest: BandInterest): Promise<MusicianProfile> => put("band-interest", { band_interest: bandInterest });
export const saveGallery = (videoUrls: string[]): Promise<MusicianProfile> => put("gallery", { video_urls: videoUrls });
export const completeBandExperience = (hasBandExperience: boolean): Promise<MusicianProfile> =>
  put("band-experience", { has_band_experience: hasBandExperience });

export const createBandExperience = (band: BandExperienceRequest): Promise<MusicianProfile> =>
  request("/profiles/me/band-experiences", { method: "POST", body: JSON.stringify(band) });
export const updateBandExperience = (id: number, band: BandExperienceRequest): Promise<MusicianProfile> =>
  request(`/profiles/me/band-experiences/${id}`, { method: "PATCH", body: JSON.stringify(band) });
export const removeBandExperience = (id: number): Promise<MusicianProfile> => request(`/profiles/me/band-experiences/${id}`, { method: "DELETE" });

/** Upload flow (schema-design §4.3): a ticket, the file straight to Cloudinary, then `attachMedia`. */
export const getUploadTicket = (target: MediaTarget): Promise<UploadTicket> =>
  request("/profiles/me/media/signature", { method: "POST", body: JSON.stringify(target) });
export const attachMedia = (target: MediaTarget, publicId: string, fileName: string): Promise<MusicianProfile> =>
  request("/profiles/me/media", { method: "POST", body: JSON.stringify({ ...target, public_id: publicId, file_name: fileName }) });
export const removeMedia = (id: number): Promise<MusicianProfile> => request(`/profiles/me/media/${id}`, { method: "DELETE" });

/** The profile's gallery, or one band experience's photos, for `MediaUploader`. */
export const profileUploadEndpoints = (target: MediaTarget): UploadEndpoints<MusicianProfile> => ({
  ticket: () => getUploadTicket(target),
  attach: (publicId, fileName) => attachMedia(target, publicId, fileName),
  remove: removeMedia,
});

/** The profile photo: the same three-step flow, saved the moment it uploads (not with a step). */
export const getPhotoTicket = (): Promise<UploadTicket> => request("/profiles/me/photo/signature", { method: "POST" });
export const setProfilePhoto = (publicId: string): Promise<MusicianProfile> =>
  request("/profiles/me/photo", { method: "PUT", body: JSON.stringify({ public_id: publicId }) });
export const removeProfilePhoto = (): Promise<MusicianProfile> => request("/profiles/me/photo", { method: "DELETE" });

/* ------------------------------------------------------------------ bands (/bands) */

const bandPath = (id: number, rest: string): string => `/bands/${id}/${rest}`;
const post = <T>(path: string, body?: unknown): Promise<T> => request(path, { method: "POST", body: body === undefined ? undefined : JSON.stringify(body) });

/** The band I'm still creating, or null. */
export const getBandDraft = (): Promise<Band | null> => request("/bands/me/draft");
/** Creation step 1: creates my draft (me as owner) or updates it. */
export const saveBandDraft = (info: BandInfoRequest): Promise<Band> => request("/bands/me/draft", { method: "PUT", body: JSON.stringify(info) });
/** A published band's page. */
export const getBand = (slug: string): Promise<Band> => request(`/bands/${encodeURIComponent(slug)}`);

export const getBandLogoTicket = (id: number): Promise<UploadTicket> => post(bandPath(id, "logo/signature"));
export const setBandLogo = (id: number, publicId: string): Promise<Band> =>
  request(bandPath(id, "logo"), { method: "PUT", body: JSON.stringify({ public_id: publicId }) });

export const searchMemberCandidates = (id: number, query: string): Promise<MemberCandidate[]> =>
  request(bandPath(id, `member-candidates?q=${encodeURIComponent(query)}`));
export const getMemberPhotoTicket = (id: number): Promise<UploadTicket> => post(bandPath(id, "member-photo/signature"));
export const addBandMember = (id: number, member: AddMemberRequest): Promise<Band> => post(bandPath(id, "members"), member);
export const removeBandMember = (id: number, memberId: number): Promise<Band> => request(bandPath(id, `members/${memberId}`), { method: "DELETE" });

/** A band's performance photos, for `MediaUploader`. */
export const bandPhotoEndpoints = (id: number): UploadEndpoints<Band> => ({
  ticket: () => post(bandPath(id, "photos/signature")),
  attach: (publicId, fileName) => post(bandPath(id, "photos"), { public_id: publicId, file_name: fileName }),
  remove: (mediaId) => request(bandPath(id, `photos/${mediaId}`), { method: "DELETE" }),
});
export const saveBandVideos = (id: number, videoUrls: string[]): Promise<Band> =>
  request(bandPath(id, "videos"), { method: "PUT", body: JSON.stringify({ video_urls: videoUrls }) });
export const publishBand = (id: number): Promise<Band> => post(bandPath(id, "publish"));

/**
 * A readable sentence for any failed call. A validation 400's `{ field: { rule: text } }` becomes
 * its first message; anything unexpected becomes a generic one rather than raw JSON.
 */
export function apiErrorMessage(error: unknown): string {
  if (!(error instanceof ApiError)) return "Something went wrong. Please try again.";
  if (error.status === 0) return "We couldn't reach SoundCircle. Check your connection and try again.";
  if (error.status >= 500 && error.status !== 502 && error.status !== 503) return "Something went wrong on our side. Please try again.";

  const first = (value: unknown): string | null => {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.map(first).find(Boolean) ?? null;
    if (value && typeof value === "object") return Object.values(value).map(first).find(Boolean) ?? null;
    return null;
  };
  const message = first(error.apiMessage);
  return message ? `${message.charAt(0).toUpperCase()}${message.slice(1)}${/[.!?]$/.test(message) ? "" : "."}` : "Please check your answers and try again.";
}
