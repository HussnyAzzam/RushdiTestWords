# 🔧 TextShare Integration - Complete Home.jsx Template

Copy and paste this entire code into your `src/components/Home.jsx` file:

```jsx
import React, { useState, useEffect } from 'react'
import YouTubePlayer from './YouTubePlayer'
import TextShare from './TextShare'
// Import other tools here
// import WordSearch from './WordSearch'
// import UnitConverter from './UnitConverter'
// import FindIP from './FindIP'
// etc...

export default function Home() {
  const [activeTool, setActiveTool] = useState(null)

  // Auto-load TextShare if PIN is in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const textSharePin = params.get('textshare')
    if (textSharePin) {
      setActiveTool('textshare')
    }
  }, [])

  // Show tools menu (always visible with current tool)
  return (
    <div className="home-container">
      <h1>🛠️ Super Tools</h1>
      <p>Select a tool to begin</p>
      
      <div className="tools-grid">
        
        {/* YouTube Player Tool */}
        <button 
          className="tool-button" 
          onClick={() => setActiveTool('youtube')}
        >
          <div className="tool-icon">▶️</div>
          <div className="tool-name">YouTube Player</div>
          <div className="tool-desc">Video with custom looping</div>
        </button>

        {/* TextShare Tool */}
        <button 
          className="tool-button" 
          onClick={() => setActiveTool('textshare')}
        >
          <div className="tool-icon">📤</div>
          <div className="tool-name">Text Share</div>
          <div className="tool-desc">Secure encrypted sharing</div>
        </button>

        {/* Word Search Tool - Uncomment when available */}
        {/* <button 
          className="tool-button" 
          onClick={() => setActiveTool('wordsearch')}
        >
          <div className="tool-icon">🔤</div>
          <div className="tool-name">Word Search</div>
          <div className="tool-desc">Search words by letters</div>
        </button> */}

        {/* Unit Converter Tool - Uncomment when available */}
        {/* <button 
          className="tool-button" 
          onClick={() => setActiveTool('unitconverter')}
        >
          <div className="tool-icon">📏</div>
          <div className="tool-name">Unit Converter</div>
          <div className="tool-desc">Convert units easily</div>
        </button> */}

        {/* Find IP Tool - Uncomment when available */}
        {/* <button 
          className="tool-button" 
          onClick={() => setActiveTool('findip')}
        >
          <div className="tool-icon">🌐</div>
          <div className="tool-name">Find IP</div>
          <div className="tool-desc">Get IP information</div>
        </button> */}

        {/* Add more tools here in the future */}
        
      </div>

      {/* Show active tool below */}
      {activeTool === 'youtube' && (
        <div className="active-tool-container">
          <YouTubePlayer onBack={() => setActiveTool(null)} />
        </div>
      )}

      {activeTool === 'textshare' && (
        <div className="active-tool-container">
          <TextShare onBack={() => setActiveTool(null)} />
        </div>
      )}

      {/* Add more tool renders here */}
      {/* {activeTool === 'wordsearch' && (
        <div className="active-tool-container">
          <WordSearch onBack={() => setActiveTool(null)} />
        </div>
      )} */}

      {/* {activeTool === 'unitconverter' && (
        <div className="active-tool-container">
          <UnitConverter onBack={() => setActiveTool(null)} />
        </div>
      )} */}

      {/* {activeTool === 'findip' && (
        <div className="active-tool-container">
          <FindIP onBack={() => setActiveTool(null)} />
        </div>
      )} */}
    </div>
  )
}
```

## ✅ That's it! 

Once you paste this code, all your tools will appear in the tools menu automatically.

## 🚀 How to Add Other Tools:

### Step 1: Import the component
```jsx
import WordSearch from './WordSearch'
import UnitConverter from './UnitConverter'
import FindIP from './FindIP'
```

### Step 2: Add button in tools-grid
```jsx
<button 
  className="tool-button" 
  onClick={() => setActiveTool('wordsearch')}
>
  <div className="tool-icon">🔤</div>
  <div className="tool-name">Word Search</div>
  <div className="tool-desc">Search words by letters</div>
</button>
```

### Step 3: Add conditional render
```jsx
{activeTool === 'wordsearch' && (
  <div className="active-tool-container">
    <WordSearch onBack={() => setActiveTool(null)} />
  </div>
)}
```

## 📝 Available Tools to Add:

The template already has commented sections for:
- ✅ **Word Search** - Search for words by letters
- ✅ **Unit Converter** - Convert between units (length, weight, etc.)
- ✅ **Find IP** - Get IP information
- ✅ **And more...**

Just uncomment the sections for the tools you want to enable!

## ✨ The key additions are:

```jsx
// 1. Import at the top
import TextShare from './TextShare'

// 2. Add button in tools-grid
<button onClick={() => setActiveTool('textshare')}>
  📤 Text Share
</button>

// 3. Add conditional render
if (activeTool === 'textshare') {
  return <TextShare onBack={() => setActiveTool(null)} />
}
```

That's all you need! 🚀

