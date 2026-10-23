'use client';

import React, { useState } from 'react';
import { Persona } from '@/types';
import { MOCK_PERSONAS } from '@/data/initialData';
import { UserCheck, Shield, Sparkles, RotateCcw, Flame, ChevronDown } from 'lucide-react';

interface PersonaSwitcherProps {
  currentPersona: Persona;
  onSelectPersona: (p: Persona) => void;
  onFillAllSlots: () => void;
  onResetData: () => void;
  occupiedCount: number;
}

export const PersonaSwitcher: React.FC<PersonaSwitcherProps> = ({
  currentPersona,
  onSelectPersona,
  onFillAllSlots,
  onResetData,
  occupiedCount
}) => {
  const [isOpenMobile, setIsOpenMobile] = useState(false);

  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-red-500/20 py-2 px-3 sm:px-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
        {/* Left: Current Persona Indicator with Mobile Dropdown Toggle */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider text-[10px] shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-red-400 animate-pulse" />
            <span className="hidden sm:inline">UI Demo</span>
          </span>

          {/* Mobile view dropdown button */}
          <div className="relative md:hidden">
            <button
              onClick={() => setIsOpenMobile(!isOpenMobile)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold truncate max-w-[200px]"
            >
              <span className="truncate">{currentPersona.label}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            </button>

            {/* Mobile dropdown menu */}
            {isOpenMobile && (
              <div className="absolute top-full left-0 mt-1 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95">
                {MOCK_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center gap-2 transition-colors ${
                      p.id === currentPersona.id
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {p.role === 'ADMIN' ? (
                      <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                    ) : p.role === 'OWNER' ? (
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    ) : (
                      <UserCheck className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{p.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <span className="text-slate-400 hidden lg:inline truncate">
            Đổi vai trò để thử nghiệm:
          </span>
        </div>

        {/* Center: Desktop Persona Buttons */}
        <div className="hidden md:flex items-center gap-1.5 flex-wrap justify-center">
          {MOCK_PERSONAS.map((p) => {
            const isSelected = p.id === currentPersona.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p)}
                className={`inline-flex items-center gap-1.5 px-2.5 lg:px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30 ring-2 ring-red-400/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {p.role === 'ADMIN' ? (
                  <Shield className="w-3 h-3 text-purple-400" />
                ) : p.role === 'OWNER' ? (
                  <Sparkles className="w-3 h-3 text-amber-400" />
                ) : (
                  <UserCheck className="w-3 h-3 text-slate-400" />
                )}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick State Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {occupiedCount < 6 ? (
            <button
              onClick={onFillAllSlots}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-800 transition-colors text-[11px]"
              title="Thử trạng thái đầy 6 slot"
            >
              <Flame className="w-3 h-3 text-orange-400 shrink-0" />
              <span className="hidden sm:inline">Thử Đầy 6 Slot</span>
              <span className="sm:hidden">Đầy 6</span>
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-orange-950/70 border border-orange-500/30 text-orange-300 font-semibold text-[11px]">
              Đủ 6/6
            </span>
          )}

          <button
            onClick={onResetData}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="Khôi phục trạng thái ban đầu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
