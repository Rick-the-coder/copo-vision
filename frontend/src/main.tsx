import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initMockServer } from './services/mockServer'

// Initialize mock server if environment variable is set or by default in development for missing APIs
if (import.meta.env.MODE === 'development') {
  initMockServer();
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
