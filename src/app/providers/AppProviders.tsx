import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { WeddingConfigProvider } from '../../context/WeddingConfigContext';
import { LanguageProvider } from '../../context/LanguageContext';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FFF4F6] text-[#33252B] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full border border-pink-100 space-y-4">
            <h2 className="font-serif font-bold text-xl text-[#702C43]">Rahul weds Radhika</h2>
            <p className="text-xs text-[#765F68]">
              A minor display issue occurred. Please refresh the page to reload the wedding celebration.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 rounded-full bg-[#702C43] text-white text-xs font-semibold shadow-md hover:bg-[#5C2336] transition cursor-pointer"
            >
              Reload Celebration
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ErrorBoundary>
      <WeddingConfigProvider>
        <LanguageProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </LanguageProvider>
      </WeddingConfigProvider>
    </ErrorBoundary>
  );
};
