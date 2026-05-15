// ─── Distance helpers ────────────────────────────────────────────────────────

export function getAnnualDistance(amount, period, unitSystem) {
  const n = parseFloat(amount)
  if (!n || isNaN(n)) return { annualKm: 0, annualMiles: 0 }
  const mult = { week: 52, month: 12, year: 1 }[period] || 1
  const annual = n * mult
  if (unitSystem === 'imperial') {
    return { annualMiles: annual, annualKm: annual * 1.60934 }
  }
  return { annualKm: annual, annualMiles: annual / 1.60934 }
}

// ─── Annual fuel / energy cost for one vehicle ───────────────────────────────

export function calculateAnnualFuelCost(vehicle, settings) {
  const {
    cityRatio,
    unitSystem,
    fuelPrice,
    electricityPrice,
    distanceAmount,
    distancePeriod,
  } = settings

  const hwRatio = 1 - cityRatio
  const { annualMiles, annualKm } = getAnnualDistance(
    distanceAmount,
    distancePeriod,
    unitSystem
  )

  const fp = parseFloat(fuelPrice) || 0
  const ep = parseFloat(electricityPrice) || 0
  const isEV = vehicle.fuel_type === 'electric'

  if (unitSystem === 'imperial') {
    if (isEV) {
      const city = parseFloat(vehicle.city_kwh_per_100mi) || 0
      const hwy = parseFloat(vehicle.highway_kwh_per_100mi) || 0
      const eff = cityRatio * city + hwRatio * hwy
      return (annualMiles / 100) * eff * ep
    }
    // Gasoline / hybrid / PHEV — weighted harmonic mean (gallons per mile)
    const cMpg = parseFloat(vehicle.city_mpg) || 1
    const hMpg = parseFloat(vehicle.highway_mpg) || 1
    const galPerMile = cityRatio / cMpg + hwRatio / hMpg
    return annualMiles * galPerMile * fp
  }

  // Metric
  if (isEV) {
    const city = parseFloat(vehicle.city_kwh_per_100km) || 0
    const hwy = parseFloat(vehicle.highway_kwh_per_100km) || 0
    const eff = cityRatio * city + hwRatio * hwy
    return (annualKm / 100) * eff * ep
  }
  const cL = parseFloat(vehicle.city_l100km) || 1
  const hL = parseFloat(vehicle.highway_l100km) || 1
  const effL = cityRatio * cL + hwRatio * hL
  return (annualKm / 100) * effL * fp
}

// ─── Build Recharts-ready data array (year 0 → 10) ──────────────────────────

export function buildChartData(vehicles, settings) {
  const active = vehicles.filter((v) => v.id)
  if (!active.length) return []

  return Array.from({ length: 11 }, (_, year) => {
    const point = { year }
    active.forEach((vehicle, idx) => {
      const annualFuel = calculateAnnualFuelCost(vehicle, settings)
      const fuel = year * annualFuel
      let vc = 0

      if (settings.comparisonType === 'cash') {
        vc = parseFloat(vehicle.price) || 0
      } else if (settings.comparisonType === 'monthly') {
        const cap = (parseInt(vehicle.termYears) || 5) * 12
        vc = Math.min(year * 12, cap) * (parseFloat(vehicle.paymentAmount) || 0)
      } else if (settings.comparisonType === 'biweekly') {
        const cap = (parseInt(vehicle.termYears) || 5) * 26
        vc = Math.min(year * 26, cap) * (parseFloat(vehicle.paymentAmount) || 0)
      }

      point[`v${idx}`] = Math.round(vc + fuel)
    })
    return point
  })
}

// ─── Summary stats for results panel ────────────────────────────────────────

export function getVehicleSummary(vehicle, settings) {
  const annualFuel = calculateAnnualFuelCost(vehicle, settings)
  let totalVehicleCost = 0

  if (settings.comparisonType === 'cash') {
    totalVehicleCost = parseFloat(vehicle.price) || 0
  } else if (settings.comparisonType === 'monthly') {
    totalVehicleCost =
      (parseFloat(vehicle.paymentAmount) || 0) *
      (parseInt(vehicle.termYears) || 5) *
      12
  } else if (settings.comparisonType === 'biweekly') {
    totalVehicleCost =
      (parseFloat(vehicle.paymentAmount) || 0) *
      (parseInt(vehicle.termYears) || 5) *
      26
  }

  return {
    annualFuel,
    totalVehicleCost,
    tenYearFuel: annualFuel * 10,
    tenYearTotal: totalVehicleCost + annualFuel * 10,
  }
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

export function fmt(n) {
  if (isNaN(n) || n == null) return '$0'
  return '$' + Math.round(n).toLocaleString()
}
