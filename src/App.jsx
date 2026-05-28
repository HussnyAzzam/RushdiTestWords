import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import TextCategory from './components/TextCategory'
import FindWords from './components/FindWords'
import FindIP from './components/FindIP'
import UnitsConverter from './components/UnitsConverter'
import YouTubePlayer from './components/YouTubePlayer'
import TextShareNew from './components/TextShareNew'
import DataConverter from './components/DataConverter'
import QRCodeGenerator from './components/QRCodeGenerator'
import InvoiceBuilder from './components/InvoiceBuilder'
import './styles/App.css'

function AppRoutes() {
  const [theme, setTheme] = React.useState(() => {
    // Check if user has a saved theme preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme) {
      return savedTheme
    }
    
    // Otherwise, detect system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    
    return 'light'
  })

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  // Listen for system theme changes
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleChange = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem('theme')
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }

    // Modern browsers support addEventListener
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    } else if (mediaQuery.addListener) {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange)
      return () => mediaQuery.removeListener(handleChange)
    }
  }, [])

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }

  const navigate = useNavigate()
  return (
    <div className="app">
      <header className="header">
        <div
          className="logo"
          role="button"
          tabIndex={0}
          onClick={() => navigate('/')}
          onKeyDown={(e) => { if (e.key === 'Enter') navigate('/'); }}
          aria-label="Go to home"
        >
          <div className="logo-icon">🛠️</div>
          <div className="logo-text">The Ultimate Tools Hub</div>
        </div>
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title="Toggle dark/light mode"
        >
          {theme === 'light' ? '🌙' : '☀️'} {theme === 'light' ? 'Dark' : 'Light'}
        </button>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home onOpenCategory={() => navigate('/text')} onOpenIP={() => navigate('/ip')} onOpenUnits={() => navigate('/units')} onOpenYouTube={() => navigate('/youtube')} onOpenTextShare={() => navigate('/textshare')} onOpenDataConverter={() => navigate('/data-converter')} onOpenQRCodeGenerator={() => navigate('/qrcode')} onOpenInvoice={() => navigate('/invoice')} />} />
          <Route path="/text" element={<TextCategory onFind={() => navigate('/find')} onBack={() => navigate('/')} />} />
          <Route path="/find" element={<FindWords onBack={() => navigate('/text')} />} />
          <Route path="/ip" element={<FindIP onBack={() => navigate('/')} />} />
          <Route path="/units" element={<UnitsConverter onBack={() => navigate('/')} />} />
          <Route path="/youtube" element={<YouTubePlayer onBack={() => navigate('/')} />} />
          <Route path="/textshare" element={<TextShareNew onBack={() => navigate('/')} />} />
          <Route path="/data-converter" element={<DataConverter onBack={() => navigate('/')} />} />
          <Route path="/qrcode" element={<QRCodeGenerator onBack={() => navigate('/')} />} />
          <Route path="/invoice" element={<InvoiceBuilder />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppRoutes />
  )
}
