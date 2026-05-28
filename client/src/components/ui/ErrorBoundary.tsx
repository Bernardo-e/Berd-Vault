"use client";
import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { APP_NAME } from "@/lib/branding";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen mesh-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-card p-10 max-w-md w-full relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500/50" />
            
            <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="text-red-500" size={40} />
            </div>

            <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">System Disruption</h1>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              We've encountered an unexpected runtime error. The interface has been halted to prevent data corruption.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="btn-brand w-full justify-center gap-2 h-12"
            >
              <RotateCcw size={18} />
              Re-initialize Interface
            </button>

            {process.env.NODE_ENV === "development" && (
              <div className="mt-8 p-4 bg-black/40 rounded-xl text-left border border-white/5 overflow-auto max-h-40">
                <p className="text-[10px] font-mono text-red-400 whitespace-pre">
                  {this.state.error?.stack}
                </p>
              </div>
            )}
          </div>
          
          <p className="mt-6 text-[10px] text-gray-600 uppercase tracking-widest">
            {APP_NAME} Security Protocol v4.0
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
