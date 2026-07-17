import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Application render failed', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-error" role="alert">
          <h1>Не удалось загрузить страницу</h1>
          <p>Обновите страницу или вернитесь на главную.</p>
          <a className="btn-gold" href="/">На главную</a>
        </section>
      );
    }

    return this.props.children;
  }
}
