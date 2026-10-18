import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F7F8F5] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#14201A] mb-2 font-urdu">کچھ غلط ہو گیا (Something went wrong)</h2>
          <p className="text-sm text-[#6B7A72] max-w-sm mb-6">
            We encountered an unexpected error. Please try reloading the application.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="md"
            className="max-w-xs"
          >
            دوبارہ لوڈ کریں (Reload App)
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
