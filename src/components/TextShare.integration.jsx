// TextShare Integration Helper
// Use this file to add TextShare to your Home page / main navigation

import React from 'react'
import TextShare from './TextShare'

/**
 * Example 1: Add to tool buttons
 * Place this in your Home.jsx or tools list:
 */
export const TextShareToolButton = ({ onClick }) => (
  <button
    className="tool-button"
    onClick={onClick}
    title="Share encrypted text via PIN or QR code"
  >
    <span className="tool-icon">📤</span>
    <span className="tool-name">Text Share</span>
    <span className="tool-desc">Secure message sharing</span>
  </button>
)

/**
 * Example 2: Add to tools array (if using array-based navigation)
 */
export const textShareTool = {
  id: 'textshare',
  name: 'Text Share',
  icon: '📤',
  description: 'Securely share encrypted text with PIN/QR codes',
  category: 'communication',
  component: TextShare,
  priority: 5
}

/**
 * Example 3: Complete Home component integration
 * This shows how to add TextShare alongside your existing tools
 */
export const HomePageExample = ({ tools = [] }) => {
  const [activeTool, setActiveTool] = React.useState(null)

  // Add TextShare to tools
  const allTools = [...tools, textShareTool]

  if (activeTool) {
    const ToolComponent = allTools.find(t => t.id === activeTool)?.component
    if (ToolComponent) {
      return (
        <ToolComponent
          onBack={() => setActiveTool(null)}
        />
      )
    }
  }

  return (
    <div className="home-page">
      <h1>🛠️ Super Tools</h1>
      <div className="tools-grid">
        {allTools.map(tool => (
          <button
            key={tool.id}
            className={`tool-button ${tool.id === activeTool ? 'active' : ''}`}
            onClick={() => setActiveTool(tool.id)}
          >
            <span className="tool-icon">{tool.icon}</span>
            <span className="tool-name">{tool.name}</span>
            <span className="tool-desc">{tool.description}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

/**
 * Example 4: Router integration (if using React Router)
 */
export const routerConfig = [
  // ... other routes
  {
    path: '/tools/textshare',
    element: <TextShare onBack={() => window.history.back()} />,
    label: 'Text Share'
  }
]

/**
 * Example 5: Lazy loading TextShare
 */
export const TextShareLazy = React.lazy(() => import('./TextShare'))

export const TextShareWithFallback = ({ onBack }) => (
  <React.Suspense fallback={<div>Loading Text Share...</div>}>
    <TextShareLazy onBack={onBack} />
  </React.Suspense>
)

/**
 * Quick Copy-Paste Integration
 * 
 * If you're using a simple state-based approach:
 * 
 * In your Home/App.jsx:
 * 
 * import { TextShareToolButton, textShareTool } from './components/TextShare.integration'
 * import TextShare from './components/TextShare'
 * 
 * export default function Home() {
 *   const [currentTool, setCurrentTool] = useState(null)
 * 
 *   return (
 *     <>
 *       {currentTool === 'textshare' && (
 *         <TextShare onBack={() => setCurrentTool(null)} />
 *       )}
 *       
 *       {!currentTool && (
 *         <div className="tools-list">
 *           <TextShareToolButton onClick={() => setCurrentTool('textshare')} />
 *           {/* ...other tools... */}
 *         </div>
 *       )}
 *     </>
 *   )
 * }
 */
