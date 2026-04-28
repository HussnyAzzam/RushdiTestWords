import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home({ onOpenCategory, onOpenIP, onOpenUnits, onOpenYouTube, onOpenTextShare }) {
  const navigate = useNavigate()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const pin = params.get('textshare')
    if (pin) {
      // Wipe the ?textshare= from the browser history BEFORE navigating
      // so that pressing Back / clicking logo returns to clean "/"
      window.history.replaceState({}, '', '/')
      navigate('/textshare?textshare=' + encodeURIComponent(pin), { replace: true })
    }
  }, [navigate])

  return (
    <div className="home-container">
      <h1>🛠️ Super Tools</h1>
      <p>Select a tool to begin</p>
      
      <div className="tools-grid">
        <button className="tool-button" onClick={onOpenYouTube}>
          <div className="tool-icon">▶️</div>
          <div className="tool-name">YouTube Player</div>
          <div className="tool-desc">Video with custom looping</div>
        </button>

        <button className="tool-button" onClick={onOpenTextShare}>
          <div className="tool-icon">📤</div>
          <div className="tool-name">Text Share</div>
          <div className="tool-desc">Secure encrypted sharing</div>
        </button>

        <button className="tool-button" onClick={onOpenCategory}>
          <div className="tool-icon">📝</div>
          <div className="tool-name">Text Tools</div>
          <div className="tool-desc">Search words by letters</div>
        </button>

        <button className="tool-button" onClick={onOpenIP}>
          <div className="tool-icon">🌐</div>
          <div className="tool-name">Find IP</div>
          <div className="tool-desc">Get IP information</div>
        </button>

        <button className="tool-button" onClick={onOpenUnits}>
          <div className="tool-icon">📏</div>
          <div className="tool-name">Unit Converter</div>
          <div className="tool-desc">Convert units easily</div>
        </button>
      </div>
    </div>
  )
}
