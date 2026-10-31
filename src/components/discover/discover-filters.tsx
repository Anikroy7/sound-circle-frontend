import styles from "@/components/discover/discover.module.css";
import type { DiscoverFilters } from "@/types/musician";

function CheckGroup({ legend, name, type, options }: {
  legend: string;
  name: string;
  type: "checkbox" | "radio";
  options: { label: string; checked: boolean }[];
}): React.JSX.Element {
  return (
    <fieldset className="fieldset">
      <legend className="label">{legend}</legend>
      {options.map((option) => (
        <label key={option.label} className="check">
          <input type={type} name={name} value={option.label} defaultChecked={option.checked} />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}

/** The filter sidebar. A GET form, so applying filters lands back on Discover as query parameters. */
export function DiscoverFilterPanel({ filters }: { filters: DiscoverFilters }): React.JSX.Element {
  return (
    <form className={`card ${styles.filters}`} aria-label="Filters" method="get">
      <div className={styles.filtersHead}>
        <h2 className={`display ${styles.filtersTitle}`}>Filters</h2>
        <span className="muted">{filters.active.length} active</span>
      </div>
      <CheckGroup legend="Instrument" name="instrument" type="checkbox" options={filters.instruments} />
      <div className={styles.filterGroup}>
        <span className="label">Genre</span>
        <div className={styles.chipList}>
          {filters.genres.map((genre) => (
            <button key={genre.label} type="button" className="toggle-chip toggle-chip-sm" aria-pressed={genre.selected}>
              {genre.label}
            </button>
          ))}
        </div>
      </div>
      <label className="field">
        <span className="label">City / area</span>
        <select className="input" name="area" defaultValue={filters.areas[0].value}>
          {filters.areas.map((area) => (
            <option key={area.value} value={area.value}>
              {area.label}
            </option>
          ))}
        </select>
      </label>
      <CheckGroup legend="Experience level" name="experience" type="radio" options={filters.experience} />
      <CheckGroup legend="Availability" name="availability" type="checkbox" options={filters.availability} />
      <CheckGroup legend="Open to" name="openTo" type="checkbox" options={filters.openTo} />
      <button type="submit" className="btn btn-primary btn-block">
        Show {filters.resultCount} musicians
      </button>
    </form>
  );
}
