/** `locations.level` on the backend: 1 division · 2 district · 3 upazila or city corporation · 4 thana or area. */
export type LocationLevel = 1 | 2 | 3 | 4;

/** `locations.type`: 1 division · 2 district · 3 upazila · 4 city corporation · 5 thana · 6 area. */
export type LocationType = 1 | 2 | 3 | 4 | 5 | 6;

/** One row from `GET /locations`. */
export interface LocationNode {
  id: number;
  parent_id: number | null;
  level: LocationLevel;
  type: LocationType;
  name: string;
  name_bn: string | null;
  /** More than 0 means the picker can drill into it. */
  child_count: number;
  /** The place's centre; null where the data has none (city corporations, thanas). */
  latitude: number | null;
  longitude: number | null;
  /** Only with `near_location_id`: kilometres from that place's centre. */
  distance_km?: number;
}

