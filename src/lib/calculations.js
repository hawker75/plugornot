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
// Key formula logic:
//   - If daily round-trip ≤ EV range  → 100% of commute on electricity
//   - If daily round-trip > EV range  → EV range on electricity, overage on gasoline
//   - All non-commute driving is modelled on gasoline
//   - Charging frequency scales down EV usage (e.g. charging 75% of days = 75% of EV km)
//
// If no commute is entered, we estimate daily driving from annual total / 365
// so PHEVs still get realistic EV credit without requiring a commute entry.

export function calculatePHEVDetails(vehicle, settings) {
  const {
    cityRatio,
    unitSystem,
    fuelPrice,
    electricityPrice,
    distanceAmount,
    distancePeriod,
    dailyCommuteKm,     // one-way commute in user's unit system (optional)
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

  // If no commute was entered, fall back to estimated daily distance.
  // This ensures PHEVs still receive realistic EV credit even when the
  // commute field is left blank.
  const effectiveDailyKm =
    dailyRoundTripKm > 0
      ? dailyRoundTripKm
      : annualKm > 0
        ? annualKm / 365
        : 0

  // Charging frequency → fraction of days the battery starts full
  const chargingFactors = {
    daily:        1.00,
    most_days:    0.75,
    occasionally: 0.40,
    rarely:       0.10,
  }
  const cf = chargingFactors[chargingFrequency] || 1.0

  // EV-mode km per day:
  //   = the portion of daily driving that fits within the battery range
  //     × the fraction of days the driver actually charges
  //
  // If commute ≤ range  → full daily distance is on electricity
  // If commute > range  → only 'range' km are electric; the overage is gas
  const evKmPerDay =
    electricRangeKm > 0 && effectiveDailyKm > 0
      ? Math.min(effectiveDailyKm, electricRangeKm) * cf
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

// ─── Build Recharts-ready data array ─────────────────────────────────────────
//
// Cash / Finance:  year 0 → 10  (yearly points)
// Lease:           year 0 → leaseTerm/12  (yearly points, capped at term end)
//
// Lease term options are always multiples of 12 months (24/36/48/60),
// so yearly granularity is exact.

export function buildChartData(vehicles, settings) {
  const active = vehicles.filter((v) => v.id)
  if (!active.length) return []

  const { comparisonType, paymentFrequency, leaseTerm } = settings
  const isLease = comparisonType === 'lease'

  const totalYears = isLease ? (leaseTerm || 36) / 12 : 10
  const points = Array.from({ length: totalYears + 1 }, (_, i) => i)

  return points.map((year) => {
    const point = { year }

    active.forEach((vehicle, idx) => {
      const annualFuel = calculateAnnualFuelCost(vehicle, settings)
      const fuel = year * annualFuel
      let vc = 0

      if (comparisonType === 'cash') {
        vc = parseFloat(vehicle.price) || 0

      } else if (comparisonType === 'finance') {
        const termCap = parseInt(vehicle.termYears) || 5
        if (paymentFrequency === 'biweekly') {
          const maxPayments = termCap * 26
          vc = Math.min(year * 26, maxPayments) * (parseFloat(vehicle.paymentAmount) || 0)
        } else {
          const maxPayments = termCap * 12
          vc = Math.min(year * 12, maxPayments) * (parseFloat(vehicle.paymentAmount) || 0)
        }

      } else if (comparisonType === 'lease') {
        const lt = leaseTerm || 36
        if (paymentFrequency === 'biweekly') {
          // Total biweekly payments in the lease = leaseTerm months × (26/12)
          const totalPayments = Math.round(lt * 26 / 12)
          vc = Math.min(year * 26, totalPayments) * (parseFloat(vehicle.paymentAmount) || 0)
        } else {
          // Monthly: total payments = leaseTerm months
          vc = Math.min(year * 12, lt) * (parseFloat(vehicle.paymentAmount) || 0)
        }
      }

      point[`v${idx}`] = Math.round(vc + fuel)
    })

    return point
  })
}

// ─── Summary stats for results panel ────────────────────────────────────────
//
// Returns period-aware totals:
//   periodYears       — comparison horizon (10 for cash/finance, leaseTerm/12 for lease)
//   totalVehicleCost  — all payments / purchase price over the period
//   periodFuel        — total fuel/energy cost over the period
//   periodTotal       — totalVehicleCost + periodFuel  (the "headline" number)
//
// PHEV-specific fields: evFraction, evCost, gasCost (null for non-PHEVs)

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

  const { comparisonType, paymentFrequency, leaseTerm } = settings
  const lt = leaseTerm || 36

  let totalVehicleCost = 0
  let periodYears = 10

  if (comparisonType === 'cash') {
    totalVehicleCost = parseFloat(vehicle.price) || 0
    periodYears = 10

  } else if (comparisonType === 'finance') {
    const years = parseInt(vehicle.termYears) || 5
    if (paymentFrequency === 'biweekly') {
      totalVehicleCost = (parseFloat(vehicle.paymentAmount) || 0) * years * 26
    } else {
      totalVehicleCost = (parseFloat(vehicle.paymentAmount) || 0) * years * 12
    }
    periodYears = 10

  } else if (comparisonType === 'lease') {
    if (paymentFrequency === 'biweekly') {
      const totalPayments = Math.round(lt * 26 / 12)
      totalVehicleCost = (parseFloat(vehicle.paymentAmount) || 0) * totalPayments
    } else {
      totalVehicleCost = (parseFloat(vehicle.paymentAmount) || 0) * lt
    }
    periodYears = lt / 12
  }

  const periodFuel  = annualFuel * periodYears
  const periodTotal = totalVehicleCost + periodFuel

  return {
    annualFuel,
    totalVehicleCost,
    periodFuel,
    periodTotal,
    periodYears,
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
