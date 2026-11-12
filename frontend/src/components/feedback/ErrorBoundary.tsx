import { Button, Result } from 'antd';
import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';

interface State { error: Error | null }

/** Komponent xatosi butun ilovani buzmasligi uçun */
export class ErrorBoundary extends Component<{ children: ReactNode; compact?: boolean; resetKey?: string }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  /** resetKey özgarsa xato holati tozalanadi (boundary qayta mount qilinmaydi — Suspense eski sahifani uşlab turadi) */
  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI xatosi:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <Result
        status="error"
        title={i18n.t('common.errorTitle')}
        subTitle={this.props.compact ? undefined : i18n.t('common.errorHint')}
        extra={<Button onClick={() => this.setState({ error: null })}>{i18n.t('common.retry')}</Button>}
      />
    );
  }
}
