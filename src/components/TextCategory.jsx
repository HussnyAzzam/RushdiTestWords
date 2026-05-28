import React from 'react'

export default function TextCategory({ onFind, onBack }) {
  return (
    <div className="text-category">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>Text Tools</h2>
      <p>Find words by letters using simple filters.</p>
      <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
        <button onClick={onFind}>Find Words By letters</button>
      </div>
    </div>
  )
}
