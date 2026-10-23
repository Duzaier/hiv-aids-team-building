'use client';

import React, { useState } from 'react';
import { Persona } from '@/types';
import { MOCK_PERSONAS } from '@/data/initialData';
import { ChevronDown, RotateCcw } from 'lucide-react';

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
    <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800 py-1.5 px-3 sm:px-6 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 text-xs">
        {/* Left: Indicator & Dropdown for small/medium screens */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            Demo
          </span>

          {/* Dropdown for < xl screens */}
          <div className="relative xl:hidden">
            <button
              onClick={() => setIsOpenMobile(!isOpenMobile)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 text-xs font-semibold truncate max-w-[200px] sm:max-w-[260px]"
            >
              <span className="truncate">{currentPersona.label}</span>
              <ChevronDown className="w-3.5 h-3.5 shrink-0 text-slate-400" />
            </button>

            {isOpenMobile && (
              <div className="absolute top-full left-0 mt-1 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-1 z-50">
                {MOCK_PERSONAS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      onSelectPersona(p);
                      setIsOpenMobile(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      p.id === currentPersona.id
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate block font-medium">{p.label}</span>
                    <span className="text-[10px] text-slate-400 truncate block">{p.description}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Desktop Persona Text Tabs for >= xl screens */}
        <div className="hidden xl:flex items-center gap-1">
          {MOCK_PERSONAS.map((p) => {
            const isSelected = p.id === currentPersona.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPersona(p)}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white font-semibold shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        {/* Right: Quick actions */}
        <div className="flex items-center gap-2 shrink-0">
          {occupiedCount < 6 ? (
            <button
              onClick={onFillAllSlots}
              className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors text-[11px] font-medium"
            >
              Thử đầy 6 slot
            </button>
          ) : (
            <span className="px-2 py-0.5 rounded text-slate-400 text-[11px]">
              Đã đủ 6/6
            </span>
          )}

          <button
            onClick={onResetData}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            title="Đặt lại dữ liệu"
            aria-label="Đặt lại dữ liệu"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
