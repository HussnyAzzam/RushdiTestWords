import React from 'react'

export default function Home({ onOpenCategory }) {
  return (
    <div className="home">
      <h2>Categories</h2>
      <div className="category-card" onClick={onOpenCategory} role="button" tabIndex={0} onKeyDown={(e)=>{ if(e.key==='Enter') onOpenCategory() }}>
        <h3>Text</h3>
        <p>Tools to work with text: search, transform and more.</p>
      </div>
    </div>
  )
}
