'use client';

import Link from 'next/link';
import { Home, AlertCircle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full text-center space-y-8 bg-slate-900 border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex justify-center">
          <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border border-slate-700 animate-pulse">
            <AlertCircle size={32} className="text-emerald-400" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
            404
          </h1>
          <h2 className="text-xl font-bold text-slate-200">
            Page Not Found
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed">
            The page you are looking for does not exist or has been moved. Return to the FreshBox Dashboard to manage your smart cold-chain container system.
          </p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 justify-center w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-blue-600 hover:from-emerald-400 hover:to-blue-500 text-white font-medium rounded-2xl transition-all duration-200 shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-[0.98]"
          >
            <Home size={18} />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
