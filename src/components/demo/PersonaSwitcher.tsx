'use client';

import React from 'react';
import { Persona } from '@/types';
import { MOCK_PERSONAS } from '@/data/initialData';
import { UserCheck, Shield, Sparkles, RotateCcw, Flame } from 'lucide-react';

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
  return (
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-red-500/20 py-2.5 px-4 shadow-xl">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Left: Demo Mode Announcement */}
        <div className="flex items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-bold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3 h-3 text-red-400 animate-pulse" />
            Gate B â€” UI Demo
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Chá»n vai trÃ² thá»­ nghiá»‡m Ä‘á»ƒ kiá»ƒm tra luá»“ng tráº£i nghiá»‡m:
          </span>
        </div>

        {/* Center: Persona Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap justify-center">
          {MOCK_PERSONAS.map((p) => {
            const isSelected = p.id === currentPersona.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30 ring-2 ring-red-400/50'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {p.role === 'ADMIN' ? (
                  <Shield className="w-3.5 h-3.5 text-purple-400" />
                ) : p.role === 'OWNER' ? (
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right: Quick State Actions */}
        <div className="flex items-center gap-2">
          {occupiedCount < 6 ? (
            <button
              onClick={onFillAllSlots}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-red-950/60 text-slate-300 hover:text-red-300 border border-slate-800 transition-colors"
              title="Láº­p tá»©c Ä‘iá»n kÃ­n 6 Ä‘á»™i Ä‘á»ƒ thá»­ nghiá»‡m tráº¡ng thÃ¡i Háº¿t Chá»— (Full Capacity)"
            >
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Thá»­ Äáº§y 6 Slot</span>
            </button>
          ) : (
            <span className="px-2.5 py-1 rounded-lg bg-orange-950/70 border border-orange-500/30 text-orange-300 font-semibold">
              ÄÃ£ Ä‘áº§y 6/6
            </span>
          )}

          <button
            onClick={onResetData}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
            title="KhÃ´i phá»¥c tráº¡ng thÃ¡i ban Ä‘áº§u (4 Ä‘á»™i, 2 slot trá»‘ng)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
