import React from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Home from './components/Home'
import TextCategory from './components/TextCategory'
import FindWords from './components/FindWords'
import FindIP from './components/FindIP'
import UnitsConverter from './components/UnitsConverter'
import YouTubePlayer from './components/YouTubePlayer'

function AppRoutes() {
  const navigate = useNavigate()
  return (
    <div className="app">
      <header className="header">
        <h1>The Ultimate Tools Hub</h1>
      </header>
      <main className="main">
        <Routes>
          <Route path="/" element={<Home onOpenCategory={() => navigate('/text')} onOpenIP={() => navigate('/ip')} onOpenUnits={() => navigate('/units')} onOpenYouTube={() => navigate('/youtube')} />} />
          <Route path="/text" element={<TextCategory onFind={() => navigate('/find')} onBack={() => navigate('/')} />} />
          <Route path="/find" element={<FindWords onBack={() => navigate('/text')} />} />
          <Route path="/ip" element={<FindIP onBack={() => navigate('/')} />} />
          <Route path="/units" element={<UnitsConverter onBack={() => navigate('/')} />} />
          <Route path="/youtube" element={<YouTubePlayer onBack={() => navigate('/')} />} />
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
