'use client'

import { useMemo } from 'react'
import CostChart from '@/components/CostChart'
import { buildChartData, getVehicleSummary, fmt } from '@/lib/calculations'
import { VEHICLE_COLORS } from './Step4Vehicles'

// ── Fuel economy helpers ──────────────────────────────────────────────────────

function fmtL(val) {
  const n = parseFloat(val)
  return isNaN(n) ? null : n.toFixed(1)
}

function fmtKwh(val) {
  const n = parseFloat(val)
  return isNaN(n) ? null : n.toFixed(1)
}

function fmtMpg(val) {
  const n = parseFloat(val)
  return isNaN(n) ? null : Math.round(n)
}

// Returns { label, city, hwy, unit } or null if no data
function getFuelEconomy(vehicle, unitSystem) {
  const imperial = unitSystem === 'imperial'
  const ft = vehicle.fuel_type

  if (ft === 'electric') {
    if (imperial) {
      const c = fmtKwh(vehicle.city_kwh_per_100mi)
      const h = fmtKwh(vehicle.highway_kwh_per_100mi)
      if (!c && !h) return null
      return { label: 'Efficiency', city: c, hwy: h, unit: 'kWh/100mi' }
    }
    const c = fmtKwh(vehicle.city_kwh_per_100km)
    const h = fmtKwh(vehicle.highway_kwh_per_100km)
    if (!c && !h) return null
    return { label: 'Efficiency', city: c, hwy: h, unit: 'kWh/100km' }
  }

  // gasoline | hybrid | phev | diesel
  const label = ft === 'phev' ? 'Gas-mode economy' : 'Fuel economy'
  if (imperial) {
    const c = fmtMpg(vehicle.city_mpg)
    const h = fmtMpg(vehicle.highway_mpg)
    if (!c && !h) return null
    return { label, city: c, hwy: h, unit: 'mpg' }
  }
  const c = fmtL(vehicle.city_l100km)
  const h = fmtL(vehicle.highway_l100km)
  if (!c && !h) return null
  return { label, city: c, hwy: h, unit: 'L/100km' }
}

// Returns display string for EV / PHEV range, or null
function getEVRange(vehicle, unitSystem) {
  const rangeKm = parseFloat(vehicle.electric_range_km)
  if (!rangeKm || isNaN(rangeKm)) return null
  const imperial = unitSystem === 'imperial'
  if (imperial) {
    const mi = Math.round(rangeKm * 0.621371)
    return { label: vehicle.fuel_type === 'phev' ? 'EV-only range' : 'Range', value: `${mi} mi` }
  }
  return {
    label: vehicle.fuel_type === 'phev' ? 'EV-only range' : 'Range',
    value: `${Math.round(rangeKm)} km`,
  }
}

