import React from "react";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Platform error:", error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7F5] p-8">
          <div className="max-w-md text-center">
            <div className="w-12 h-12 bg-[#003865] rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-lg">!</span>
            </div>
            <h1 className="text-xl font-bold text-[#003865] mb-2" style={{ fontFamily: "'Source Serif 4', Georgia, serif" }}>
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              The platform encountered an error. Your data is safe in the cloud.
            </p>
            <p className="text-xs text-gray-400 mb-6 font-mono bg-gray-100 p-2 rounded">
              {this.state.error?.message}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="px-4 py-2 bg-[#003865] text-white rounded-lg text-sm font-medium hover:bg-[#001F3A] transition-colors"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
