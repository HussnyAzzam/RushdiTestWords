import React from 'react'

export default function Home({ onOpenCategory, onOpenIP, onOpenUnits, onOpenYouTube }) {
  return (
    <div className="home">
      <h2>Categories</h2>
      <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
        <div className="category-card" onClick={onOpenCategory} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') onOpenCategory() }}>
          <h3>Text Tools</h3>
          <p>Find words by letters using simple filters.</p>
        </div>
        <div className="category-card" onClick={onOpenIP} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') onOpenIP() }}>
          <h3>What is my IP?</h3>
          <p>Check your public IP address instantly.</p>
        </div>
        <div className="category-card" onClick={onOpenUnits} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') onOpenUnits() }}>
          <h3>Units Converter</h3>
          <p>Convert between different units of measurement.</p>
        </div>
        <div className="category-card" onClick={onOpenYouTube} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') onOpenYouTube() }}>
          <h3>YouTube Player</h3>
          <p>Play YouTube videos with custom start/end times and looping.</p>
        </div>
      </div>
    </div>
  )
}
