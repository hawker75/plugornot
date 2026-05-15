'use client'

const STEPS = [
  { n: 1, label: 'Comparison' },
  { n: 2, label: 'Energy Prices' },
  { n: 3, label: 'Driving Profile' },
  { n: 4, label: 'Vehicles' },
  { n: 5, label: 'Results' },
]

export default function ProgressBar({ currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {STEPS.map((step, i) => {
          const done = currentStep > step.n
          const active = currentStep === step.n
          return (
            <div key={step.n} className="flex items-center flex-1">
              {/* Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors
                    ${done ? 'bg-green-600 border-green-600 text-white' : ''}
                    ${active ? 'bg-white border-green-600 text-green-600' : ''}
                    ${!done && !active ? 'bg-white border-gray-300 text-gray-400' : ''}
                  `}
                >
                  {done ? '✓' : step.n}
                </div>
                <span
                  className={`mt-1 text-xs font-medium hidden sm:block
                    ${active ? 'text-green-600' : ''}
                    ${done ? 'text-green-600' : ''}
                    ${!done && !active ? 'text-gray-400' : ''}
                  `}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line (not after last) */}
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors
                    ${done ? 'bg-green-600' : 'bg-gray-200'}
                  `}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
