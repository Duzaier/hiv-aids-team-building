'use client';

import React, { useState, useEffect } from 'react';
import {
  User, IndividualRegistration } from '@/types';
import { X, Edit3, UserPlus, Lock } from 'lucide-react';

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
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = name.trim();
    const cleanStudentId = studentId.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setError('Vui lòng nhập họ và tên');
      return;
    }
    if (!cleanStudentId) {
      setError('Vui lòng nhập MSSV');
      return;
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setError('Vui lòng nhập địa chỉ Gmail hợp lệ');
      return;
    }
    if (!cleanPhone || cleanPhone.length < 8) {
      setError('Vui lòng nhập số điện thoại hoặc Zalo liên hệ');
      return;
    }

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
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
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
              placeholder="VD: Nguyễn Văn An"
              required
              maxLength={50}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              MSSV (Mã số sinh viên) <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={studentId}
              onChange={(e) => {
                setStudentId(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: SE170123"
              required
              maxLength={20}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Địa chỉ Gmail <span className="text-red-400">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: an.nv@gmail.com"
              required
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-white placeholder-slate-600"
            />
          </div>

          <div>
            <label className="block text-slate-200 font-semibold mb-1">
              Số điện thoại (Zalo) <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (error) setError(null);
              }}
              placeholder="VD: 0912345678"
              required
              maxLength={20}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-purple-500 focus:outline-none text-white placeholder-slate-600"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || (isCapacityFull && !isEdit)}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold transition-all shadow-md shadow-purple-600/30 flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isEdit ? 'Đang lưu...' : 'Đang gửi...'}
                </>
              ) : (
                isEdit ? 'LƯU THAY ĐỔI' : 'ĐĂNG KÝ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};