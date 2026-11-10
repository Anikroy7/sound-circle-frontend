"use client";

import { useEffect, useState } from "react";
import styles from "@/components/search/search.module.css";
import { getLocations } from "@/lib/api";
import type { LocationNode } from "@/types/location";

interface LocationFilterProps {
  divisionId: string;
  districtId: string;
  onChange: (divisionId: string, districtId: string) => void;
}

/** Division, then (once one is chosen) district. The search matches the narrower of the two. */
export function LocationFilter({ divisionId, districtId, onChange }: LocationFilterProps): React.JSX.Element {
  const [divisions, setDivisions] = useState<LocationNode[]>([]);
  const [districts, setDistricts] = useState<{ parent: string; rows: LocationNode[] }>({ parent: "", rows: [] });

  useEffect(() => {
    getLocations({ level: 1 }).then(setDivisions, () => setDivisions([]));
  }, []);

  useEffect(() => {
    if (!divisionId) return;
    let live = true;
    getLocations({ parent_id: Number(divisionId) }).then(
      (rows) => live && setDistricts({ parent: divisionId, rows }),
      () => live && setDistricts({ parent: divisionId, rows: [] }),
    );
    return () => {
      live = false;
    };
  }, [divisionId]);

  const districtRows = districts.parent === divisionId ? districts.rows : [];

  return (
    <>
      <select className={`input ${styles.select}`} aria-label="Division" value={divisionId} onChange={(event) => onChange(event.target.value, "")}>
        <option value="">Any division</option>
        {divisions.map((division) => (
          <option key={division.id} value={division.id}>
            {division.name}
          </option>
        ))}
      </select>
      {divisionId && (
        <select className={`input ${styles.select}`} aria-label="District" value={districtId} onChange={(event) => onChange(divisionId, event.target.value)}>
          <option value="">Any district</option>
          {districtRows.map((district) => (
            <option key={district.id} value={district.id}>
              {district.name}
            </option>
          ))}
        </select>
      )}
    </>
  );
}
