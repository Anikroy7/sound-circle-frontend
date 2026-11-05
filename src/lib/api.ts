import type { LocationNode } from "@/types/location";

/** The SoundCircle API. Override with `NEXT_PUBLIC_API_BASE_URL` in `.env.local`. */
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8020/api/v1";

/** Every API success is wrapped in this envelope. */
interface ApiEnvelope<T> {
  success: boolean;
  status_code: number;
  message: string;
  data: T;
}

/** `{ level: 1 }` lists the divisions; `{ parent_id: id }` lists the children of one location. */
export async function getLocations(query: Record<string, number>): Promise<LocationNode[]> {
  const params = new URLSearchParams(Object.entries(query).map(([key, value]) => [key, String(value)]));
  const response = await fetch(`${API_BASE_URL}/locations?${params}`);
  if (!response.ok) throw new Error(`GET /locations?${params} returned ${response.status}`);

  const body: ApiEnvelope<LocationNode[]> = await response.json();
  return body.data;
}