export default function Step5Results({ data, onBack, onReset }) {
  const {
    vehicles,
    activeVehicleCount,
    comparisonType,
    paymentFrequency,
    leaseTerm,
    unitSystem,
  } = data

  const activeVehicles = vehicles
    .slice(0, activeVehicleCount)
    .filter((v) => v.id)

  const chartData = useMemo(() => buildChartData(activeVehicles, data), [data])

  const summaries = useMemo(
    () => activeVehicles.map((v) => getVehicleSummary(v, data)),
    [data]
  )

  // Find the vehicle with the lowest total cost over the comparison period
  const bestIdx = summaries.reduce(
    (best, s, i) => (s.periodTotal < summaries[best].periodTotal ? i : best),
    0
  )

  // ── Period-aware display helpers ──────────────────────────────────────────
  const isLease   = comparisonType === 'lease'
  const isFinance = comparisonType === 'finance'
  const isCash    = comparisonType === 'cash'
  const freqLabel = paymentFrequency === 'biweekly' ? 'Bi-weekly' : 'Monthly'

  const chartTitle = isLease
    ? `${leaseTerm}-Month Cost of Lease`
    : '10-Year Cost of Ownership'

  const chartDesc = isLease
    ? `Cumulative spending including lease payments and fuel/energy over your ${leaseTerm}-month term.`
    : 'Cumulative spending including vehicle cost and fuel/energy. Lines flatten after loans are paid off.'

  const badgeLabel = isLease
    ? `${leaseTerm}-Month Lease · ${freqLabel}`
    : isFinance
    ? `Finance · ${freqLabel}`
    : 'Cash Purchase'

  const periodFuelLabel = isLease
    ? `${leaseTerm}-mo fuel cost`
    : '10-yr fuel cost'

  const periodTotalLabel = isLease ? 'Lease Total' : '10-yr Total'

  const vehicleCostLabel = isCash
    ? 'Purchase price'
    : isLease
    ? 'Total lease payments'
    : 'Total loan payments'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-1">
          <h2 className="text-xl font-bold text-gray-900">
            {chartTitle}
          </h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            {badgeLabel} · {unitSystem === 'imperial' ? 'Imperial' : 'Metric'}
          </span>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          {chartDesc}
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
          const s       = summaries[i]
          const color   = VEHICLE_COLORS[i]
          const isBest  = i === bestIdx && activeVehicles.length > 1
          const fuelEcon = getFuelEconomy(vehicle, unitSystem)
          const evRange  = getEVRange(vehicle, unitSystem)

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
                  <p className="text-xs text-gray-400 flex items-center gap-1.5 flex-wrap">
                    <span>{vehicle.trim}</span>
                    {vehicle.drivetrain && (
                      <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium">
                        {vehicle.drivetrain}
                      </span>
                    )}
                  </p>
                </div>
                {isBest && (
                  <span className="flex-shrink-0 text-xs font-semibold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                    Best Value
                  </span>
                )}
              </div>

              {/* Vehicle specs */}
              {(fuelEcon || evRange) && (
                <div className="mb-3 pb-3 border-b border-gray-100 space-y-1.5">
                  {fuelEcon && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{fuelEcon.label}</span>
                      <span className="font-medium text-gray-700">
                        {fuelEcon.city && fuelEcon.hwy
                          ? `${fuelEcon.city} city · ${fuelEcon.hwy} hwy`
                          : fuelEcon.city || fuelEcon.hwy}{' '}
                        <span className="text-gray-400">{fuelEcon.unit}</span>
                      </span>
                    </div>
                  )}
                  {evRange && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">{evRange.label}</span>
                      <span className="font-medium text-green-700">{evRange.value}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Stats */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Annual energy cost</span>
                  <span className="font-medium text-gray-900">{fmt(s.annualFuel)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{vehicleCostLabel}</span>
                  <span className="font-medium text-gray-900">{fmt(s.totalVehicleCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">{periodFuelLabel}</span>
                  <span className="font-medium text-gray-900">{fmt(s.periodFuel)}</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-2">
                  <span className="font-semibold text-gray-800">{periodTotalLabel}</span>
                  <span className={`font-bold text-lg ${color.label}`}>
                    {fmt(s.periodTotal)}
                  </span>
                </div>

                {/* Finance: show interest rate + term */}
                {isFinance && vehicle.interestRate && (
                  <p className="text-xs text-gray-400 pt-1">
                    {vehicle.interestRate}% annual rate · {vehicle.termYears}-yr term
                  </p>
                )}

                {/* Lease: confirm the term */}
                {isLease && (
                  <p className="text-xs text-gray-400 pt-1">
                    {leaseTerm}-month term · rate built into quoted payment
                  </p>
                )}

                {/* Fuel type badge */}
                <div className="pt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                      ${vehicle.fuel_type === 'electric' ? 'bg-green-100 text-green-700' : ''}
                      ${vehicle.fuel_type === 'phev'     ? 'bg-blue-100 text-blue-700'   : ''}
                      ${vehicle.fuel_type === 'hybrid'   ? 'bg-teal-100 text-teal-700'   : ''}
                      ${vehicle.fuel_type === 'gasoline' ? 'bg-orange-100 text-orange-700' : ''}
                      ${vehicle.fuel_type === 'diesel'   ? 'bg-yellow-100 text-yellow-700' : ''}
                    `}
                  >
                    {vehicle.fuel_type === 'electric' && '⚡ Electric'}
                    {vehicle.fuel_type === 'phev'     && '🔌 Plug-in Hybrid'}
                    {vehicle.fuel_type === 'hybrid'   && '♻️ Hybrid'}
                    {vehicle.fuel_type === 'gasoline' && '⛽ Gasoline'}
                    {vehicle.fuel_type === 'diesel'   && '🛢️ Diesel'}
                  </span>
                </div>

                {/* PHEV EV/gas split bar */}
                {vehicle.fuel_type === 'phev' && s.evFraction != null && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="text-xs font-medium text-gray-600 mb-1.5">
                      Estimated driving mode split
                    </div>
                    {s.evFraction > 0 ? (
                      <>
                        <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
                          <div
                            className="bg-green-400 h-2 transition-all"
                            style={{ width: `${Math.round(s.evFraction * 100)}%` }}
                          />
                          <div className="bg-orange-300 h-2 flex-1" />
                        </div>
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                          <span className="text-green-700 font-medium">
                            ⚡ {Math.round(s.evFraction * 100)}% electric
                          </span>
                          <span className="text-orange-600 font-medium">
                            {Math.round((1 - s.evFraction) * 100)}% gas ⛽
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                          <span>{fmt(s.evCost)}/yr electricity</span>
                          <span>{fmt(s.gasCost)}/yr fuel</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-gray-400">
                        Running on gasoline — charge more often or enter a commute in Step 3 to model EV savings.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-xs text-gray-500">
        <strong>Assumptions:</strong>{' '}
        {isLease
          ? `Fuel/energy prices held constant over the ${leaseTerm}-month lease term. Lease total reflects payments only — no ownership value at term end.`
          : 'Fuel/energy prices held constant over 10 years.'
        }{' '}
        Fuel economy figures are posted estimates — real-world results vary.
        For plug-in hybrids, EV usage is based on your commute vs. the vehicle's battery range:
        commutes within range use electricity only; longer commutes add a proportional gas cost.
        Non-commute driving is modelled on gasoline.
        Maintenance, insurance, and depreciation are not included.
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
