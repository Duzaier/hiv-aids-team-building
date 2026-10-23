'use client';

import React from 'react';
import { User, Role } from '@/types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  currentRole: Role;
  occupiedCount: number;
  totalSlots: number;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenRegisterHero: () => void;
  onOpenMyTeamEdit: () => void;
  hasTeam: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  currentRole,
  occupiedCount,
  totalSlots,
  onLoginClick,
  onLogoutClick,
  onOpenRegisterHero,
  onOpenMyTeamEdit,
  hasTeam
}) => {
  const isFull = occupiedCount >= totalSlots;
  const availableCount = Math.max(0, totalSlots - occupiedCount);

  return (
    <header className="relative pt-4 pb-5 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/40">
      <div className="max-w-7xl mx-auto">
        {/* Top Navbar: Brand & Auth */}
        <div className="flex items-center justify-between gap-3 mb-4">
          {/* Logo / Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm shrink-0">
              TB
            </div>
            <div className="min-w-0">
              <span className="text-base sm:text-lg font-black text-white tracking-tight block truncate">
                Đăng Ký Team Building 2026
              </span>
              <span className="text-[11px] font-medium text-slate-400 block tracking-wide truncate">
                Chiến dịch Nâng cao Nhận thức Phòng Chống HIV/AIDS
              </span>
            </div>
          </div>

          {/* User Profile / Google Auth Status */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full border border-slate-700 object-cover"
                />
                <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                  {currentUser.name}
                </span>
                <button
                  onClick={onLogoutClick}
                  className="p-1 rounded text-slate-400 hover:text-slate-200 transition-colors"
                  title="Đăng xuất"
                  aria-label="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="px-3.5 sm:px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-all"
              >
                Đăng nhập Google
              </button>
            )}
          </div>
        </div>

        {/* Action & Metric Strip */}
        <div className="p-3 sm:p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Metric Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full md:w-auto">
            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] sm:min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">
                Tổng Slot
              </span>
              <span className="text-lg sm:text-xl font-black text-white">{totalSlots}</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center min-w-[85px] sm:min-w-[110px]">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold mb-0.5">
                Đã Đăng Ký
              </span>
              <span className="text-lg sm:text-xl font-black text-white">{occupiedCount}</span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center min-w-[85px] sm:min-w-[110px]">
              <span className="text-[10px] text-emerald-400 uppercase tracking-wider block font-semibold mb-0.5">
                Còn Trống
              </span>
              <span className="text-lg sm:text-xl font-black text-emerald-300">
                {availableCount}
              </span>
            </div>
          </div>

          {/* Primary CTA */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {hasTeam ? (
              <button
                onClick={onOpenMyTeamEdit}
                className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all text-center"
              >
                Quản lý đội của bạn
              </button>
            ) : isFull ? (
              <div className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs sm:text-sm font-medium text-center">
                Đã đủ 6/6 đội (Tạm đóng đăng ký)
              </div>
            ) : (
              <button
                onClick={onOpenRegisterHero}
                className="w-full md:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 transition-all text-center"
              >
                Đăng ký đội (Còn {availableCount} vị trí)
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
