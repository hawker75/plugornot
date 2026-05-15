import Calculator from '@/components/Calculator'

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
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

      <Calculator />
    </div>
  )
}
