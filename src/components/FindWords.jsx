import React, { useState } from 'react'
import words from '../data/dictionary.json'

const MATCH_TYPES = [
  { value: 'starts', label: 'words that start with' },
  { value: 'ends', label: 'words that end with' },
  { value: 'contains', label: 'words that contain' }
]

function createEmptyRow(id) {
  return { id, op: 'AND', type: 'contains', value: '' }
}

export default function FindWords({ onBack }) {
  const [criteria, setCriteria] = useState([createEmptyRow(1)])
  const [results, setResults] = useState([])
  const [message, setMessage] = useState('')

  const addRow = () => setCriteria(c => [...c, createEmptyRow(Date.now())])
  const removeRow = (id) => setCriteria(c => c.filter(r => r.id !== id))
  const updateRow = (id, patch) => setCriteria(c => c.map(r => r.id === id ? {...r, ...patch} : r))
  const clearAll = () => { setCriteria([createEmptyRow(1)]); setResults([]); setMessage('') }
  const exampleFill = () => setCriteria([ { id:1, op:'AND', type:'starts', value:'a' }, { id:2, op:'OR', type:'contains', value:'an' } ])

  const runSearch = () => {
    const valid = criteria.filter(c => c.value && c.value.trim().length > 0)
    if (valid.length === 0) { setMessage('Please enter at least one search term.'); setResults([]); return }
    setMessage('')

    let resultSet = new Set()
    valid.forEach((crit, idx) => {
      const v = crit.value.trim().toLowerCase()
      const matches = new Set(words.filter(w => {
        const lw = w.toLowerCase()
        if (crit.type === 'starts') return lw.startsWith(v)
        if (crit.type === 'ends') return lw.endsWith(v)
        return lw.includes(v)
      }))

      if (idx === 0) {
        resultSet = matches
      } else {
        if (crit.op === 'AND') {
          resultSet = new Set([...resultSet].filter(x => matches.has(x)))
        } else {
          resultSet = new Set([...resultSet, ...matches])
        }
      }
    })

    setResults([...resultSet].sort((a,b) => a.localeCompare(b)))
  }

  const highlightWord = (word) => {
    // find first criterion that matches this word and highlight the matching substring
    for (const crit of criteria) {
      const v = (crit.value || '').trim()
      if (!v) continue
      const lw = word.toLowerCase()
      const idx = lw.indexOf(v.toLowerCase())
      if (idx === -1) continue
      const before = word.slice(0, idx)
      const match = word.slice(idx, idx + v.length)
      const after = word.slice(idx + v.length)
      return <span>{before}<mark>{match}</mark>{after}</span>
    }
    return word
  }

  return (
    <div className="find-words">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>Find Words By letters</h2>
      <p>Enter letters and choose how to match. Combine multiple terms with <strong>AND</strong> / <strong>OR</strong>.</p>

      <div className="criteria">
        {criteria.map((row, i) => (
          <div className="criteria-row" key={row.id}>
            {i > 0 && (
              <select aria-label={`Operator for row ${i+1}`} value={row.op} onChange={e => updateRow(row.id, { op: e.target.value })}>
                <option value="AND">AND</option>
                <option value="OR">OR</option>
              </select>
            )}

            <select aria-label={`Match type for row ${i+1}`} value={row.type} onChange={e => updateRow(row.id, { type: e.target.value })}>
              {MATCH_TYPES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>

            <input aria-label={`Letters for row ${i+1}`} placeholder="Enter letters" value={row.value} onChange={e => updateRow(row.id, { value: e.target.value })} />

            {criteria.length > 1 && (
              <button onClick={() => removeRow(row.id)} aria-label={`Remove row ${i+1}`} style={{background:'#e53e3e'}}>Remove</button>
            )}
          </div>
        ))}
      </div>

      <div className="controls">
        <button onClick={addRow}>Add term</button>
        <button onClick={exampleFill}>Example</button>
        <button onClick={clearAll}>Clear</button>
        <button onClick={runSearch}>Search</button>
      </div>

      {message && <p className="message">{message}</p>}

      <div className="results">
        <h3>Results ({results.length})</h3>
        <ul>
          {results.map(w => (
            <li key={w}>{highlightWord(w)}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
