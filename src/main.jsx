import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SecurityGate from './SecurityGate.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <SecurityGate>
      <App />
    </SecurityGate>
  </StrictMode>,
)