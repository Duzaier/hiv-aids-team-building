'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User } from '@/types';
import { X, UserPlus, Trash2, Lock } from 'lucide-react';

export interface MemberFormItem {
  name: string;
  studentId: string;
  email: string;
  phone: string;
}

interface RegistrationModalProps {
  isCapacityFull?: boolean;
  isOpen: boolean;
  targetSlot: number;
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (teamData: {
    teamName?: string;
    members: MemberFormItem[];
    slotNumber: number;
  }) => Promise<{ success: boolean; error?: string } | void> | void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  isCapacityFull = false,
  targetSlot,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<MemberFormItem[]>([
    { name: '', studentId: '', email: '', phone: '' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultTeamName = `Đội ${targetSlot}`;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);

      // Pre-fill member 1 with current user if logged in (minimum 1 member)
      setMembers([
        {
          name: '',
          studentId: '',
          email: currentUser?.email || '',
          phone: ''
        }
      ]);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleMemberChange = (
    index: number,
    field: keyof MemberFormItem,
    value: string
  ) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
    if (error) setError(null);
  };

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, { name: '', studentId: '', email: '', phone: '' }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate each member
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setError(`Vui lòng nhập Họ và tên cho Thành viên #${i + 1}`);
        return;
      }
      if (!m.studentId.trim()) {
        setError(`Vui lòng nhập MSSV (Mã số sinh viên) cho Thành viên #${i + 1}`);
        return;
      }
      if (!m.email.trim() || !m.email.includes('@')) {
        setError(`Vui lòng nhập Gmail hợp lệ cho Thành viên #${i + 1}`);
        return;
      }
      if (!m.phone.trim() || m.phone.trim().length < 8) {
        setError(`Vui lòng nhập Số điện thoại (Zalo) hợp lệ cho Thành viên #${i + 1}`);
        return;
      }
    }

    if (members.length < 1) {
      setError('Đội thi đấu bắt buộc phải có tối thiểu 1 thành viên');
      return;
    }

    const cleanMembers: MemberFormItem[] = members.map((m) => ({
      name: m.name.trim(),
      studentId: m.studentId.trim(),
      email: m.email.trim().toLowerCase(),
      phone: m.phone.trim()
    }));

    try {
      setIsSubmitting(true);
      const res = await onSubmit({
        teamName: defaultTeamName,
        members: cleanMembers,
        slotNumber: targetSlot
      });

      if (res && res.success === false) {
        setError(res.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi kết nối máy chủ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        ref={scrollContainerRef}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
              Đội #{targetSlot}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Đăng Ký {defaultTeamName}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isCapacityFull && (
          <div className="p-3.5 mb-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Hệ thống đã đạt giới hạn tối đa 30 thí sinh tham gia. Cổng đăng ký theo đội hiện đã khóa.</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Representative info notice */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 block text-[11px]">Tài khoản đại diện đăng ký:</span>
                <span className="font-semibold text-white truncate block">
                  {currentUser.name} ({currentUser.email})
                </span>
              </div>
            </div>
          )}

          {/* Members List Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Thông Tin Thành Viên ({members.length}/5 người)
                </label>
                <span className="text-[11px] text-slate-400">
                  Mỗi đội từ 1 đến 5 người (cá nhân vẫn có thể đăng ký lập đội). Vui lòng điền đúng MSSV, Gmail và số điện thoại liên hệ.
                </span>
              </div>
              {members.length < 5 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm người</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-950 text-red-300 font-bold text-xs border border-red-500/30">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-white">
                        Thành viên #{index + 1} {index === 0 && <span className="text-amber-400 font-normal">(Đại diện đội)</span>}
                      </span>
                    </div>

                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors text-xs flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Xóa thành viên này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Xóa</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Họ và tên */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Họ và tên <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn An"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                        required
                      />
                    </div>

                    {/* MSSV */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        MSSV (Mã số sinh viên) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: SE170123"
                        value={member.studentId}
                        onChange={(e) => handleMemberChange(index, 'studentId', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                        required
                      />
                    </div>

                    {/* Gmail */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Gmail <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="VD: an.nv@gmail.com"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                        required
                      />
                    </div>

                    {/* SĐT / Zalo */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Số điện thoại (Zalo) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="VD: 0912345678"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isCapacityFull}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-2 ${
                isSubmitting ? 'bg-red-850 cursor-wait opacity-80' : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang ghi danh...
                </>
              ) : (
                'ĐĂNG KÝ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};