// Decorative background: icons drift up the page behind the content.
// Pure CSS (see .floating-icon in globals.css), so it ships no JavaScript.

const ICONS = {
  car: (
    <>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
      <circle cx="7" cy="17" r="2" />
      <path d="M9 17h6" />
      <circle cx="17" cy="17" r="2" />
    </>
  ),
  calculator: (
    <>
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01M12 10h.01M8 10h.01M12 14h.01M8 14h.01M12 18h.01M8 18h.01" />
    </>
  ),
  question: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>
  ),
  plug: (
    <>
      <path d="M12 22v-5" />
      <path d="M9 8V2" />
      <path d="M15 8V2" />
      <path d="M18 8v5a4 4 0 0 1-4 4h-4a4 4 0 0 1-4-4V8Z" />
    </>
  ),
  bolt: <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  battery: (
    <>
      <path d="M15 7h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <path d="M6 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h1" />
      <path d="m11 7-3 5h4l-3 5" />
      <line x1="22" x2="22" y1="11" y2="13" />
    </>
  ),
  fuel: (
    <>
      <line x1="3" x2="15" y1="22" y2="22" />
      <line x1="4" x2="14" y1="9" y2="9" />
      <path d="M14 22V4a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v18" />
      <path d="M14 13h2a2 2 0 0 1 2 2v2a2 2 0 0 0 2 2a2 2 0 0 0 2-2V9.83a2 2 0 0 0-.59-1.42L18 5" />
    </>
  ),
}

const COLORS = {
  car: 'text-gray-500',
  calculator: 'text-gray-500',
  question: 'text-amber-500',
  plug: 'text-green-600',
  bolt: 'text-green-500',
  battery: 'text-green-600',
  fuel: 'text-gray-400',
}

// Fixed layout (no randomness) so every visit looks the same.
// x: left %, y: resting spot for reduced motion, size: px,
// dur/delay: seconds (negative delay = already mid-flight on load),
// drift: sideways sway px, spin: degrees turned over one trip.
const PLACEMENTS = [
  { icon: 'car', x: 4, y: 18, size: 44, dur: 26, delay: -3, drift: 30, spin: 20 },
  { icon: 'question', x: 13, y: 62, size: 30, dur: 19, delay: -11, drift: -24, spin: -40 },
  { icon: 'plug', x: 22, y: 35, size: 38, dur: 23, delay: -17, drift: 20, spin: 35 },
  { icon: 'calculator', x: 31, y: 80, size: 34, dur: 28, delay: -6, drift: -30, spin: -25 },
  { icon: 'bolt', x: 40, y: 10, size: 28, dur: 17, delay: -2, drift: 18, spin: 60 },
  { icon: 'fuel', x: 48, y: 55, size: 36, dur: 25, delay: -20, drift: -20, spin: -15 },
  { icon: 'battery', x: 57, y: 28, size: 40, dur: 22, delay: -9, drift: 26, spin: 25 },
  { icon: 'question', x: 65, y: 72, size: 26, dur: 18, delay: -14, drift: -18, spin: 45 },
  { icon: 'car', x: 73, y: 45, size: 50, dur: 30, delay: -22, drift: 22, spin: -18 },
  { icon: 'calculator', x: 82, y: 15, size: 30, dur: 21, delay: -4, drift: -26, spin: 30 },
  { icon: 'plug', x: 90, y: 66, size: 34, dur: 24, delay: -13, drift: 16, spin: -35 },
  { icon: 'bolt', x: 96, y: 38, size: 24, dur: 16, delay: -8, drift: -14, spin: -50 },
  { icon: 'question', x: 8, y: 88, size: 22, dur: 20, delay: -16, drift: 14, spin: 30 },
  { icon: 'battery', x: 36, y: 48, size: 28, dur: 27, delay: -25, drift: -16, spin: -20 },
  { icon: 'question', x: 52, y: 92, size: 34, dur: 22, delay: -1, drift: 20, spin: -30 },
  { icon: 'car', x: 86, y: 86, size: 36, dur: 29, delay: -18, drift: -22, spin: 15 },
]

export default function FloatingIcons() {
  return (
    <div aria-hidden="true" className="floating-icons fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {PLACEMENTS.map((p, i) => (
        <span
          key={i}
          className={`floating-icon ${COLORS[p.icon]}`}
          style={{
            '--x': `${p.x}%`,
            '--y': `${p.y}vh`,
            '--size': `${p.size}px`,
            '--dur': `${p.dur}s`,
            '--delay': `${p.delay}s`,
            '--drift': `${p.drift}px`,
            '--spin': `${p.spin}deg`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {ICONS[p.icon]}
          </svg>
        </span>
      ))}
    </div>
  )
}
