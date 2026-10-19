import { format, parseISO } from "date-fns";
import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

/** Read a CSS custom property at runtime so chart colours always match the theme.
 *  The variables already contain full `oklch(…)` strings. */
function cssVar(name: string) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/** Reduces the chroma (saturation) of an oklch() color string by a factor. */
function desaturate(color: string, factor: number): string {
  return color.replace(
    /oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/,
    (_, l, c, h) => `oklch(${l} ${(parseFloat(c) * factor).toFixed(3)} ${h})`,
  );
}

function useChartColors() {
  const primary = cssVar("--primary"); // e.g. "oklch(0.50 0.23 285)"
  const grid = cssVar("--border");
  const tick = cssVar("--muted-foreground");
  const primaryInner = primary.replace(/^oklch\(/, "").replace(/\)$/, "");
  return {
    C_PRIMARY: primary,
    C_PRIMARY_MUTED: desaturate(primary, 0.3),
    C_GRID: grid,
    C_TICK: tick,
    C_CURSOR: `oklch(${primaryInner} / 0.08)`,
  };
}

function fmtY(v: number) {
  if (v === 0) return "0";
  if (v >= 1000) return `${(v / 1000).toFixed(0)}k`;
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

interface TooltipPayload {
  value: number;
  payload: { timestamp: string };
}
function ChartTooltip({
  active,
  payload,
  mode,
  usageUnit = "kWh",
  period,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  mode?: string;
  usageUnit?: string;
  period?: string;
}) {
  if (!active || !payload?.length) return null;
  const val = payload[0].value;
  const ts = payload[0].payload.timestamp;
  const dateLabel = (() => {
    try {
      const d = parseISO(ts);
      return period === "day" ? format(d, "HH:mm") : format(d, "d MMM");
    } catch {
      return ts;
    }
  })();
  return (
    <div className="bg-foreground text-background px-3 py-2.5 rounded-2xl shadow-xl">
      <p className="text-[10px] opacity-40 mb-0.5 font-medium">{dateLabel}</p>
      <p className="text-sm font-bold tabular-nums">
        {mode === "cost"
          ? `CHF ${val.toFixed(2)}`
          : `${val.toFixed(2)} ${usageUnit}`}
      </p>
    </div>
  );
}

interface UsageChartProps {
  data: { timestamp: string; value: number }[];
  period: string;
  chartType?: "bar" | "line";
  formatXAxis: (value: string) => string;
  mode?: "kwh" | "cost";
  usageUnit?: string;
  highlightPeak?: boolean;
}

export function UsageChart({
  data,
  period,
  chartType = "line",
  formatXAxis,
  mode = "kwh",
  usageUnit = "kWh",
  highlightPeak = true,
}: UsageChartProps) {
  const { C_PRIMARY, C_PRIMARY_MUTED, C_GRID, C_TICK, C_CURSOR } =
    useChartColors();
  const avg = data.length
    ? data.reduce((s, d) => s + d.value, 0) / data.length
    : 0;
  const peakEntry = data.length
    ? data.reduce((max, d) => (d.value > max.value ? d : max), data[0])
    : null;
  // Show all labels if few data points, otherwise limit to ~6 labels
  const tickInterval = data.length <= 6 ? 0 : Math.floor(data.length / 6) - 1;
  const common = { data, margin: { top: 8, right: 4, left: -4, bottom: 0 } };
  const xAxis = (
    <XAxis
      dataKey="timestamp"
      axisLine={false}
      tickLine={false}
      tick={{ fill: C_TICK, fontSize: 10, fontFamily: "inherit" }}
      tickFormatter={formatXAxis}
      interval={tickInterval}
    />
  );
  const yAxis = (
    <YAxis
      axisLine={false}
      tickLine={false}
      tick={{ fill: C_TICK, fontSize: 10, fontFamily: "inherit" }}
      tickFormatter={fmtY}
      tickCount={4}
      width={34}
    />
  );
  const grid = <CartesianGrid vertical={false} stroke={C_GRID} />;
  const tip = (
    <Tooltip
      cursor={{ fill: C_CURSOR, radius: 8 } as React.SVGProps<SVGRectElement>}
      content={(p) => (
        <ChartTooltip
          {...(p as unknown as {
            active?: boolean;
            payload?: TooltipPayload[];
          })}
          mode={mode}
          usageUnit={usageUnit}
          period={period}
        />
      )}
    />
  );
  const avgLine =
    avg > 0 ? (
      <ReferenceLine
        y={avg}
        stroke={C_PRIMARY}
        strokeDasharray="4 3"
        strokeWidth={1.5}
        strokeOpacity={0.6}
        label={{
          value: `⌀ ${avg.toFixed(1)}`,
          position: "insideTopLeft",
          fontSize: 9,
          fontWeight: 700,
          fill: C_PRIMARY,
          dy: -5,
          dx: 4,
        }}
      />
    ) : null;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${period}-${chartType}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="h-52 w-full"
      >
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <AreaChart {...common}>
              {grid}
              {xAxis}
              {yAxis}
              {tip}
              {/* Vertical peak marker */}
              {highlightPeak && peakEntry && (
                <ReferenceLine
                  x={peakEntry.timestamp}
                  stroke={C_PRIMARY}
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  strokeOpacity={0.45}
                />
              )}
              {avgLine}
              <Area
                type="monotone"
                dataKey="value"
                fill={C_PRIMARY}
                stroke={C_PRIMARY}
                strokeWidth={2.5}
                fillOpacity={0.25}
                dot={(props: {
                  cx?: number;
                  cy?: number;
                  payload: { timestamp: string; value: number };
                }) => {
                  const isPeak =
                    highlightPeak &&
                    peakEntry &&
                    props.payload.timestamp === peakEntry.timestamp;
                  if (isPeak) {
                    return (
                      <g key={props.payload.timestamp}>
                        {/* outer ring */}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={9}
                          fill={C_PRIMARY}
                          fillOpacity={0.15}
                        />
                        {/* inner dot */}
                        <circle
                          cx={props.cx}
                          cy={props.cy}
                          r={5}
                          fill={C_PRIMARY}
                          stroke="white"
                          strokeWidth={2}
                        />
                      </g>
                    );
                  }
                  if (!highlightPeak) {
                    return (
                      <circle
                        key={props.payload.timestamp}
                        cx={props.cx}
                        cy={props.cy}
                        r={3}
                        fill={C_PRIMARY}
                        strokeWidth={0}
                      />
                    );
                  }
                  // muted dots when highlight is on but not peak
                  return (
                    <circle
                      key={props.payload.timestamp}
                      cx={props.cx}
                      cy={props.cy}
                      r={2}
                      fill={C_PRIMARY}
                      fillOpacity={0.3}
                      strokeWidth={0}
                    />
                  );
                }}
                activeDot={{ r: 6 }}
                animationDuration={600}
              />
            </AreaChart>
          ) : (
            <BarChart {...common} barCategoryGap="20%">
              {grid}
              {xAxis}
              {yAxis}
              {tip}
              <Bar
                dataKey="value"
                radius={[6, 6, 0, 0]}
                animationDuration={700}
                animationEasing="ease-out"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.timestamp}
                    fill={
                      !highlightPeak || entry === peakEntry
                        ? C_PRIMARY
                        : C_PRIMARY_MUTED
                    }
                  />
                ))}
              </Bar>
              {avgLine}
            </BarChart>
          )}
        </ResponsiveContainer>
      </motion.div>
    </AnimatePresence>
  );
}
