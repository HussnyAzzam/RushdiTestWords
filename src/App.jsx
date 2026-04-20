import React, { useState } from 'react'
import Home from './components/Home'
import TextCategory from './components/TextCategory'
import FindWords from './components/FindWords'

export default function App() {
  const [view, setView] = useState('home')

  const navigate = (to) => setView(to)

  return (
    <div className="app">
      <header className="header">
        <h1>The Ultimate Tools Hub</h1>
      </header>
      <main className="main">
        {view === 'home' && <Home onOpenCategory={() => navigate('text')} />}
        {view === 'text' && <TextCategory onFind={() => navigate('find')} onBack={() => navigate('home')} />}
        {view === 'find' && <FindWords onBack={() => navigate('text')} />}
      </main>
    </div>
  )
}
