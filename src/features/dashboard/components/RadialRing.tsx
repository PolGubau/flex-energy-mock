interface RadialRingProps {
  percent: number;
  isLow: boolean;
}

export function RadialRing({ percent, isLow }: RadialRingProps) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, percent)) / 100) * circ;
  const stroke = percent > 30 ? "#22c55e" : isLow ? "#ef4444" : "#f59e0b";

  return (
    <svg width={56} height={56} viewBox="0 0 56 56" aria-hidden="true">
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke="currentColor"
        strokeWidth="4"
        className="text-muted/40"
      />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={stroke}
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`}
        transform="rotate(-90 28 28)"
        style={{
          transition: "stroke-dasharray 1.2s cubic-bezier(0.34,1.56,0.64,1)",
        }}
      />
      <text
        x="28"
        y="33"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill={stroke}
      >
        {Math.round(percent)}%
      </text>
    </svg>
  );
}
