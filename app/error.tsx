'use client';

import { useEffect } from 'react';
import { RotateCcw, AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700">
            <AlertTriangle size={32} className="text-amber-500 animate-pulse" />
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xl font-bold text-slate-200">
            Something Went Wrong
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            An unexpected error occurred in the FreshBox environment. Our monitoring systems have logged this incident.
          </p>
          {error.message && (
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-rose-400 text-left overflow-auto max-h-24">
              {error.message}
            </div>
          )}
        </div>

        <div className="pt-4">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 justify-center w-full px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-medium rounded-2xl transition-all duration-200 border border-slate-700 active:scale-[0.98]"
          >
            <RotateCcw size={18} />
            <span>Retry Operation</span>
          </button>
        </div>
      </div>
    </div>
  );
}
