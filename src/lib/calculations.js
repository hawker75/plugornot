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

// ─── PHEV-specific calculation ────────────────────────────────────────────────
//
// Models the split between EV-mode and gas-mode driving based on:
//   • daily commute distance vs. vehicle electric range
//   • how often the driver charges
//
// Returns a detail object so the results screen can show the breakdown.

export function calculatePHEVDetails(vehicle, settings) {
  const {
    cityRatio,
    unitSystem,
    fuelPrice,
    electricityPrice,
    distanceAmount,
    distancePeriod,
    dailyCommuteKm,   // one-way commute in user's unit system
    chargingFrequency,
  } = settings

  const hwRatio = 1 - cityRatio
  const { annualKm } = getAnnualDistance(distanceAmount, distancePeriod, unitSystem)
  const fp = parseFloat(fuelPrice) || 0
  const ep = parseFloat(electricityPrice) || 0

  // Electric range is always stored in km
  const electricRangeKm = parseFloat(vehicle.electric_range_km) || 0

  // Convert the user's one-way commute to km
  let commuteOneWayKm = parseFloat(dailyCommuteKm) || 0
  if (unitSystem === 'imperial') commuteOneWayKm = commuteOneWayKm * 1.60934
  const dailyRoundTripKm = commuteOneWayKm * 2

  // Charging frequency → fraction of days the battery is full
  const chargingFactors = {
    daily:        1.00,
    most_days:    0.75,
    occasionally: 0.40,
    rarely:       0.10,
  }
  const cf = chargingFactors[chargingFrequency] || 1.0

  // How many EV-mode km are driven each day
  //   = (the part of the commute that fits within the electric range)
  //     × (fraction of days the driver actually charges)
  const evKmPerDay =
    electricRangeKm > 0 && dailyRoundTripKm > 0
      ? Math.min(dailyRoundTripKm, electricRangeKm) * cf
      : 0

  // Annual breakdown (EV km cannot exceed total annual driving)
  const evAnnualKm  = Math.min(evKmPerDay * 365, annualKm)
  const gasAnnualKm = annualKm - evAnnualKm
  const evFraction  = annualKm > 0 ? evAnnualKm / annualKm : 0

  // ── EV-mode cost ──────────────────────────────────────────────────────────
  // city_kwh_per_100km stores EV-mode efficiency for PHEVs (set in DB)
  const evEffKwh = parseFloat(vehicle.city_kwh_per_100km) || 23  // fallback 23 kWh/100 km
  const evCost = (evAnnualKm / 100) * evEffKwh * ep

  // ── Gas-mode cost ─────────────────────────────────────────────────────────
  let gasCost = 0
  if (unitSystem === 'imperial') {
    const cMpg = parseFloat(vehicle.city_mpg) || 35
    const hMpg = parseFloat(vehicle.highway_mpg) || 35
    const gasAnnualMiles = gasAnnualKm / 1.60934
    const galPerMile = cityRatio / cMpg + hwRatio / hMpg
    gasCost = gasAnnualMiles * galPerMile * fp
  } else {
    const cL = parseFloat(vehicle.city_l100km) || 7.5
    const hL = parseFloat(vehicle.highway_l100km) || 7.0
    const effL = cityRatio * cL + hwRatio * hL
    gasCost = (gasAnnualKm / 100) * effL * fp
  }

  return {
    total: evCost + gasCost,
    evFraction,
    evAnnualKm,
    gasAnnualKm,
    evCost,
    gasCost,
  }
}

// ─── Annual fuel / energy cost for one vehicle ───────────────────────────────

export function calculateAnnualFuelCost(vehicle, settings) {
  // PHEVs get their own commute-aware path
  if (vehicle.fuel_type === 'phev') {
    return calculatePHEVDetails(vehicle, settings).total
  }

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
      const hwy  = parseFloat(vehicle.highway_kwh_per_100mi) || 0
      const eff  = cityRatio * city + hwRatio * hwy
      return (annualMiles / 100) * eff * ep
    }
    // Gasoline / hybrid — weighted harmonic mean (gallons per mile)
    const cMpg = parseFloat(vehicle.city_mpg) || 1
    const hMpg = parseFloat(vehicle.highway_mpg) || 1
    const galPerMile = cityRatio / cMpg + hwRatio / hMpg
    return annualMiles * galPerMile * fp
  }

  // Metric
  if (isEV) {
    const city = parseFloat(vehicle.city_kwh_per_100km) || 0
    const hwy  = parseFloat(vehicle.highway_kwh_per_100km) || 0
    const eff  = cityRatio * city + hwRatio * hwy
    return (annualKm / 100) * eff * ep
  }
  const cL   = parseFloat(vehicle.city_l100km) || 1
  const hL   = parseFloat(vehicle.highway_l100km) || 1
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
  let annualFuel
  let evFraction = null
  let evCost     = null
  let gasCost    = null

  if (vehicle.fuel_type === 'phev') {
    const d  = calculatePHEVDetails(vehicle, settings)
    annualFuel  = d.total
    evFraction  = d.evFraction
    evCost      = d.evCost
    gasCost     = d.gasCost
  } else {
    annualFuel = calculateAnnualFuelCost(vehicle, settings)
  }

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
    tenYearFuel:  annualFuel * 10,
    tenYearTotal: totalVehicleCost + annualFuel * 10,
    evFraction,
    evCost,
    gasCost,
  }
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

export function fmt(n) {
  if (isNaN(n) || n == null) return '$0'
  return '$' + Math.round(n).toLocaleString()
}
