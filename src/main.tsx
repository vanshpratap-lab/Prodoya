import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import PublicProfile from './components/PublicProfile.tsx'
import { AuthProvider } from './lib/AuthContext'

const publicProfileMatch = window.location.pathname.match(/^\/u\/([^/]+)\/?$/)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {publicProfileMatch ? (
      <PublicProfile username={publicProfileMatch[1]} />
    ) : (
      <AuthProvider>
        <App />
      </AuthProvider>
    )}
  </StrictMode>,
)
