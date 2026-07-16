export function SignalChip({ children }) {
  return (
    <span className="signal-chip">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M8.5 15.5a5 5 0 0 1 7 0" strokeLinecap="round" />
        <path d="M5.5 12.5a9 9 0 0 1 13 0" strokeLinecap="round" />
        <circle cx="12" cy="19" r="1.2" fill="currentColor" stroke="none" />
      </svg>
      {children}
    </span>
  );
}
