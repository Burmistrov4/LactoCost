import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            background: '#f7faf7',
            color: '#14221e',
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            textAlign: 'center',
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              background: '#ffffff',
              borderRadius: '16px',
              padding: '32px 24px',
              boxShadow: '0 12px 35px rgba(18, 32, 27, 0.08)',
              border: '1px solid #e3ebe4',
            }}
          >
            <div style={{ fontSize: '42px', marginBottom: '12px' }}>🥛</div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px 0', color: '#14221e' }}>
              Flor Amarillo · Taller Artesanal
            </h2>
            <p style={{ fontSize: '14px', color: '#5a6d64', margin: '0 0 20px 0', lineHeight: 1.5 }}>
              Ocurrió un detalle al cargar la interfaz. Tus datos e inventario guardados están seguros.
            </p>
            <button
              onClick={this.handleReset}
              style={{
                background: '#26785c',
                color: '#ffffff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer',
              }}
            >
              Recargar Aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
