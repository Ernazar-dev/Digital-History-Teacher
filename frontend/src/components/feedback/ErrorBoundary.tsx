import { Button, Result } from 'antd';
import { Component, type ErrorInfo, type ReactNode } from 'react';

interface State { error: Error | null }

/** Komponent xatosi butun ilovani buzmasligi uchun */
export class ErrorBoundary extends Component<{ children: ReactNode; compact?: boolean }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI xatosi:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Result
        status="error"
        title="Sahifani ko‘rsatishda xato yuz berdi"
        subTitle={this.props.compact ? undefined : 'Sahifani yangilab ko‘ring. Muammo takrorlansa, administratorga murojaat qiling.'}
        extra={<Button onClick={() => this.setState({ error: null })}>Qayta urinish</Button>}
      />
    );
  }
}
