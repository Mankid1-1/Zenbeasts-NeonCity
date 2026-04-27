import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[ErrorBoundary]', error.message, info.componentStack);
  }

  reset = (): void => {
    this.setState({ error: null });
  };

  render(): React.ReactNode {
    if (!this.state.error) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        role="alert"
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          background: '#0a0a14',
          color: '#fff',
          fontFamily: 'monospace',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>
          // SYSTEM_FAULT
        </h1>
        <p style={{ opacity: 0.7, maxWidth: 480, textAlign: 'center', marginBottom: '1.5rem' }}>
          Something glitched in the neon grid. The error has been logged to the
          console.
        </p>
        <pre
          style={{
            background: '#1a1a2e',
            border: '1px solid #2a2a44',
            padding: '0.75rem 1rem',
            borderRadius: 4,
            maxWidth: '90vw',
            overflowX: 'auto',
            fontSize: '0.85rem',
            opacity: 0.8,
          }}
        >
          {this.state.error.message}
        </pre>
        <button
          onClick={this.reset}
          style={{
            marginTop: '1.5rem',
            padding: '0.5rem 1.25rem',
            background: '#22d3ee',
            color: '#0a0a14',
            border: 'none',
            borderRadius: 4,
            fontFamily: 'inherit',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          retry
        </button>
      </div>
    );
  }
}
