'use client'

import { useState } from 'react'
import ProgressBar from './ProgressBar'
import Step1ComparisonType from './steps/Step1ComparisonType'
import Step2EnergyPrices from './steps/Step2EnergyPrices'
import Step3DrivingProfile from './steps/Step3DrivingProfile'
import Step4Vehicles from './steps/Step4Vehicles'
import Step5Results from './steps/Step5Results'

const EMPTY_VEHICLE = (slotId) => ({
  slotId,
  // DB fields (populated when user picks a vehicle)
  id: null,
  year: null,
  make: null,
  model: null,
  trim: null,
  fuel_type: null,
  city_mpg: null,
  highway_mpg: null,
  city_l100km: null,
  highway_l100km: null,
  city_kwh_per_100mi: null,
  highway_kwh_per_100mi: null,
  city_kwh_per_100km: null,
  highway_kwh_per_100km: null,
  electric_range_km: null,   // PHEV electric-only range (km)
  drivetrain: null,          // 'FWD' | 'AWD' | 'RWD' | '4x4'
  // Payment fields
  price: '',
  paymentAmount: '',
  termYears: '5',
  interestRate: '',
})

const INITIAL_STATE = {
  // Step 1
  comparisonType: null,
  // Step 2
  market: 'CA',        // 'CA' | 'US' — filters vehicle dropdown to local market
  unitSystem: 'metric',
  fuelPrice: '',
  electricityPrice: '',
  // Step 3
  cityRatio: 0.55,
  distanceAmount: '',
  distancePeriod: 'week',
  dailyCommuteKm: '',       // one-way commute in user's unit system (used for PHEV calc)
  chargingFrequency: 'daily', // how often a PHEV would be charged
  // Step 4
  vehicles: [EMPTY_VEHICLE(0), EMPTY_VEHICLE(1), EMPTY_VEHICLE(2)],
  activeVehicleCount: 1,
}

export default function Calculator() {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState(INITIAL_STATE)

  function update(changes) {
    setFormData((prev) => ({ ...prev, ...changes }))
  }

  function next() {
    setStep((s) => Math.min(s + 1, 5))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function back() {
    setStep((s) => Math.max(s - 1, 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function reset() {
    setFormData(INITIAL_STATE)
    setStep(1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      {/* Progress indicator */}
      <div className="mb-8">
        <ProgressBar currentStep={step} />
      </div>

      {/* Steps */}
      {step === 1 && (
        <Step1ComparisonType data={formData} onUpdate={update} onNext={next} />
      )}
      {step === 2 && (
        <Step2EnergyPrices
          data={formData}
          onUpdate={update}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 3 && (
        <Step3DrivingProfile
          data={formData}
          onUpdate={update}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 4 && (
        <Step4Vehicles
          data={formData}
          onUpdate={update}
          onNext={next}
          onBack={back}
        />
      )}
      {step === 5 && (
        <Step5Results data={formData} onBack={back} onReset={reset} />
      )}
    </div>
  )
}
