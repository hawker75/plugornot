'use client'

const CHARGING_OPTIONS = [
  { value: 'daily',        label: 'Every day',      desc: 'Maximum EV savings' },
  { value: 'most_days',    label: 'Most days',      desc: 'About 75% of the time' },
  { value: 'occasionally', label: 'Occasionally',   desc: 'About 40% of the time' },
  { value: 'rarely',       label: 'Rarely / Never', desc: 'Treated like a regular hybrid' },
]

export default function Step3DrivingProfile({ data, onUpdate, onNext, onBack }) {
  const cityPct = Math.round(data.cityRatio * 100)
  const hwyPct = 100 - cityPct
  const imperial = data.unitSystem === 'imperial'
  const unit = imperial ? 'miles' : 'km'

  const canContinue =
    data.distanceAmount !== '' && parseFloat(data.distanceAmount) > 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">Your Driving Profile</h2>
      <p className="text-gray-500 text-sm mb-6">
        Tell us how you drive so we can calculate realistic fuel costs.
      </p>

      {/* City / Highway slider */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <label className="text-sm font-medium text-gray-700">
            City vs. Highway Split
          </label>
          <span className="text-sm font-semibold text-green-700">
            {cityPct}% City / {hwyPct}% Highway
          </span>
        </div>

        <input
          type="range"
          min={0}
          max={100}
          value={100 - cityPct}
          onChange={(e) =>
            onUpdate({ cityRatio: (100 - parseInt(e.target.value)) / 100 })
          }
          className="w-full"
        />

        {/* Visual labels */}
        <div className="flex justify-between mt-1 text-xs text-gray-400">
          <span>🏙️ All City</span>
          <span>⚖️ Balanced</span>
          <span>🛣️ All Highway</span>
        </div>

        {/* Info callout */}
        <div className="mt-3 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
          <strong>Why this matters:</strong> Posted EPA "combined" figures assume
          a fixed 55% city / 45% highway split. Move the slider to match your
          real-world mix for a more accurate estimate.
        </div>
      </div>

      {/* Annual distance */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          How far do you drive?
        </label>

        <div className="flex gap-2 items-stretch">
          {/* Amount */}
          <div className="flex-1 flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
            <input
              type="number"
              min="1"
              value={data.distanceAmount}
              onChange={(e) => onUpdate({ distanceAmount: e.target.value })}
              placeholder="e.g. 500"
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-300">
              {unit}
            </span>
          </div>

          {/* Period */}
          <select
            value={data.distancePeriod}
            onChange={(e) => onUpdate({ distancePeriod: e.target.value })}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-700 bg-white outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            <option value="week">per week</option>
            <option value="month">per month</option>
            <option value="year">per year</option>
          </select>
        </div>

        {/* Computed annual distance */}
        {canContinue && (
          <p className="mt-2 text-xs text-gray-500">
            ≈{' '}
            <strong>
              {Math.round(
                parseFloat(data.distanceAmount) *
                  { week: 52, month: 12, year: 1 }[data.distancePeriod]
              ).toLocaleString()}{' '}
              {unit}/year
            </strong>
          </p>
        )}
      </div>

      {/* ── PHEV / EV Charging Profile ──────────────────────────────────────── */}
      <div className="border-t border-gray-100 pt-7 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-base">🔌</span>
          <h3 className="text-sm font-semibold text-gray-800">
            Plug-in Hybrid Profile
          </h3>
          <span className="text-xs text-gray-400 font-normal">
            — used when a PHEV is in the comparison
          </span>
        </div>

        {/* Daily commute */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-1">
            <label className="text-sm font-medium text-gray-700">
              Daily commute distance{' '}
              <span className="text-gray-400 font-normal">(one way)</span>
            </label>
            <span className="text-xs text-gray-400">optional</span>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500 max-w-[200px]">
            <input
              type="number"
              min="0"
              value={data.dailyCommuteKm}
              onChange={(e) => onUpdate({ dailyCommuteKm: e.target.value })}
              placeholder={imperial ? '15' : '25'}
              className="flex-1 px-3 py-2 text-sm outline-none"
            />
            <span className="px-3 py-2 bg-gray-50 text-gray-500 text-sm border-l border-gray-300">
              {unit}
            </span>
          </div>
          {parseFloat(data.dailyCommuteKm) > 0 && (
            <p className="mt-1.5 text-xs text-gray-500">
              ≈{' '}
              <strong>
                {Math.round(parseFloat(data.dailyCommuteKm) * 2).toLocaleString()}{' '}
                {unit}
              </strong>{' '}
              round trip per day
            </p>
          )}
        </div>

        {/* Charging frequency */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How often would you charge?
          </label>
          <div className="grid grid-cols-2 gap-2">
            {CHARGING_OPTIONS.map((opt) => {
              const selected = data.chargingFrequency === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => onUpdate({ chargingFrequency: opt.value })}
                  className={`
                    rounded-lg border-2 p-3 text-left transition-all cursor-pointer
                    ${selected
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30'}
                  `}
                >
                  <div className="font-medium text-sm text-gray-900">{opt.label}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                  {selected && (
                    <div className="mt-1.5 text-xs font-medium text-green-700">✓ Selected</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Explainer callout */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
          <strong>How we use this:</strong> We compare your round-trip commute to the
          PHEV's battery range. If your commute fits within the electric range and you
          charge regularly, most of your daily driving costs almost nothing in fuel —
          the calculator models this automatically.
        </div>
      </div>

      <div className="flex justify-between">
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
