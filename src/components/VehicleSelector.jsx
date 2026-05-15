'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

function SelectBox({ label, value, onChange, options, disabled, placeholder }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 bg-white
          outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
          disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </div>
  )
}

export default function VehicleSelector({ onVehicleSelect, currentVehicle }) {
  const [years, setYears] = useState([])
  const [makes, setMakes] = useState([])
  const [models, setModels] = useState([])
  const [trims, setTrims] = useState([])

  const [selectedYear, setSelectedYear] = useState(currentVehicle?.year?.toString() || '')
  const [selectedMake, setSelectedMake] = useState(currentVehicle?.make || '')
  const [selectedModel, setSelectedModel] = useState(currentVehicle?.model || '')
  const [selectedTrim, setSelectedTrim] = useState(currentVehicle?.trim || '')

  const [loading, setLoading] = useState(false)

  // Load years on mount
  useEffect(() => {
    supabase
      .from('vehicles')
      .select('year')
      .order('year', { ascending: false })
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.year))]
          setYears(unique)
        }
      })
  }, [])

  // Load makes when year changes
  useEffect(() => {
    if (!selectedYear) { setMakes([]); setSelectedMake(''); return }
    supabase
      .from('vehicles')
      .select('make')
      .eq('year', parseInt(selectedYear))
      .order('make')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.make))]
          setMakes(unique)
        }
      })
  }, [selectedYear])

  // Load models when make changes
  useEffect(() => {
    if (!selectedYear || !selectedMake) { setModels([]); setSelectedModel(''); return }
    supabase
      .from('vehicles')
      .select('model')
      .eq('year', parseInt(selectedYear))
      .eq('make', selectedMake)
      .order('model')
      .then(({ data }) => {
        if (data) {
          const unique = [...new Set(data.map((r) => r.model))]
          setModels(unique)
        }
      })
  }, [selectedYear, selectedMake])

  // Load trims when model changes
  useEffect(() => {
    if (!selectedYear || !selectedMake || !selectedModel) { setTrims([]); setSelectedTrim(''); return }
    supabase
      .from('vehicles')
      .select('trim')
      .eq('year', parseInt(selectedYear))
      .eq('make', selectedMake)
      .eq('model', selectedModel)
      .order('trim')
      .then(({ data }) => {
        if (data) setTrims(data.map((r) => r.trim))
      })
  }, [selectedYear, selectedMake, selectedModel])

  // When trim is selected, fetch full vehicle row and call parent
  useEffect(() => {
    if (!selectedYear || !selectedMake || !selectedModel || !selectedTrim) return
    setLoading(true)
    supabase
      .from('vehicles')
      .select('*')
      .eq('year', parseInt(selectedYear))
      .eq('make', selectedMake)
      .eq('model', selectedModel)
      .eq('trim', selectedTrim)
      .single()
      .then(({ data }) => {
        setLoading(false)
        if (data) onVehicleSelect(data)
      })
  }, [selectedYear, selectedMake, selectedModel, selectedTrim])

  function handleYearChange(val) {
    setSelectedYear(val)
    setSelectedMake('')
    setSelectedModel('')
    setSelectedTrim('')
    onVehicleSelect(null)
  }

  function handleMakeChange(val) {
    setSelectedMake(val)
    setSelectedModel('')
    setSelectedTrim('')
    onVehicleSelect(null)
  }

  function handleModelChange(val) {
    setSelectedModel(val)
    setSelectedTrim('')
    onVehicleSelect(null)
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <SelectBox
        label="Year"
        value={selectedYear}
        onChange={handleYearChange}
        options={years.map(String)}
        placeholder="Year"
      />
      <SelectBox
        label="Make"
        value={selectedMake}
        onChange={handleMakeChange}
        options={makes}
        disabled={!selectedYear}
        placeholder="Make"
      />
      <SelectBox
        label="Model"
        value={selectedModel}
        onChange={handleModelChange}
        options={models}
        disabled={!selectedMake}
        placeholder="Model"
      />
      <SelectBox
        label="Trim"
        value={selectedTrim}
        onChange={setSelectedTrim}
        options={trims}
        disabled={!selectedModel}
        placeholder="Trim"
      />
      {loading && (
        <p className="col-span-4 text-xs text-gray-400 animate-pulse">
          Loading vehicle data…
        </p>
      )}
    </div>
  )
}
