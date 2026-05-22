'use client'

import VehicleSelector from '@/components/VehicleSelector'

export const VEHICLE_COLORS = [
  { border: 'border-blue-500',   bg: 'bg-blue-50',   label: 'text-blue-700',   badge: 'bg-blue-500',   hex: '#3B82F6' },
  { border: 'border-orange-500', bg: 'bg-orange-50', label: 'text-orange-700', badge: 'bg-orange-500', hex: '#F97316' },
  { border: 'border-purple-500', bg: 'bg-purple-50', label: 'text-purple-700', badge: 'bg-purple-500', hex: '#8B5CF6' },
]

const TERM_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

function PriceSection({ comparisonType, vehicle, onChange }) {
  if (comparisonType === 'cash') {
    return (
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Purchase Price ($)
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
          <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">$</span>
          <input
            type="number"
            min="0"
            value={vehicle.price}
            onChange={(e) => onChange({ price: e.target.value })}
            placeholder="45000"
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>
    )
  }

  const label = comparisonType === 'monthly' ? 'Monthly Payment ($)' : 'Bi-weekly Payment ($)'
  const placeholder = comparisonType === 'monthly' ? '650' : '300'

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {/* Payment amount */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
          <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">$</span>
          <input
            type="number"
            min="0"
            value={vehicle.paymentAmount}
            onChange={(e) => onChange({ paymentAmount: e.target.value })}
            placeholder={placeholder}
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
        </div>
      </div>

      {/* Term */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Loan Term</label>
        <select
          value={vehicle.termYears}
          onChange={(e) => onChange({ termYears: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white
            outline-none focus:ring-2 focus:ring-green-500"
        >
          {TERM_OPTIONS.map((y) => (
            <option key={y} value={y}>{y} {y === 1 ? 'year' : 'years'}</option>
          ))}
        </select>
      </div>

      {/* Interest rate (optional) */}
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Interest Rate{' '}
          <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500">
          <input
            type="number"
            min="0"
            max="30"
            step="0.01"
            value={vehicle.interestRate}
            onChange={(e) => onChange({ interestRate: e.target.value })}
            placeholder="6.99"
            className="flex-1 px-3 py-2 text-sm outline-none"
          />
          <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-300">% / yr</span>
        </div>
      </div>
    </div>
  )
}

function vehicleIsComplete(vehicle, comparisonType) {
  if (!vehicle.id) return false
  if (comparisonType === 'cash') return !!vehicle.price && parseFloat(vehicle.price) > 0
  return !!vehicle.paymentAmount && parseFloat(vehicle.paymentAmount) > 0
}

export default function Step4Vehicles({ data, onUpdate, onNext, onBack }) {
  const { comparisonType, vehicles, activeVehicleCount, market } = data

  function updateVehicle(slotId, changes) {
    const updated = vehicles.map((v) =>
      v.slotId === slotId ? { ...v, ...changes } : v
    )
    onUpdate({ vehicles: updated })
  }

  function handleVehicleSelect(slotId, dbVehicle) {
    if (!dbVehicle) {
      updateVehicle(slotId, {
        id: null, year: null, make: null, model: null, trim: null,
        fuel_type: null, city_mpg: null, highway_mpg: null,
        city_l100km: null, highway_l100km: null,
        city_kwh_per_100mi: null, highway_kwh_per_100mi: null,
        city_kwh_per_100km: null, highway_kwh_per_100km: null,
        electric_range_km: null, drivetrain: null,
      })
    } else {
      updateVehicle(slotId, dbVehicle)
    }
  }

  const activeVehicles = vehicles.slice(0, activeVehicleCount)
  const completedCount = activeVehicles.filter((v) =>
    vehicleIsComplete(v, comparisonType)
  ).length

  return (
    <div className="space-y-5">
      {activeVehicles.map((vehicle, i) => {
        const color = VEHICLE_COLORS[i]
        return (
          <div
            key={vehicle.slotId}
            className={`bg-white rounded-2xl shadow-sm border-l-4 border border-gray-200 ${color.border} p-6`}
          >
            {/* Card header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${color.badge}`} />
                <h3 className={`font-semibold ${color.label}`}>
                  Vehicle {i + 1}
                </h3>
                {vehicle.id && (
                  <span className="text-xs text-gray-500 flex items-center gap-1.5 flex-wrap">
                    <span>— {vehicle.year} {vehicle.make} {vehicle.model} · {vehicle.trim}</span>
                    {vehicle.drivetrain && (
                      <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs font-medium">
                        {vehicle.drivetrain}
                      </span>
                    )}
                  </span>
                )}
              </div>
              {i > 0 && (
                <button
                  onClick={() => {
                    // Remove this slot: reset it and decrement count
                    updateVehicle(vehicle.slotId, {
                      id: null, year: null, make: null, model: null, trim: null,
                      fuel_type: null, city_mpg: null, highway_mpg: null,
                      city_l100km: null, highway_l100km: null,
                      city_kwh_per_100mi: null, highway_kwh_per_100mi: null,
                      city_kwh_per_100km: null, highway_kwh_per_100km: null,
                      electric_range_km: null, drivetrain: null,
                      price: '', paymentAmount: '', termYears: '5', interestRate: '',
                    })
                    onUpdate({ activeVehicleCount: activeVehicleCount - 1 })
                  }}
                  className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                >
                  × Remove
                </button>
              )}
            </div>

            {/* Vehicle selector */}
            <VehicleSelector
              onVehicleSelect={(v) => handleVehicleSelect(vehicle.slotId, v)}
              currentVehicle={vehicle}
              market={market}
            />

            {/* PHEV note */}
            {vehicle.fuel_type === 'phev' && (
              <div className="mt-3 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-800">
                🔌 <strong>Plug-in Hybrid:</strong> Fuel cost is modelled using your commute distance
                and charging frequency from Step 3.
                {vehicle.electric_range_km
                  ? <span> Electric range: <strong>{vehicle.electric_range_km} km</strong>.</span>
                  : null}
              </div>
            )}

            {/* Price / payment section */}
            {vehicle.id && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <PriceSection
                  comparisonType={comparisonType}
                  vehicle={vehicle}
                  onChange={(changes) => updateVehicle(vehicle.slotId, changes)}
                />
              </div>
            )}
          </div>
        )
      })}

      {/* Add vehicle button */}
      {activeVehicleCount < 3 && (
        <button
          onClick={() => onUpdate({ activeVehicleCount: activeVehicleCount + 1 })}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-gray-300 text-gray-500 text-sm
            hover:border-green-400 hover:text-green-600 transition-colors"
        >
          + Add Vehicle {activeVehicleCount + 1}
        </button>
      )}

      <div className="flex justify-between pt-2">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={completedCount < 1}
          className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium
            hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          View Results →
        </button>
      </div>
    </div>
  )
}
