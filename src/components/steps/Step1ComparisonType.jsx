'use client'

const OPTIONS = [
  {
    value: 'cash',
    icon: '💵',
    title: 'Cash Purchase',
    desc: 'Pay the full vehicle price upfront.',
  },
  {
    value: 'finance',
    icon: '🏦',
    title: 'Finance',
    desc: 'Standard loan — you own the vehicle at the end of the term.',
  },
  {
    value: 'lease',
    icon: '📋',
    title: 'Lease',
    desc: 'Fixed payments — vehicle is returned at the end of the term.',
  },
]

const FREQ_OPTIONS = [
  { value: 'monthly',  label: 'Monthly',   desc: '12 payments / year' },
  { value: 'biweekly', label: 'Bi-weekly', desc: '26 payments / year' },
]

const LEASE_TERMS = [24, 36, 48, 60]

export default function Step1ComparisonType({ data, onUpdate, onNext }) {
  const isFinance = data.comparisonType === 'finance'
  const isLease   = data.comparisonType === 'lease'
  const showSubOptions = isFinance || isLease

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        How are you paying for the vehicle?
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose the payment type you want to compare across all vehicles.
      </p>

      {/* Main payment type selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {OPTIONS.map((opt) => {
          const selected = data.comparisonType === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => onUpdate({ comparisonType: opt.value })}
              className={`
                rounded-xl border-2 p-5 text-left transition-all cursor-pointer
                ${selected
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-50/30'}
              `}
            >
              <div className="text-3xl mb-3">{opt.icon}</div>
              <div className="font-semibold text-gray-900 mb-1">{opt.title}</div>
              <div className="text-sm text-gray-500">{opt.desc}</div>
              {selected && (
                <div className="mt-3 text-xs font-medium text-green-700 flex items-center gap-1">
                  <span>✓</span> Selected
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Sub-options — shown for Finance and Lease */}
      {showSubOptions && (
        <div className="mt-5 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-5">

          {/* Payment frequency — Finance and Lease */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment frequency
            </label>
            <div className="flex gap-2">
              {FREQ_OPTIONS.map((f) => {
                const sel = data.paymentFrequency === f.value
                return (
                  <button
                    key={f.value}
                    onClick={() => onUpdate({ paymentFrequency: f.value })}
                    className={`
                      flex-1 rounded-lg border-2 p-3 text-left transition-all cursor-pointer
                      ${sel
                        ? 'border-green-600 bg-white'
                        : 'border-gray-200 bg-white hover:border-green-300'}
                    `}
                  >
                    <div className="font-medium text-sm text-gray-900">{f.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{f.desc}</div>
                    {sel && <div className="mt-1.5 text-xs font-medium text-green-700">✓ Selected</div>}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Lease term — Lease only */}
          {isLease && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lease term
                <span className="ml-1.5 font-normal text-gray-400 text-xs">
                  — applies to all vehicles in this comparison
                </span>
              </label>
              <div className="flex gap-2">
                {LEASE_TERMS.map((mo) => {
                  const sel = data.leaseTerm === mo
                  return (
                    <button
                      key={mo}
                      onClick={() => onUpdate({ leaseTerm: mo })}
                      className={`
                        flex-1 rounded-lg border-2 py-2.5 px-1 text-center transition-all cursor-pointer
                        ${sel
                          ? 'border-green-600 bg-white'
                          : 'border-gray-200 bg-white hover:border-green-300'}
                      `}
                    >
                      <div className="font-semibold text-sm text-gray-900">{mo} mo</div>
                      <div className="text-xs text-gray-400">{mo / 12} yr</div>
                      {sel && <div className="mt-1 text-xs font-medium text-green-700">✓</div>}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Lease info callout */}
          {isLease && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
              <strong>Lease mode:</strong> In Step 4 you'll enter the quoted payment for each vehicle.
              The interest rate and residual value are already baked into your lease quote — only
              the payment amount is needed. The chart and totals will cover
              your <strong>{data.leaseTerm}-month</strong> term only.
            </div>
          )}
        </div>
      )}

      <div className="mt-6 flex justify-end">
        <button
          onClick={onNext}
          disabled={!data.comparisonType}
          className="px-6 py-2.5 rounded-lg bg-green-600 text-white font-medium
            hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Continue →
        </button>
      </div>
    </div>
  )
}
