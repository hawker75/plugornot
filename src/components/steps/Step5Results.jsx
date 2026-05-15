'use client'

import { useMemo } from 'react'
import CostChart from '@/components/CostChart'
import { buildChartData, getVehicleSummary, fmt } from '@/lib/calculations'
import { VEHICLE_COLORS } from './Step4Vehicles'

const COMPARISON_LABELS = {
  cash: 'Cash Purchase',
  monthly: 'Monthly Payments',
  biweekly: 'Bi-weekly Payments',
}

export default function Step5Results({ data, onBack, onReset }) {
  const { vehicles, activeVehicleCount, comparisonType, unitSystem } = data
  const activeVehicles = vehicles
    .slice(0, activeVehicleCount)
    .filter((v) => v.id)

  const chartData = useMemo(() => buildChartData(activeVehicles, data), [data])

  const summaries = useMemo(
    () => activeVehicles.map((v) => getVehicleSummary(v, data)),
    [data]
  )

  // Find the vehicle with lowest 10-year total
  const bestIdx = summaries.reduce(
    (best, s, i) => (s.tenYearTotal < summaries[best].tenYearTotal ? i : best),
    0
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <h2 className="text-xl font-bold text-gray-900">
            10-Year Cost of Ownership
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {COMPARISON_LABELS[comparisonType]} ·{' '}
            {unitSystem === 'imperial' ? 'Imperial' : 'Metric'}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Cumulative spending including vehicle cost and fuel/energy. Lines
          flatten after loans are paid off.
        </p>

        <CostChart chartData={chartData} activeVehicles={activeVehicles} />
      </div>

      {/* Summary cards */}
      <div
        className={`grid gap-4 ${
          activeVehicles.length === 1
            ? 'grid-cols-1'
            : activeVehicles.length === 2
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-3'
        }`}
      >
        {activeVehicles.map((vehicle, i) => {
          const s = summaries[i]
          const color = VEHICLE_COLORS[i]
          const isBest = i === bestIdx && activeVehicles.length > 1

          return (
            <div
              key={vehicle.id}
              className={`bg-white rounded-2xl shadow-sm border border-gray-200 border-l-4 ${color.border} p-5`}
            >
              {/* Vehicle name + best badge */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${color.badge}`} />
                    <span className={`text-xs font-semibold ${color.label}`}>
                      Vehicle {i + 1}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <p className="text-xs text-gray-400">{vehicle.trim}</p>
                </div>
                {isBest && (
                  <span className="flex-shrink-0 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
              </div>

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual energy cost</span>
                  <span className="font-medium text-gray-900">
                    {fmt(s.annualFuel)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {comparisonType === 'cash' ? 'Purchase price' : 'Total payments'}
                  </span>
                  <span className="font-medium text-gray-900">
                    {fmt(s.totalVehicleCost)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">10-yr fuel cost</span>
                  <span className="font-medium text-gray-900">
                    {fmt(s.tenYearFuel)}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="font-semibold text-gray-800">10-yr Total</span>
                  <span className={`font-bold text-lg ${color.label}`}>
                    {fmt(s.tenYearTotal)}
                  </span>
                </div>

                {/* Interest info */}
                {comparisonType !== 'cash' && vehicle.interestRate && (
                  <p className="text-xs text-gray-400 pt-1">
                    {vehicle.interestRate}% annual rate ·{' '}
                    {vehicle.termYears}-yr term
                  </p>
                )}

                {/* Fuel type badge */}
                <div className="pt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${vehicle.fuel_type === 'electric' ? 'bg-green-100 text-green-700' : ''}
                      ${vehicle.fuel_type === 'phev' ? 'bg-blue-100 text-blue-700' : ''}
                      ${vehicle.fuel_type === 'hybrid' ? 'bg-teal-100 text-teal-700' : ''}
                      ${vehicle.fuel_type === 'gasoline' ? 'bg-orange-100 text-orange-700' : ''}
                      ${vehicle.fuel_type === 'diesel' ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}
                  >
                    {vehicle.fuel_type === 'electric' && '⚡ Electric'}
                    {vehicle.fuel_type === 'phev' && '🔌 Plug-in Hybrid'}
                    {vehicle.fuel_type === 'hybrid' && '♻️ Hybrid'}
                    {vehicle.fuel_type === 'gasoline' && '⛽ Gasoline'}
                    {vehicle.fuel_type === 'diesel' && '🛢️ Diesel'}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
        <strong>Assumptions:</strong> Fuel/energy prices held constant over 10 years. Fuel economy
        figures are posted EPA estimates — real-world use varies. Maintenance, insurance, and
        depreciation are not included.
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Edit Vehicles
        </button>
        <button
          onClick={onReset}
          className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors"
        >
          Start New Comparison
        </button>
      </div>
    </div>
  )
}
