/** Line icons for the app shell, drawn on a 24-unit grid like `components/ui/icons.tsx`. */

interface IconProps {
  size?: number;
  filled?: boolean;
}

const Svg = ({ size = 22, children, filled = false }: IconProps & { children: React.ReactNode }): React.JSX.Element => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {children}
  </svg>
);

export const HomeIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />
  </Svg>
);

export const SearchIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </Svg>
);

/** A record: bands. */
export const RecordIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="2.5" />
  </Svg>
);

export const LibraryIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="M4 4v16M9 4v16M14 4l5 16" />
  </Svg>
);

export const PlusIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

export const ChevronLeftIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="m15 18-6-6 6-6" />
  </Svg>
);

export const ChevronRightIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="m9 18 6-6-6-6" />
  </Svg>
);

export const ArrowUpRightIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Svg>
);

export const BellIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </Svg>
);

/** The sidebar's collapse / expand toggle. */
export const PanelIcon = (props: IconProps): React.JSX.Element => (
  <Svg {...props}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M9 4v16" />
  </Svg>
);
