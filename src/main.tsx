import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SiteProvider } from './context/SiteProvider'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SiteProvider>
      <App />
    </SiteProvider>
  </StrictMode>,
)
