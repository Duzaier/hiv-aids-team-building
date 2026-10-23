'use client';

import React from 'react';
import { User, Role } from '@/types';
import { Sparkles, HeartHandshake, LogOut, CheckCircle2 } from 'lucide-react';

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
    <header className="relative overflow-hidden pt-4 pb-8 sm:py-10 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80">
      {/* Background glowing gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-80 bg-gradient-to-b from-red-600/15 via-rose-900/5 to-transparent blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto">
        {/* Top Navbar */}
        <div className="flex items-center justify-between gap-2 sm:gap-4 mb-6 sm:mb-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-lg shadow-red-600/30 ring-2 ring-red-500/30 shrink-0">
              <HeartHandshake className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-400 block truncate">
                HIV/AIDS Awareness 2026
              </span>
              <span className="text-sm sm:text-lg font-black text-white tracking-tight block truncate">
                Team Building Đấu Trường 6 Đội
              </span>
            </div>
          </div>

          {/* User Profile / Google Auth Status */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-900/90 border border-slate-800 px-2.5 sm:px-3.5 py-1.5 rounded-xl sm:rounded-2xl shadow-sm">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-red-500/40 object-cover"
                />
                <div className="hidden md:block text-left text-xs">
                  <span className="font-bold text-white block leading-tight">{currentUser.name}</span>
                  <span className="text-slate-400 text-[11px] block">{currentUser.email}</span>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="p-1 sm:p-1.5 rounded-lg sm:rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md shadow-white/10 transition-all hover:scale-[1.02]"
              >
                <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span className="whitespace-nowrap">Đăng nhập</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Banner Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center">
          <div className="lg:col-span-7 space-y-3 sm:space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 sm:px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              Sự Kiện Team Building Kết Nối Cộng Đồng
            </div>

            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-snug sm:leading-tight">
              Chung Tay Vì Ngày Mai,{' '}
              <span className="bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 bg-clip-text text-transparent">
                Xóa Bỏ Định Kiến
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
              Hội thao và giao lưu gắn kết tinh thần đồng đội nhân tháng hành động quốc gia phòng, chống HIV/AIDS. Sân chơi gồm đúng <strong>6 vị trí thi đấu danh dự</strong> dành cho 6 đội xuất sắc đăng ký sớm nhất.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center gap-2.5 sm:gap-3">
              {hasTeam ? (
                <button
                  onClick={onOpenMyTeamEdit}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Quản lý đội của bạn
                </button>
              ) : isFull ? (
                <div className="w-full sm:w-auto px-4 sm:px-5 py-3 rounded-xl sm:rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  Đã đủ 6/6 đội đăng ký (Tạm đóng)
                </div>
              ) : (
                <button
                  onClick={onOpenRegisterHero}
                  className="w-full sm:w-auto px-5 sm:px-6 py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all hover:scale-[1.01]"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Đăng ký đội ngay (Còn {totalSlots - occupiedCount} slot)
                </button>
              )}

              <span className="text-[11px] sm:text-xs text-slate-400 w-full sm:w-auto text-center sm:text-left">
                • 3 - 5 người/đội • Slot 1 → 6 tự động
              </span>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-900/90 border border-slate-800 text-center">
              <span className="text-[10px] sm:text-xs text-slate-400 block mb-0.5 sm:mb-1">Tổng Slot</span>
              <span className="text-xl sm:text-3xl font-black text-white">{totalSlots}</span>
              <span className="text-[10px] sm:text-[11px] text-slate-400 block mt-0.5">Giới hạn cứng</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-red-950/40 border border-red-500/30 text-center">
              <span className="text-[10px] sm:text-xs text-red-400 block mb-0.5 sm:mb-1">Đã Đăng Ký</span>
              <span className="text-xl sm:text-3xl font-black text-white">{occupiedCount}</span>
              <span className="text-[10px] sm:text-[11px] text-red-300 block mt-0.5">Slot chiếm chỗ</span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center">
              <span className="text-[10px] sm:text-xs text-emerald-400 block mb-0.5 sm:mb-1">Còn Trống</span>
              <span className="text-xl sm:text-3xl font-black text-emerald-400">
                {totalSlots - occupiedCount}
              </span>
              <span className="text-[10px] sm:text-[11px] text-emerald-300 block mt-0.5">Sẵn sàng nhận</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
