import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Top-level render-error guard: one crashing component shows a recoverable
 * error card instead of blanking the whole app to a white screen.
 */
export default class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Unhandled render error:', error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div
        style={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '14px',
          background: 'var(--color-bg-home)',
          padding: '24px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(239, 68, 68, 0.1)',
          }}
        >
          <AlertTriangle size={28} style={{ color: 'var(--color-danger)' }} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--color-text-strong)', margin: 0 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted-light)', maxWidth: '380px', lineHeight: 1.5, margin: 0 }}>
          An unexpected error interrupted this page. Your data is safe — reloading usually fixes it.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '999px',
            border: 'none',
            background: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <RotateCcw size={15} />
          Reload
        </button>
      </div>
    );
  }
}
