import React, { useState, useEffect } from 'react'
import unitsData from '../data/units.json'

export default function UnitsConverter({ onBack }) {
  const [selectedGroup, setSelectedGroup] = useState('length')
  const [fromUnit, setFromUnit] = useState('meter')
  const [toUnit, setToUnit] = useState('kilometer')
  const [inputValue, setInputValue] = useState('')
  const [result, setResult] = useState('')

  const groups = Object.keys(unitsData)
  const currentGroup = unitsData[selectedGroup]
  const availableUnits = Object.keys(currentGroup.units)

  // Handle group change
  useEffect(() => {
    const firstUnit = availableUnits[0]
    setFromUnit(firstUnit)
    setToUnit(availableUnits[1] || firstUnit)
    setInputValue('')
    setResult('')
  }, [selectedGroup])

  // Conversion function
  const handleConvert = () => {
    if (!inputValue || isNaN(inputValue)) {
      setResult('Please enter a valid number')
      return
    }

    const input = parseFloat(inputValue)
    const group = unitsData[selectedGroup]

    // Special handling for temperature
    if (selectedGroup === 'temperature') {
      let valueInCelsius = input

      // Convert input to Celsius
      if (fromUnit === 'fahrenheit') {
        valueInCelsius = (input - 32) * (5 / 9)
      } else if (fromUnit === 'kelvin') {
        valueInCelsius = input - 273.15
      }

      // Convert from Celsius to target unit
      let convertedValue = valueInCelsius
      if (toUnit === 'fahrenheit') {
        convertedValue = valueInCelsius * (9 / 5) + 32
      } else if (toUnit === 'kelvin') {
        convertedValue = valueInCelsius + 273.15
      }

      setResult(convertedValue.toFixed(6))
    } else {
      // Standard conversion: input -> base unit -> target unit
      const fromFactor = group.units[fromUnit]
      const toFactor = group.units[toUnit]

      const valueInBaseUnit = input * fromFactor
      const convertedValue = valueInBaseUnit / toFactor

      setResult(convertedValue.toFixed(6))
    }
  }

  const handleSwapUnits = () => {
    setFromUnit(toUnit)
    setToUnit(fromUnit)
  }

  return (
    <div className="units-converter">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>Units Converter</h2>
      <p>Convert between different units of measurement.</p>

      {/* Group Selection */}
      <div className="control-group" style={{ marginTop: 16 }}>
        <label>Select Unit Type:</label>
        <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}>
          {groups.map((group) => (
            <option key={group} value={group}>
              {group.charAt(0).toUpperCase() + group.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* From Unit */}
      <div className="control-group">
        <label>From:</label>
        <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)}>
          {availableUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit.charAt(0).toUpperCase() + unit.slice(1).replace(/_/g, ' ')}
            </option>
          ))}
        </select>
        <input
          type="number"
          placeholder="Enter value"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
        />
      </div>

      {/* Swap Button */}
      <button className="swap-btn" onClick={handleSwapUnits}>
        ⇄ Swap Units
      </button>

      {/* To Unit */}
      <div className="control-group">
        <label>To:</label>
        <select value={toUnit} onChange={(e) => setToUnit(e.target.value)}>
          {availableUnits.map((unit) => (
            <option key={unit} value={unit}>
              {unit.charAt(0).toUpperCase() + unit.slice(1).replace(/_/g, ' ')}
            </option>
          ))}
        </select>
      </div>

      {/* Convert Button */}
      <div className="controls">
        <button onClick={handleConvert}>Convert</button>
      </div>

      {/* Result */}
      {result && (
        <div className="results" style={{ marginTop: 16 }}>
          <p>
            <strong>{inputValue} {fromUnit.replace(/_/g, ' ')}</strong> = <strong>{result} {toUnit.replace(/_/g, ' ')}</strong>
          </p>
        </div>
      )}
    </div>
  )
}
