"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/components/auth/auth.module.css";
import { AlertCircleIcon } from "@/components/ui/icons";
import { API_BASE_URL, getLocations } from "@/lib/api";
import type { LocationNode, LocationType, PickedLocation } from "@/types/location";

const CITY_CORPORATION: LocationType = 4;
const TYPE_NAMES: Record<LocationType, [singular: string, plural: string]> = {
  1: ["division", "divisions"],
  2: ["district", "districts"],
  3: ["upazila", "upazilas"],
  4: ["city corporation", "city corporations"],
  5: ["thana", "thanas"],
  6: ["area", "areas"],
};
const DIVISIONS = "divisions";
/** "Nearby" in the summary: same-level places whose centre is within this many km. */
const NEARBY_RADIUS_KM = 20;
const nearbyKey = (id: number): string => `near-${id}`;

/** The four cascading steps. Each unlocks once the step before it has a value; `groups` sets the optgroup order. */
const STEPS: { title: string; waiting: string; hint: string; groups?: LocationType[] }[] = [
  { title: "Division", waiting: "", hint: "All 8 divisions" },
  { title: "District", waiting: "Select division first", hint: "Districts are filtered by division" },
  { title: "City Corporation / Upazila", waiting: "Select district first", hint: "City corporations first, then upazilas", groups: [4, 3] },
  { title: "Thana / Area", waiting: "Select city corporation / upazila first", hint: "The most specific place", groups: [5, 6] },
];

/** "Dhaka North City Corporation" already says what it is; "Savar" needs "upazila". */
const describe = (node: LocationNode): string => (node.type === CITY_CORPORATION ? node.name : `${node.name} ${TYPE_NAMES[node.type][0]}`);

const optionLabel = (node: LocationNode): string => (node.name_bn ? `${node.name} — ${node.name_bn}` : node.name);

/**
 * Where the user is available to join a band, not where they live. Cascading dropdowns narrow
 * down to one place ("All of …" stops at the level above), and "Add location" collects it; repeat
 * for as many places as needed. Every list comes live from `GET /locations`.
 */
