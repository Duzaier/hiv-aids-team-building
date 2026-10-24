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
    <header className="sticky top-0 z-40 py-3.5 sm:py-4 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md shadow-sm">
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
              Truyền thông phòng chống HIV/AIDS
            </span>
          </div>
        </div>

        {/* User Profile / Real Auth Status */}
        <div className="flex items-center gap-2 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2 sm:gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl shadow-xs">
              {imageError || !currentUser.avatar ? (
                <div className="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center text-[11px] font-bold text-white uppercase shrink-0 shadow-xs">
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
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-all duration-200 cursor-pointer"
                title="Đăng xuất"
                aria-label="Đăng xuất"
              >
                <LogOut className="w-3.5 h-3.5 transition-transform duration-200 hover:-translate-x-0.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-sm transition-all duration-150 active:scale-95 cursor-pointer"
            >
              Đăng nhập Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
