import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, info) {
        console.error('ErrorBoundary caught:', error, info);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '60vh',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <div style={{
                        fontSize: '4rem',
                        marginBottom: '1rem'
                    }}>⚠️</div>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 800,
                        color: 'var(--text-main)',
                        marginBottom: '0.75rem'
                    }}>
                        Something went wrong
                    </h2>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                        {this.state.error?.message || 'An unexpected error occurred.'}
                    </p>
                    <button
                        onClick={() => {
                            this.setState({ hasError: false, error: null });
                            window.location.href = '/';
                        }}
                        style={{
                            padding: '0.75rem 2rem',
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                    >
                        Go to Home
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
