import './globals.css'

export const metadata = {
  title: 'PlugOrNot — Vehicle Cost of Ownership Calculator',
  description:
    'Compare the true 10-year cost of owning gas, hybrid, PHEV, and electric vehicles side by side.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">⚡</span>
              </div>
              <span className="text-xl font-bold text-gray-900">
                Plug<span className="text-green-600">OrNot</span>
              </span>
            </div>
            <span className="text-gray-400 text-sm hidden sm:block">
              Vehicle Cost of Ownership Calculator
            </span>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white mt-12">
          <div className="max-w-4xl mx-auto px-4 py-4 text-center text-sm text-gray-400">
            Fuel economy figures are EPA estimates. Actual costs will vary.
          </div>
        </footer>
      </body>
    </html>
  )
}
