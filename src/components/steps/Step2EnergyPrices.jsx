'use client'

function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {hint && <p className="text-xs text-gray-400 mb-1.5">{hint}</p>}
      {children}
    </div>
  )
}

function Input({ prefix, suffix, ...props }) {
  return (
    <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
      {prefix && (
        <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-r border-gray-300">
          {prefix}
        </span>
      )}
      <input
        type="number"
        min="0"
        step="0.001"
        className="flex-1 px-3 py-2 text-sm outline-none bg-white"
        {...props}
      />
      {suffix && (
        <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-300">
          {suffix}
        </span>
      )}
    </div>
  )
}

export default function Step2EnergyPrices({ data, onUpdate, onNext, onBack }) {
  const imperial = data.unitSystem === 'imperial'

  const canContinue =
    data.fuelPrice !== '' && parseFloat(data.fuelPrice) > 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Energy Prices & Units</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter the current prices you pay for fuel and electricity.
      </p>

      {/* Unit system toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Unit System</label>
        <div className="inline-flex rounded-lg border border-gray-300 overflow-hidden">
          {[
            { value: 'metric', label: '🇨🇦 Metric (L, km)' },
            { value: 'imperial', label: '🇺🇸 Imperial (gal, mi)' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => onUpdate({ unitSystem: opt.value })}
              className={`px-4 py-2 text-sm font-medium transition-colors cursor-pointer
                ${data.unitSystem === opt.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'}
              `}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Field
          label={imperial ? 'Fuel Price (per US gallon)' : 'Fuel Price (per litre)'}
          hint={imperial ? 'e.g. 3.50 for $3.50/gallon' : 'e.g. 1.65 for $1.65/L'}
        >
          <Input
            prefix="$"
            suffix={imperial ? '/ gal' : '/ L'}
            value={data.fuelPrice}
            onChange={(e) => onUpdate({ fuelPrice: e.target.value })}
            placeholder="0.00"
          />
        </Field>

        <Field
          label="Electricity Price (per kWh)"
          hint="Needed for EVs and PHEVs. Enter 0 if not applicable."
        >
          <Input
            prefix="$"
            suffix="/ kWh"
            value={data.electricityPrice}
            onChange={(e) => onUpdate({ electricityPrice: e.target.value })}
            placeholder="0.00"
          />
        </Field>
      </div>

      {/* Tips */}
      <div className="mt-5 bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
        <strong>Tip:</strong>{' '}
        {imperial
          ? 'US average gas price is around $3.20–$3.80/gallon. Average electricity is ~$0.13/kWh.'
          : 'Canadian average gas price is around $1.50–$1.80/L. Average electricity is ~$0.12–$0.17/kWh.'}
      </div>

      <div className="mt-8 flex justify-between">
        <button
          onClick={onBack}
          className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!canContinue}
          className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium
            hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
