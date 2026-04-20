import React from 'react'

export default function TextCategory({ onFind, onBack, onIP }) {
  return (
    <div className="text-category">
      <button className="back" onClick={onBack}>← Back</button>
      <h2>Text Tools</h2>
      <p>Find words by letters using simple filters, or check your public IP.</p>
      <div style={{marginTop:12, display:'flex', gap:8, flexWrap:'wrap'}}>
        <button onClick={onFind}>Find Words By letters</button>
        <button onClick={onIP}>What is my IP?</button>
      </div>
    </div>
  )
}
