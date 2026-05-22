"use client";

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface Props {
  itemsPerDay: { date: string; count: number }[];
  inventoryItemCounts: { name: string; count: number }[];
  stockStatus: { inStock: number; outOfStock: number; unset: number };
  inventoriesPerMonth: { month: string; count: number }[];
  totalItems: number;
}

const COLORS = {
  indigo: "#6366f1",
  emerald: "#10b981",
  amber: "#f59e0b",
  rose: "#f43f5e",
  sky: "#0ea5e9",
  purple: "#a855f7",
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "10px 14px",
        fontSize: 13,
        boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
      }}
    >
      {label && (
        <p style={{ color: "var(--text-muted)", marginBottom: 6, fontSize: 12 }}>
          {label}
        </p>
      )}
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color, fontWeight: 600 }}>
          {p.value} {p.name}
        </p>
      ))}
    </div>
  );
}

const PIE_DATA_COLORS = [COLORS.emerald, COLORS.rose, COLORS.amber];

export function DashboardCharts({
  itemsPerDay,
  inventoryItemCounts,
  stockStatus,
  inventoriesPerMonth,
  totalItems,
}: Props) {
  const pieData = [
    { name: "In Stock", value: stockStatus.inStock },
    { name: "Out of Stock", value: stockStatus.outOfStock },
    { name: "Unset", value: stockStatus.unset },
  ].filter((d) => d.value > 0);

  const inStockPct =
    totalItems > 0
      ? Math.round((stockStatus.inStock / totalItems) * 100)
      : 0;

  return (
    <div className="space-y-4">
      {/* Row 1: Area chart + Pie chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Items added over time — area chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm">
                Items Added
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Last 14 days
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 font-medium">
              Daily
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart
              data={itemsPerDay}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="itemsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.indigo} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={COLORS.indigo} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                name="items"
                stroke={COLORS.indigo}
                strokeWidth={2}
                fill="url(#itemsGrad)"
                dot={{ fill: COLORS.indigo, r: 3, strokeWidth: 0 }}
                activeDot={{ r: 5, fill: COLORS.indigo }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Stock status — donut */}
        <div className="card p-5">
          <div className="mb-4">
            <h3 className="font-semibold text-[var(--text)] text-sm">
              Stock Status
            </h3>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Boolean field overview
            </p>
          </div>

          {pieData.length === 0 ? (
            <div className="flex items-center justify-center h-[160px]">
              <p className="text-sm text-[var(--text-muted)]">No data yet</p>
            </div>
          ) : (
            <>
              <div className="relative">
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={PIE_DATA_COLORS[index % PIE_DATA_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center label */}
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    textAlign: "center",
                    pointerEvents: "none",
                  }}
                >
                  <div className="text-2xl font-bold text-[var(--text)]">
                    {inStockPct}%
                  </div>
                  <div className="text-xs text-[var(--text-muted)]">
                    in stock
                  </div>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div
                    key={d.name}
                    className="flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ background: PIE_DATA_COLORS[i] }}
                      />
                      <span className="text-[var(--text-muted)]">{d.name}</span>
                    </div>
                    <span className="font-medium text-[var(--text)]">
                      {d.value}
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Row 2: Bar chart + Line chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Items per inventory — bar chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm">
                Items per Inventory
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Top 6 by last updated
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
              Distribution
            </span>
          </div>

          {inventoryItemCounts.length === 0 ? (
            <div className="flex items-center justify-center h-[180px]">
              <p className="text-sm text-[var(--text-muted)]">
                No inventories yet
              </p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart
                data={inventoryItemCounts}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10.5, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar
                  dataKey="count"
                  name="items"
                  fill={COLORS.emerald}
                  radius={[6, 6, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Inventories created per month — line chart */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-[var(--text)] text-sm">
                Inventories Created
              </h3>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Last 6 months
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-sky-500/10 text-sky-400 font-medium">
              Monthly
            </span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart
              data={inventoriesPerMonth}
              margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--border)"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="count"
                name="inventories"
                stroke={COLORS.sky}
                strokeWidth={2.5}
                dot={{ fill: COLORS.sky, r: 4, strokeWidth: 0 }}
                activeDot={{ r: 6, fill: COLORS.sky }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}