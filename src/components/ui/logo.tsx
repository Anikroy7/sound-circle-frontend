export function LogoMark({ size = 32 }: { size?: number }): React.JSX.Element {
  return (
    <svg className="logo-bars" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="14" fill="none" stroke="var(--teal)" strokeWidth="2.5" />
      <g stroke="var(--violet)" strokeWidth="2.5" strokeLinecap="round">
        <line x1="10" y1="13" x2="10" y2="19" />
        <line x1="14" y1="10" x2="14" y2="22" />
        <line x1="18" y1="12" x2="18" y2="20" />
        <line x1="22" y1="14" x2="22" y2="18" />
      </g>
    </svg>
  );
}
