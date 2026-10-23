'use client';

import React from 'react';
import { User } from '@/types';
import { LogOut } from 'lucide-react';

interface HeaderProps {
  currentUser: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLoginClick,
  onLogoutClick
}) => {
  const [imageError, setImageError] = React.useState(false);

  React.useEffect(() => {
    setImageError(false);
  }, [currentUser?.avatar]);

  const initialLetter = currentUser?.name?.trim() ? currentUser.name.trim().charAt(0).toUpperCase() : 'U';

  return (
    <header className="relative py-4 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 min-w-0">
          <img
            src="/logo.png"
            alt="Logo Team Building"
            loading="lazy"
            decoding="async"
            className="w-10 h-10 rounded-xl object-cover shrink-0 shadow-sm border border-slate-800/80"
          />
          <div className="min-w-0">
            <span className="text-base sm:text-lg font-black text-white tracking-tight block truncate">
              Đăng Ký Team Building 2026
            </span>
            <span className="text-[11px] font-medium text-slate-400 block tracking-wide truncate">
              Chiến dịch Nâng cao Nhận thức Phòng Chống HIV/AIDS
            </span>
          </div>
        </div>

        {/* User Profile / Real Auth Status */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              {imageError || !currentUser.avatar ? (
                <div className="w-6 h-6 rounded-full bg-linear-to-tr from-red-600 to-amber-500 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0 shadow-xs">
                  {initialLetter}
                </div>
              ) : (
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => setImageError(true)}
                  className="w-6 h-6 rounded-full border border-slate-700 object-cover shrink-0"
                />
              )}
              <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
                {currentUser.name}
              </span>
              {currentUser.role === 'ADMIN' && (
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950 border border-purple-500/40 text-purple-300 font-bold">
                  Admin
                </span>
              )}
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
    </header>
  );
};
