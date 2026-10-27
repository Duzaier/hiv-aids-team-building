'use client';

import React, { useState, useEffect } from 'react';
import { User, IndividualRegistration } from '@/types';
import { X, Edit3, UserPlus, Lock, AlertCircle } from 'lucide-react';

interface IndividualRegistrationModalProps {
  isCapacityFull?: boolean;
  isOpen: boolean;
  currentUser: User | null;
  initialData?: IndividualRegistration | null;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const IndividualRegistrationModal: React.FC<IndividualRegistrationModalProps> = ({
  isOpen,
  isCapacityFull = false,
  currentUser,
  initialData,
  onClose,
  onSuccess
}) => {
  const isEdit = Boolean(initialData?.id);
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setName(initialData.name || '');
        setStudentId(initialData.studentId || '');
        setEmail(initialData.email || '');
        setPhone(initialData.phone || '');
      } else {
        setName('');
        setStudentId('');
        setEmail(currentUser?.email || '');
        setPhone('');
      }
      setError(null);
      setFieldErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser, initialData]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s+().-]{8,20}$/;

    if (!cleanName) {
      errors.name = 'Vui lòng nhập Họ và tên';
    } else if (cleanName.length < 2) {
      errors.name = 'Họ tên phải có ít nhất 2 ký tự';
    }

    if (!cleanStudentId) {
      errors.studentId = 'Vui lòng nhập Mã số sinh viên (MSSV)';
    } else if (cleanStudentId.length < 3) {
      errors.studentId = 'MSSV không hợp lệ (tối thiểu 3 ký tự)';
    }

    if (!cleanEmail) {
      errors.email = 'Vui lòng nhập địa chỉ Gmail';
    } else if (!emailRegex.test(cleanEmail)) {
      errors.email = 'Địa chỉ Gmail không đúng định dạng (VD: ten@gmail.com)';
    }

    if (!cleanPhone) {
      errors.phone = 'Vui lòng nhập số điện thoại hoặc Zalo';
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
      const method = isEdit ? 'PATCH' : 'POST';
      const payload = isEdit
        ? { id: initialData?.id, name: cleanName, studentId: cleanStudentId, email: cleanEmail, phone: cleanPhone }
        : { name: cleanName, studentId: cleanStudentId, email: cleanEmail, phone: cleanPhone };

      const res = await fetch('/api/individuals', {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        if (!isEdit && result.individual?.id && typeof window !== 'undefined') {
          try {
            localStorage.setItem('my_individual_reg_id', result.individual.id);
          } catch (e) {}
        }
        onClose();
        onSuccess(result.message || (isEdit ? 'Cập nhật thông tin thành công!' : 'Đăng ký cá nhân thành công!'));
      } else {
        setError(result.error || (isEdit ? 'Cập nhật thất bại. Vui lòng thử lại.' : 'Đăng ký thất bại. Vui lòng thử lại.'));
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi kết nối máy chủ');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
              {isEdit ? 'Chỉnh Sửa' : 'Chưa có đội thi đấu'}
            </span>
            <h3 className="text-lg font-black text-white">{isEdit ? 'Sửa thông tin đăng ký' : 'Đăng ký cá nhân'}</h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200 leading-relaxed">
          {isEdit ? 'Thông tin cập nhật sẽ tự động đồng bộ vào đội của bạn (nếu đã được xếp đội).' : 'Ban tổ chức sẽ sắp xếp bạn vào đội còn thiếu thành viên trước giờ thi đấu.'}
        </div>

        {isCapacityFull && !isEdit && (
          <div className="p-3 mb-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Hệ thống đã đạt giới hạn tối đa 30 thí sinh tham gia. Cổng đăng ký cá nhân hiện đã khóa.</span>
          </div>
        )}

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-3.5 p-3 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 shadow-md shadow-red-950/30 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-300 block mb-0.5">Chưa đảm bảo điều kiện:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs" noValidate>
          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Họ và tên <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              disabled={isSubmitting}
              onChange={(e) => {
                setName(e.target.value);
                clearFieldError('name');
              }}
              placeholder="VD: Nguyễn Văn An"
              maxLength={50}
              className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white placeholder-slate-600 transition-colors ${
                fieldErrors.name
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : 'border-slate-800 focus:border-purple-500 focus:outline-none'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {fieldErrors.name && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.name}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              MSSV (Mã số sinh viên) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              disabled={isSubmitting}
              onChange={(e) => {
                setStudentId(e.target.value);
                clearFieldError('studentId');
              }}
              placeholder="VD: SE170123"
              maxLength={20}
              className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white placeholder-slate-600 transition-colors ${
                fieldErrors.studentId
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : 'border-slate-800 focus:border-purple-500 focus:outline-none'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {fieldErrors.studentId && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.studentId}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Địa chỉ Gmail <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              disabled={isSubmitting}
              onChange={(e) => {
                setEmail(e.target.value);
                clearFieldError('email');
              }}
              placeholder="VD: an.nv@gmail.com"
              className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white placeholder-slate-600 transition-colors ${
                fieldErrors.email
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : 'border-slate-800 focus:border-purple-500 focus:outline-none'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {fieldErrors.email && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.email}</span>
              </p>
            )}
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Số điện thoại (Zalo) <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              disabled={isSubmitting}
              onChange={(e) => {
                setPhone(e.target.value);
                clearFieldError('phone');
              }}
              placeholder="VD: 0912345678"
              maxLength={20}
              className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-white placeholder-slate-600 transition-colors ${
                fieldErrors.phone
                  ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                  : 'border-slate-800 focus:border-purple-500 focus:outline-none'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            {fieldErrors.phone && (
              <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.phone}</span>
              </p>
            )}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || (isCapacityFull && !isEdit)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (isCapacityFull && !isEdit)}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isEdit ? 'Đang lưu...' : 'Đang gửi đăng ký...'}</span>
                </>
              ) : (
                <span>{isEdit ? 'LƯU THAY ĐỔI' : 'ĐĂNG KÝ CÁ NHÂN'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
