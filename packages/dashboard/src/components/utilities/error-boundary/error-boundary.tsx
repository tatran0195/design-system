'use client';

import { Button, Heading, Text } from '@cms/ui';
import { Component, type ErrorInfo, type ReactNode } from 'react';
export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((props: { error: Error; reset: () => void }) => ReactNode);
  onError?: (error: Error, info: ErrorInfo) => void;
  resetKeys?: readonly unknown[];
}
export class ErrorBoundary extends Component<ErrorBoundaryProps, { error: Error | null }> {
  override state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override componentDidCatch(error: Error, info: ErrorInfo) {
    this.props.onError?.(error, info);
  }
  override componentDidUpdate(previous: ErrorBoundaryProps) {
    if (
      this.state.error &&
      (previous.resetKeys?.length !== this.props.resetKeys?.length ||
        this.props.resetKeys?.some((key, index) => !Object.is(key, previous.resetKeys?.[index])))
    )
      this.reset();
  }
  reset = () => this.setState({ error: null });
  override render() {
    if (!this.state.error) return this.props.children;
    if (typeof this.props.fallback === 'function') return this.props.fallback({ error: this.state.error, reset: this.reset });
    return (
      this.props.fallback ?? (
        <div role="alert" className="flex flex-col items-center gap-3 p-8">
          <Heading level="h2">Something went wrong</Heading>
          <Text className="text-ui-fg-subtle">Please try again.</Text>
          <Button variant="secondary" onClick={this.reset}>
            Try again
          </Button>
        </div>
      )
    );
  }
}
export const DashboardErrorBoundary = ErrorBoundary;
