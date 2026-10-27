'use client';

import React, { useState, useEffect } from 'react';
import { Team, User } from '@/types';
import { X, UserPlus, AlertCircle, Sparkles } from 'lucide-react';

interface IndividualJoinTeamModalProps {
  isOpen: boolean;
  team: Team | null;
  currentUser: User | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const IndividualJoinTeamModal: React.FC<IndividualJoinTeamModalProps> = ({
  isOpen,
  team,
  currentUser,
  onClose,
  onSuccess
}) => {
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentUser?.name || '');
      setStudentId('');
      setEmail(currentUser?.email || '');
      setPhone('');
      setError(null);
      setFieldErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !team) return null;

  const currentMembersCount = team.members?.length || 0;
  const remainingSlots = Math.max(0, 5 - currentMembersCount);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s+().-]{8,20}$/;

    if (!cleanName) {
      errors.name = 'Vui lòng nhập Họ và tên của bạn';
    } else if (cleanName.length < 2) {
      errors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (cleanStudentId && cleanStudentId.length < 3) {
      errors.studentId = 'MSSV không hợp lệ (tối thiểu 3 ký tự)';
    }

    if (!cleanEmail) {
      errors.email = 'Vui lòng nhập địa chỉ Gmail để nhận kết quả';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Gmail không đúng định dạng (VD: ten@gmail.com)';
    }

    if (!cleanPhone) {
      errors.phone = 'Vui lòng nhập số điện thoại hoặc Zalo liên hệ';
    } else if (!phoneRegex.test(cleanPhone) || cleanPhone.replace(/\D/g, '').length < 8) {
      errors.phone = 'Số điện thoại không hợp lệ (tối thiểu 8 số)';
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      const firstKey = Object.keys(errors)[0];
      setError(errors[firstKey]);
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validate()) {
      return;
    }

    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    try {
      setIsSubmitting(true);
      const res = await fetch('/api/individual-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          teamId: team.id,
          name: cleanName,
          studentId: cleanStudentId,
          email: cleanEmail,
          phone: cleanPhone
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Không thể gửi yêu cầu xin gia nhập');
      }

      onSuccess(data.message || `Đã gửi yêu cầu xin gia nhập vào ${team.name}!`);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối máy chủ khi gửi yêu cầu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      const next = { ...fieldErrors };
      delete next[field];
      setFieldErrors(next);
    }
    if (error) setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Accent Line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500" />

        {/* Header */}
        <div className="p-5 pb-4 flex items-start justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <UserPlus className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Xin Tham Gia {team.name}
              </h3>
              <p className="text-xs text-slate-400">
                Slot #{team.slotNumber} • Hiện có {currentMembersCount}/5 thành viên (còn trống {remainingSlots} slot)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Team Snapshot Banner */}
        <div className="mx-5 mt-4 p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-purple-200">
            <Sparkles className="w-4 h-4 text-purple-400 shrink-0" />
            <span>
              Yêu cầu của bạn sẽ được gửi tới <strong>Đội trưởng {team.name}</strong> và <strong>Ban Quản Trị</strong>.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-md bg-purple-900/60 text-purple-300 font-bold border border-purple-500/40 text-[11px] shrink-0 ml-2">
            Còn {remainingSlots} chỗ
          </span>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mx-5 mt-3.5 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 shadow-md shadow-red-950/30 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-300 block mb-0.5">Chưa đảm bảo điều kiện:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4" noValidate>
          {/* Họ và tên */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Họ và tên của bạn <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={name}
                disabled={isSubmitting}
                onChange={(e) => {
                  setName(e.target.value);
                  clearFieldError('name');
                }}
                placeholder="Ví dụ: Nguyễn Văn A"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder:text-slate-600 text-sm outline-none transition-all ${
                  fieldErrors.name
                    ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                    : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            {fieldErrors.name && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          {/* MSSV */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Mã số sinh viên (MSSV) <span className="text-slate-500 font-normal">(khuyến nghị)</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={studentId}
                disabled={isSubmitting}
                onChange={(e) => {
                  setStudentId(e.target.value);
                  clearFieldError('studentId');
                }}
                placeholder="Ví dụ: SE180123"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder:text-slate-600 text-sm outline-none transition-all uppercase ${
                  fieldErrors.studentId
                    ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                    : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            {fieldErrors.studentId && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.studentId}</span>
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Gmail nhận thông báo kết quả <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                disabled={isSubmitting}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="name@gmail.com"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder:text-slate-600 text-sm outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                    : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            {fieldErrors.email ? (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Hệ thống sẽ gửi email tự động khi Đội trưởng hoặc Admin chấp thuận/từ chối.
              </p>
            )}
          </div>

          {/* Số điện thoại / Zalo */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Số điện thoại / Zalo liên hệ <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                value={phone}
                disabled={isSubmitting}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError('phone');
                }}
                placeholder="Ví dụ: 0912345678"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950/80 border text-slate-100 placeholder:text-slate-600 text-sm outline-none transition-all ${
                  fieldErrors.phone
                    ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                    : 'border-slate-800 focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              />
            </div>
            {fieldErrors.phone ? (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.phone}</span>
              </p>
            ) : (
              <p className="text-[11px] text-slate-500 mt-1">
                Dùng để đồng đội trong {team.name} liên hệ và tạo nhóm Zalo tập luyện.
              </p>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-bold text-xs shadow-lg shadow-purple-900/30 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang gửi yêu cầu...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Gửi Yêu Cầu Xin Tham Gia</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
