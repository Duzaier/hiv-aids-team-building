'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { X, UserCheck } from 'lucide-react';

interface IndividualRegistrationModalProps {
  isOpen: boolean;
  currentUser: User | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const IndividualRegistrationModal: React.FC<IndividualRegistrationModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setEmail(currentUser?.email || '');
      setPhone('');
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Vui lòng nhập họ và tên của bạn');
      return;
    }
    if (!cleanEmail) {
      setError('Vui lòng nhập địa chỉ email liên hệ');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/individuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          phone: cleanPhone || undefined
        })
      });

      const result = await res.json();
      if (result.success) {
        onClose();
        onSuccess(result.message || 'Đăng ký diện cá nhân thành công!');
      } else {
        setError(result.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi kết nối máy chủ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              Dành Cho Người Chưa Có Nhóm
            </span>
            <h3 className="text-lg font-black text-white">Đăng Ký Diện Cá Nhân</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
          Bạn sẽ được đưa vào danh sách chờ ghép đội tự do. Ban tổ chức (Admin) sẽ bấm nút <strong>RANDOM</strong> để phân bổ ngẫu nhiên bạn vào các đội còn thiếu người (dưới 5 thành viên).
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-start gap-2">
              <span className="font-bold text-red-400">⚠️ Lỗi:</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Họ và tên <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Nguyễn Văn A"
              required
              maxLength={50}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-hidden text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Địa chỉ Email <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="tenban@gmail.com"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-hidden text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Số điện thoại / Zalo <span className="text-slate-500 font-normal">(không bắt buộc)</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0912345678"
              maxLength={20}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-hidden text-white placeholder-slate-600"
            />
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'bg-purple-800 cursor-wait opacity-80' : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang ghi danh...
                </>
              ) : (
                'Xác nhận đăng ký cá nhân'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
