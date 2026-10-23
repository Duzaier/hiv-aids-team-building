'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGoogleOAuth = () => {
    setIsLoading(true);
    signIn('google', { callbackUrl: window.location.href });
  };

  const handleQuickEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    await signIn('google-mock', {
      email: email.trim(),
      name: name.trim() || email.split('@')[0],
      callbackUrl: window.location.href
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
              Xác Thực Tài Khoản
            </span>
            <h3 className="text-lg font-black text-white">Đăng Nhập Hệ Thống</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Real Google OAuth Button */}
        <button
          onClick={handleGoogleOAuth}
          disabled={isLoading}
          className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md transition-all mb-4 disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          Đăng nhập trực tiếp bằng Google
        </button>

        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-slate-500 text-[11px] uppercase tracking-wider">
            hoặc đăng nhập nhanh qua Email
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Quick Email Login Form */}
        <form onSubmit={handleQuickEmailLogin} className="space-y-3 mt-2 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Địa chỉ Email của bạn <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenban@gmail.com"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:outline-hidden text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:outline-hidden text-white placeholder-slate-600"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold transition-colors disabled:opacity-50 cursor-pointer shadow-md"
          >
            {isLoading ? 'Đang xác thực...' : 'Vào hệ thống'}
          </button>
        </form>
      </div>
    </div>
  );
};
