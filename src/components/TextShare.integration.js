// TextShare Integration Helper
// Use this to add TextShare to your Home page / main navigation

import React from 'react'
import TextShare from './TextShare'

// Button component for adding to tools list
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

// Tool configuration object
export const textShareTool = {
  id: 'textshare',
  name: 'Text Share',
  icon: '📤',
  description: 'Securely share encrypted text with PIN/QR codes',
  category: 'communication',
  component: TextShare,
  priority: 5
}

// Lazy loading component
export const TextShareLazy = React.lazy(() => import('./TextShare'))

export const TextShareWithFallback = ({ onBack }) => (
  <React.Suspense fallback={<div>Loading Text Share...</div>}>
    <TextShareLazy onBack={onBack} />
  </React.Suspense>
)

export default textShareTool
