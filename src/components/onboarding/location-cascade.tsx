"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import styles from "@/components/onboarding/onboarding.module.css";
import { AlertCircleIcon } from "@/components/ui/icons";
import { apiErrorMessage, getLocations } from "@/lib/api";
import type { LocationNode, LocationType } from "@/types/location";

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
export const describeNode = (node: LocationNode): string => (node.type === CITY_CORPORATION ? node.name : `${node.name} ${TYPE_NAMES[node.type][0]}`);

/** "Savar, Dhaka": narrowest first, a repeated name ("Dhaka" district in "Dhaka" division) once — the same as the API's labels. */
export const pathLabel = (path: LocationNode[]): string => [...new Set([...path].reverse().map((node) => node.name))].join(", ");

const optionLabel = (node: LocationNode): string => (node.name_bn ? `${node.name} — ${node.name_bn}` : node.name);

export interface LocationCascade {
  /** The current choice in each dropdown, division first. */
  path: LocationNode[];
  /** The deepest choice — what "Add" or "select" would take. */
  target: LocationNode | undefined;
  choose: (step: number, id: string) => void;
  setPath: (path: LocationNode[]) => void;
  /** "Includes 2 city corporations and 5 upazilas, and everything inside them." / "A single place." */
  describeContents: (node: LocationNode) => string;
  /** "Nearby: Dhamrai 15.7 km, Singair 16.8 km" — from PostGIS, via `GET /locations?near_location_id=`. */
  describeNearby: (node: LocationNode) => string;
  /** Rendered by `CascadeSelects`. */
  selects: { optionsFor: (step: number) => LocationNode[] | undefined; placeholder: (step: number) => string; loadError: string | null; retry: () => void };
}

/**
 * The state behind the four dropdowns: lists load live from `GET /locations` as each step is chosen.
 * `onPathChange` hears every choice the user makes in a dropdown.
 */
export function useLocationCascade(onPathChange?: (path: LocationNode[]) => void): LocationCascade {
  /** Loaded lists: `"divisions"`, or a parent id → its children. */
  const [lists, setLists] = useState<Record<string, LocationNode[]>>({});
  const [loadError, setLoadError] = useState<string | null>(null);
  const [path, setPath] = useState<LocationNode[]>([]);
  const requested = useRef(new Set<string>());

  const load = useCallback((key: string, query: Record<string, number>): void => {
    if (requested.current.has(key)) return;
    requested.current.add(key);
    getLocations(query).then(
      (rows) => {
        setLists((current) => ({ ...current, [key]: rows }));
        setLoadError(null);
      },
      (failure: unknown) => {
        requested.current.delete(key);
        setLoadError(`We couldn't load the locations. ${apiErrorMessage(failure)}`);
      },
    );
  }, []);

  useEffect(() => load(DIVISIONS, { level: 1 }), [load]);

  const optionsFor = (step: number): LocationNode[] | undefined =>
    step === 0 ? lists[DIVISIONS] : path[step - 1] ? lists[String(path[step - 1].id)] : undefined;

  /** Changing a step clears every step below it. */
  const choose = (step: number, id: string): void => {
    const node = optionsFor(step)?.find((option) => String(option.id) === id);
    const next = path.slice(0, step);
    if (node) {
      next.push(node);
      if (node.child_count > 0) load(String(node.id), { parent_id: node.id });
      if (node.latitude !== null) load(nearbyKey(node.id), { near_location_id: node.id, radius_km: NEARBY_RADIUS_KM, level: node.level });
    }
    setPath(next);
    onPathChange?.(next);
  };

  const describeContents = (node: LocationNode): string => {
    if (node.child_count === 0) return "A single place.";
    const children = lists[String(node.id)];
    if (!children) return `Includes ${node.child_count} places, and everything inside them.`;

    const counts = new Map<LocationType, number>();
    children.forEach((child) => counts.set(child.type, (counts.get(child.type) ?? 0) + 1));
    const parts = [...counts].map(([type, count]) => `${count} ${TYPE_NAMES[type][count === 1 ? 0 : 1]}`);
    const list = parts.length > 1 ? `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}` : parts[0];
    return `Includes ${list}, and everything inside them.`;
  };

  const describeNearby = (node: LocationNode): string => {
    if (node.latitude === null) return "No centre point for this place yet, so no nearby search.";
    const nearby = lists[nearbyKey(node.id)];
    if (!nearby) return "Finding nearby places…";
    const others = nearby.filter((place) => place.id !== node.id).slice(0, 4);
    return others.length
      ? `Nearby: ${others.map((place) => `${place.name} ${place.distance_km} km`).join(", ")}`
      : `Nothing else at this level within ${NEARBY_RADIUS_KM} km.`;
  };

  const placeholder = (step: number): string => {
    const parent = path[step - 1];
    if (step === 0) return lists[DIVISIONS] ? "Select division" : "Loading divisions…";
    if (!parent) return STEPS[step].waiting;
    if (parent.child_count === 0) return parent.type === CITY_CORPORATION ? "No thanas listed yet" : "No areas listed yet";
    if (!optionsFor(step)) return "Loading…";
    return `All of ${parent.name}`;
  };

  const retry = (): void => {
    setLoadError(null);
    load(DIVISIONS, { level: 1 });
    path.forEach((node) => node.child_count > 0 && load(String(node.id), { parent_id: node.id }));
  };

  return {
    path,
    target: path[path.length - 1],
    choose,
    setPath,
    describeContents,
    describeNearby,
    selects: { optionsFor, placeholder, loadError, retry },
  };
}

/** Grouped ("City Corporation", then "Upazila") where a step has groups and the list mixes them. */
function renderOptions(step: number, options: LocationNode[]): React.ReactNode {
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
}

/** The four numbered dropdowns (1 Division → 2 District → 3 City Corporation / Upazila → 4 Thana / Area), and any load error. */
export function CascadeSelects({ cascade, disabled = false }: { cascade: LocationCascade; disabled?: boolean }): React.JSX.Element {
  const { optionsFor, placeholder, loadError, retry } = cascade.selects;
  return (
    <>
      {loadError && (
        <span className="field-error" role="alert">
          <AlertCircleIcon />
          {loadError}{" "}
          <button type="button" className={styles.textButton} onClick={retry}>
            Try again
          </button>
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
                value={cascade.path[index] ? String(cascade.path[index].id) : ""}
                disabled={!options?.length || disabled}
                onChange={(event) => cascade.choose(index, event.target.value)}
              >
                <option value="">{placeholder(index)}</option>
                {options && renderOptions(index, options)}
              </select>
              <span className="field-hint">{step.hint}</span>
            </label>
          );
        })}
      </div>
    </>
  );
}
