'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Box,
  CalendarDays,
  Leaf,
  Activity,
  Calculator,
  FileBarChart,
  TrendingUp,
  Menu,
  X,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'box-rental', label: 'Box Rental', icon: Box },
    { id: 'recommendation-cost', label: 'AI Recommendation', icon: Sparkles },
    { id: 'products', label: 'Product Register', icon: Leaf },
    { id: 'monitoring', label: 'Real-Time IoT', icon: Activity },
    { id: 'reports', label: 'Cold Chain Report', icon: FileBarChart },
    { id: 'impact', label: 'Sustainability', icon: TrendingUp },
  ];

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0F172A] text-slate-100 border-r border-slate-800 h-screen sticky top-0 shrink-0">
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3">
          <div className="bg-emerald-500 text-white w-8 h-8 rounded-lg flex items-center justify-center">
            <Box size={18} className="stroke-[2.5]" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg tracking-tight text-white leading-tight">
              FreshBox <span className="text-emerald-400">AI</span>
            </h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 font-semibold'
                    : 'text-slate-400 hover:text-white transition-colors'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-emerald-400 stroke-[2]' : 'text-slate-400 group-hover:text-white'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/40 space-y-4">
          <div className="bg-slate-800 rounded-xl p-4">
            <div className="text-xs text-slate-400 mb-1 font-semibold uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-emerald-400" />
              <span>AI Recommendations</span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed">
              Gemini Suggestion: Increase RH for Box #102 (Seafood) to 94%.
            </p>
          </div>

          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-emerald-400">
              FB
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">IndoFresh Logistics</p>
              <p className="text-[10px] text-emerald-400 font-mono">Premium Partner</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 text-slate-900 p-1.5 rounded-lg">
            <Box size={18} className="stroke-[2.5]" />
          </div>
          <h1 className="font-sans font-bold text-base tracking-tight text-white">
            FreshBox <span className="text-emerald-400">AI</span>
          </h1>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 text-slate-300 hover:text-white focus:outline-none"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-slate-950/60 z-40 backdrop-blur-sm"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Navigation Drawer */}
      <div
        className={`md:hidden fixed top-[61px] left-0 w-64 bg-slate-900 h-[calc(100vh-61px)] z-50 border-r border-slate-800 shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Bottom Navigation Bar (Alternative Quick Nav) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 py-2 px-4 flex justify-around items-center z-40 shadow-[0_-4px_12px_rgba(0,0,0,0.15)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1 transition-all ${
                isActive ? 'text-emerald-400 scale-105' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon size={18} />
              <span className="text-[9px] font-medium leading-none">{item.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
