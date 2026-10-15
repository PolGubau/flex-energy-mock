import { Area, AreaChart, ResponsiveContainer } from "recharts";

const PRIMARY = "oklch(0.53 0.195 258)";

interface MiniSparklineProps {
  data: { value: number }[];
}

export function MiniSparkline({ data }: MiniSparklineProps) {
  if (data.length < 2) return null;

  return (
    <div className="w-24 h-10" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={PRIMARY} stopOpacity={0.3} />
              <stop offset="100%" stopColor={PRIMARY} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={PRIMARY}
            strokeWidth={2}
            fill="url(#sparkGrad)"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
