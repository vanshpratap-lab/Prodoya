import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { Loader2 } from 'lucide-react'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary.tsx'
import { AuthProvider } from './lib/AuthContext'

// The public profile page is its own entry surface — keep it out of the main bundle.
const PublicProfile = lazy(() => import('./components/PublicProfile.tsx'))

const publicProfileMatch = window.location.pathname.match(/^\/u\/([^/]+)\/?$/)

const pageLoader = (
  <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg-home)' }}>
    <Loader2 size={28} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
  </div>
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      {publicProfileMatch ? (
        <Suspense fallback={pageLoader}>
          <PublicProfile username={publicProfileMatch[1]} />
        </Suspense>
      ) : (
        <AuthProvider>
          <App />
        </AuthProvider>
      )}
    </ErrorBoundary>
  </StrictMode>,
)