export function LocationPicker(): React.JSX.Element {
  /** Loaded lists: `"divisions"`, or a parent id → its children. */
  const [lists, setLists] = useState<Record<string, LocationNode[]>>({});
  const [error, setError] = useState<string | null>(null);
  /** The current choice in each dropdown, division first. */
  const [path, setPath] = useState<LocationNode[]>([]);
  const [picks, setPicks] = useState<PickedLocation[]>([]);
  const requested = useRef(new Set<string>());

  const load = useCallback((key: string, query: Record<string, number>): void => {
    if (requested.current.has(key)) return;
    requested.current.add(key);

    getLocations(query).then(
      (rows) => setLists((current) => ({ ...current, [key]: rows })),
      (failure: Error) => {
        requested.current.delete(key);
        setError(
          `Couldn't load locations from ${API_BASE_URL} (${failure.message}). Is the API running, and is this site's origin in its CORS_ALLOWED_ORIGINS?`,
        );
      },
    );
  }, []);

  useEffect(() => load(DIVISIONS, { level: 1 }), [load]);

  const optionsFor = (step: number): LocationNode[] | undefined =>
    step === 0 ? lists[DIVISIONS] : path[step - 1] ? lists[String(path[step - 1].id)] : undefined;

  /** Changing a step clears every step below it. */
  const choose = (step: number, value: string): void => {
    const node = optionsFor(step)?.find((option) => String(option.id) === value);
    const next = path.slice(0, step);
    if (node) {
      next.push(node);
      if (node.child_count > 0) load(String(node.id), { parent_id: node.id });
      if (node.latitude !== null) load(nearbyKey(node.id), { near_location_id: node.id, radius_km: NEARBY_RADIUS_KM, level: node.level });
    }
    setPath(next);
  };

  /** "2 city corporations and 5 upazilas", once the children are loaded. */
  const describeChildren = (node: LocationNode): string => {
    const children = lists[String(node.id)];
    if (!children) return `${node.child_count} places`;

    const counts = new Map<LocationType, number>();
    children.forEach((child) => counts.set(child.type, (counts.get(child.type) ?? 0) + 1));
    const parts = [...counts].map(([type, count]) => `${count} ${TYPE_NAMES[type][count === 1 ? 0 : 1]}`);
    return parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
  };

  /** "Dhamrai 15.7 km, Singair 16.8 km" — from PostGIS, via `GET /locations?near_location_id=`. */
  const describeNearby = (node: LocationNode): string => {
    if (node.latitude === null) return "No centre point for this place yet, so no nearby search.";
    const nearby = lists[nearbyKey(node.id)];
    if (!nearby) return "Finding nearby places…";

    const others = nearby.filter((place) => place.id !== node.id).slice(0, 4);
    return others.length
      ? `Nearby: ${others.map((place) => `${place.name} ${place.distance_km} km`).join(", ")}`
      : `Nothing else at this level within ${NEARBY_RADIUS_KM} km.`;
  };

  const target = path[path.length - 1];
  const ancestors = path.slice(0, -1).map((node) => node.id);
  const coveredBy = target && picks.find((pick) => pick.id === target.id || ancestors.includes(pick.id));

  const add = (): void => {
    if (!target || coveredBy) return;
    // A wider pick replaces the narrower ones inside it, as the API does on save.
    setPicks((current) => [...current.filter((pick) => !pick.ancestors.includes(target.id)), { ...target, ancestors }]);
    setPath(path.slice(0, 1));
  };

  const remove = (id: number): void => setPicks((current) => current.filter((pick) => pick.id !== id));

  const placeholder = (step: number): string => {
    const parent = path[step - 1];
    if (step === 0) return lists[DIVISIONS] ? "Select division" : "Loading divisions…";
    if (!parent) return STEPS[step].waiting;
    if (parent.child_count === 0) return parent.type === CITY_CORPORATION ? "No thanas listed yet" : "No areas listed yet";
    if (!optionsFor(step)) return "Loading…";
    return `All of ${parent.name}`;
  };

  /** Grouped like Delivery7 ("City Corporation", then "Upazila") where a step has groups and the list mixes them. */
  const renderOptions = (step: number, options: LocationNode[]): React.ReactNode => {
    const groups = STEPS[step].groups?.filter((type) => options.some((option) => option.type === type));
    const item = (option: LocationNode): React.JSX.Element => (
      <option key={option.id} value={option.id}>
        {optionLabel(option)}
      </option>
    );
    if (!groups?.length) return options.map(item);

    return groups.map((type) => (
      <optgroup key={type} label={TYPE_NAMES[type][0].replace(/^\w/, (letter) => letter.toUpperCase())}>
        {options.filter((option) => option.type === type).map(item)}
      </optgroup>
    ));
  };

  const ids = picks.map((pick) => pick.id);

  return (
    <fieldset className="fieldset">
      <legend className="label">Where can you play?</legend>
      <div className={styles.locationBody}>
        <span className="field-hint">Choose a division, then narrow it down or leave the rest on &ldquo;All&rdquo;. Add as many places as you like.</span>

        {error && (
          <span className="field-error" role="alert">
            <AlertCircleIcon />
            {error}
          </span>
        )}

        <div className="field-row">
          {STEPS.map((step, index) => {
            const options = optionsFor(index);
            return (
              <label key={step.title} className="field">
                <span className={`label ${styles.stepLabel}`}>
                  <span className={styles.stepNo}>{index + 1}</span>
                  {step.title}
                </span>
                <select
                  className="input"
                  value={path[index] ? String(path[index].id) : ""}
                  disabled={!options?.length}
                  onChange={(event) => choose(index, event.target.value)}
                >
                  <option value="">{placeholder(index)}</option>
                  {options && renderOptions(index, options)}
                </select>
                <span className="field-hint">{step.hint}</span>
              </label>
            );
          })}
        </div>

        <div className={`card ${styles.locationSummary}`}>
          <div className={styles.summaryText}>
            <span className="field-hint">Selected area</span>
            <strong>{target ? [...path].reverse().map(describe).join(", ") : "—"}</strong>
            {target && (
              <span className="field-hint">
                {coveredBy
                  ? `Already covered by ${describe(coveredBy)}.`
                  : target.child_count > 0
                    ? `Includes ${describeChildren(target)}, and everything inside them.`
                    : "A single place."}
              </span>
            )}
            {target && <span className="field-hint">{describeNearby(target)}</span>}
          </div>
          <button type="button" className="btn btn-primary btn-sm" disabled={!target || !!coveredBy} onClick={add}>
            Add location
          </button>
        </div>

        <div className={styles.chipList} aria-live="polite">
          {picks.length === 0 && <span className="field-hint">No locations added yet.</span>}
          {picks.map((pick) => (
            <span key={pick.id} className={`chip chip-teal ${styles.pickChip}`}>
              {describe(pick)}
              <button type="button" aria-label={`Remove ${pick.name}`} onClick={() => remove(pick.id)}>
                ×
              </button>
            </span>
          ))}
        </div>

        <span className="field-hint">
          Sent as <code>location_ids</code>: [{ids.join(", ")}]
        </span>
        <input type="hidden" name="location_ids" value={JSON.stringify(ids)} />
      </div>
    </fieldset>
  );
}
