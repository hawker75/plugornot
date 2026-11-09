import FloatingIcons from '@/components/FloatingIcons'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <FloatingIcons />

      {/* Paused notice */}
      <div className="mb-8 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4 text-center">
        <p className="font-semibold text-amber-900">
          This website is currently paused for calculations.
        </p>
        <p className="text-sm text-amber-800 mt-1">
          It will return in the near future, bigger and better.
        </p>
      </div>

      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Should you plug in — or not?
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto">
          Compare the true 10-year cost of owning up to 3 vehicles side by
          side, including fuel, payments, and payoff dates.
        </p>
      </div>

      {/* Calculator hidden while the Supabase project is paused (its
          dropdowns load from Supabase). Restore with:
          import Calculator from '@/components/Calculator' and <Calculator /> */}
    </div>
  )
}
