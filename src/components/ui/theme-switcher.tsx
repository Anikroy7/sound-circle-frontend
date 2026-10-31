"use client";

import { useSyncExternalStore } from "react";
import { MonitorIcon, MoonIcon, SunIcon } from "@/components/ui/icons";
import { readTheme, setTheme, subscribeTheme, type Theme } from "@/lib/theme";

const options: { value: Theme; label: string; Icon: (props: { size?: number }) => React.JSX.Element }[] = [
  { value: "system", label: "System theme", Icon: MonitorIcon },
  { value: "light", label: "Light theme", Icon: SunIcon },
  { value: "dark", label: "Dark theme", Icon: MoonIcon },
];

/** The server always renders "system"; the real choice is picked up right after hydration. */
const serverTheme = (): Theme => "system";

export function ThemeSwitcher(): React.JSX.Element {
  const theme = useSyncExternalStore(subscribeTheme, readTheme, serverTheme);

  return (
    <div className="theme-switcher" role="radiogroup" aria-label="Colour theme">
      {options.map(({ value, label, Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          aria-label={label}
          title={label}
          onClick={() => setTheme(value)}
        >
          <Icon />
        </button>
      ))}
    </div>
  );
}
