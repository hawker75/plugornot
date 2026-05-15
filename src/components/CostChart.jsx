'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { VEHICLE_COLORS } from './steps/Step4Vehicles'

function formatDollar(val) {
  if (val >= 1_000_000) return `$${(val / 1_000_000).toFixed(1)}M`
  if (val >= 1_000) return `$${(val / 1_000).toFixed(0)}k`
  return `$${val}`
}

function CustomTooltip({ active, payload, label, vehicles }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 min-w-48">
      <p className="font-semibold text-gray-700 mb-2 text-sm">Year {label}</p>
      {payload.map((entry, i) => {
        const v = vehicles[i]
        const name = v ? `${v.year} ${v.make} ${v.model}` : entry.name
        return (
          <div key={entry.dataKey} className="flex items-center gap-2 text-sm">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-gray-600 truncate flex-1">{name}</span>
            <span className="font-semibold" style={{ color: entry.color }}>
              ${Math.round(entry.value).toLocaleString()}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export default function CostChart({ chartData, activeVehicles }) {
  if (!chartData.length) return null

  // Find payoff years for financed vehicles (for reference lines)
  // We just annotate the x-axis at the term year

  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `Yr ${v}`}
            tick={{ fontSize: 12, fill: '#6b7280' }}
          />
          <YAxis
            tickFormatter={formatDollar}
            tick={{ fontSize: 12, fill: '#6b7280' }}
            width={58}
          />
          <Tooltip
            content={<CustomTooltip vehicles={activeVehicles} />}
          />
          <Legend
            formatter={(value, entry) => {
              const idx = parseInt(value.replace('v', ''))
              const v = activeVehicles[idx]
              return v
                ? `${v.year} ${v.make} ${v.model} ${v.trim}`
                : value
            }}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
          {activeVehicles.map((_, idx) => (
            <Line
              key={`v${idx}`}
              type="monotone"
              dataKey={`v${idx}`}
              stroke={VEHICLE_COLORS[idx].hex}
              strokeWidth={2.5}
              dot={{ r: 3, fill: VEHICLE_COLORS[idx].hex }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
