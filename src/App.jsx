import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import TextCategory from './components/TextCategory'
import FindWords from './components/FindWords'
import FindIP from './components/FindIP'
import UnitsConverter from './components/UnitsConverter'
import YouTubePlayer from './components/YouTubePlayer'
import TextShare from './components/TextShare'
import './styles/App.css'

function AppRoutes() {
  const [theme, setTheme] = React.useState(() => {
    return localStorage.getItem('theme') || 'light'
  })

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

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
          <Route path="/" element={<Home onOpenCategory={() => navigate('/text')} onOpenIP={() => navigate('/ip')} onOpenUnits={() => navigate('/units')} onOpenYouTube={() => navigate('/youtube')} onOpenTextShare={() => navigate('/textshare')} />} />
          <Route path="/text" element={<TextCategory onFind={() => navigate('/find')} onBack={() => navigate('/')} />} />
          <Route path="/find" element={<FindWords onBack={() => navigate('/text')} />} />
          <Route path="/ip" element={<FindIP onBack={() => navigate('/')} />} />
          <Route path="/units" element={<UnitsConverter onBack={() => navigate('/')} />} />
          <Route path="/youtube" element={<YouTubePlayer onBack={() => navigate('/')} />} />
          <Route path="/textshare" element={<TextShare onBack={() => navigate('/')} />} />
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
