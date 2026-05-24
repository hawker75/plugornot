'use client'

const OPTIONS = [
  {
    value: 'cash',
    icon: '💵',
    title: 'Cash Purchase',
    desc: "You're paying the full vehicle price upfront.",
  },
  {
    value: 'monthly',
    icon: '📅',
    title: 'Monthly Payments',
    desc: "You'll enter your monthly payment and loan term.",
  },
  {
    value: 'biweekly',
    icon: '📆',
    title: 'Bi-weekly Payments',
    desc: "You'll enter your bi-weekly payment and loan term.",
  },
]

export default function Step1ComparisonType({ data, onUpdate, onNext }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-1">
        How are you paying for the vehicle?
      </h2>
      <p className="text-gray-500 text-sm mb-6">
        Choose the payment type you want to compare across all vehicles.
      </p>

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

      {/* Lease disclaimer — shown when a payment option is selected */}
      {data.comparisonType && data.comparisonType !== 'cash' && (
        <div className="mt-5 bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
          <strong>Not a lease calculator.</strong> Monthly and bi-weekly payment options model
          a standard <strong>financing loan</strong> — at the end of the term you own the vehicle
          outright. Leases work differently (residual value, mileage limits, end-of-term buyout)
          and are not supported. If you're comparing a lease, use <strong>Cash Purchase</strong> and
          enter the total cost of the vehicle instead.
        </div>
      )}

      <div className="mt-5 flex justify-end">
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
