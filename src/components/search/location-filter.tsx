"use client";

import { useEffect, useState } from "react";
import { ChipSelect } from "@/components/search/search-parts";
import { getLocations } from "@/lib/api";
import type { LocationNode } from "@/types/location";

interface LocationFilterProps {
  divisionId: string;
  districtId: string;
  onChange: (divisionId: string, districtId: string) => void;
}

const asOptions = (rows: LocationNode[]): { value: number; label: string }[] => rows.map((row) => ({ value: row.id, label: row.name }));

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
      <ChipSelect label="Division" any="Anywhere" value={divisionId} onChange={(value) => onChange(value, "")} options={asOptions(divisions)} />
      {divisionId && (
        <ChipSelect
          label="District"
          any="Any district"
          value={districtId}
          onChange={(value) => onChange(divisionId, value)}
          options={asOptions(districtRows)}
        />
      )}
    </>
  );
}
