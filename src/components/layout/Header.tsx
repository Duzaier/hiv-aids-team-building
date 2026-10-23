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

  return (
    <header className="relative pt-6 pb-8 sm:py-10 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between gap-3 mb-6 sm:mb-8">
          {/* Logo / Brand (Typographic) */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-red-600/90 flex items-center justify-center text-white font-black text-sm tracking-wider shadow-sm shrink-0">
              TB
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-bold uppercase tracking-widest text-red-400 block truncate">
                HIV/AIDS Awareness 2026
              </span>
              <span className="text-sm sm:text-base font-black text-white tracking-tight block truncate">
                Team Building 6 Đội Gắn Kết
              </span>
            </div>
          </div>

          {/* User Profile / Google Auth Status */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 border border-slate-800 px-3 py-1 rounded-xl">
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
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-all"
              >
                Đăng nhập Google
              </button>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-400 block">
              Hoạt động thi đấu & giao lưu gắn kết
            </span>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Chung Tay Vì Ngày Mai,{' '}
              <span className="text-red-500">
                Xóa Bỏ Định Kiến
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Hội thao giao lưu nâng cao nhận thức cộng đồng về phòng, chống HIV/AIDS. Sân chơi gồm đúng <strong>6 vị trí thi đấu danh dự</strong> dành cho 6 đội hoàn thành đăng ký sớm nhất.
            </p>

            {/* Hero CTAs (Text-focused, no decorative sparkles) */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              {hasTeam ? (
                <button
                  onClick={onOpenMyTeamEdit}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm shadow-sm transition-all"
                >
                  Quản lý đội của bạn
                </button>
              ) : isFull ? (
                <div className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs sm:text-sm font-medium">
                  Đã đủ 6/6 đội đăng ký (Tạm đóng)
                </div>
              ) : (
                <button
                  onClick={onOpenRegisterHero}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/20 transition-all"
                >
                  Đăng ký đội (Còn {totalSlots - occupiedCount} slot)
                </button>
              )}

              <span className="text-xs text-slate-400">
                3 - 5 người mỗi đội • Slot phân bổ tự động
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[11px] text-slate-400 block mb-0.5">Tổng Slot</span>
              <span className="text-xl sm:text-3xl font-black text-white">{totalSlots}</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-red-950/40 border border-red-500/30 text-center">
              <span className="text-[11px] text-red-300 block mb-0.5">Đã đăng ký</span>
              <span className="text-xl sm:text-3xl font-black text-white">{occupiedCount}</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[11px] text-emerald-300 block mb-0.5">Còn trống</span>
              <span className="text-xl sm:text-3xl font-black text-emerald-400">
                {totalSlots - occupiedCount}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
