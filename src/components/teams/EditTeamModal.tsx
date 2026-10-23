'use client';

import React, { useState, useEffect } from 'react';
import { Team, TeamMember } from '@/types';
import { X, UserPlus, Trash2 } from 'lucide-react';
import { MemberFormItem } from './RegistrationModal';

interface EditTeamModalProps {
  isOpen: boolean;
  team: Team | null;
  isAdminMode?: boolean;
  onClose: () => void;
  onSubmit: (updatedData: {
    teamName: string;
    captainName: string;
    members: MemberFormItem[];
  }) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  team,
  isAdminMode = false,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<MemberFormItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team) {
      setMembers(
        team.members.map((m) => ({
          name: m.name || '',
          studentId: m.studentId || '',
          email: m.email || '',
          phone: m.phone || ''
        }))
      );
      setError(null);
    }
  }, [team]);

  if (!isOpen || !team) return null;

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
    if (members.length > 1) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setError(`Vui lòng nhập Họ và tên cho Thành viên #${i + 1}`);
        return;
      }
      if (!m.studentId.trim()) {
        setError(`Vui lòng nhập MSSV cho Thành viên #${i + 1}`);
        return;
      }
      if (!m.email.trim() || !m.email.includes('@')) {
        setError(`Vui lòng nhập Gmail hợp lệ cho Thành viên #${i + 1}`);
        return;
      }
      if (!m.phone.trim()) {
        setError(`Vui lòng nhập SĐT (Zalo) cho Thành viên #${i + 1}`);
        return;
      }
    }

    const cleanMembers: MemberFormItem[] = members.map((m) => ({
      name: m.name.trim(),
      studentId: m.studentId.trim(),
      email: m.email.trim().toLowerCase(),
      phone: m.phone.trim()
    }));

    try {
      setIsSubmitting(true);
      await onSubmit({
        teamName: team.name,
        captainName: '',
        members: cleanMembers
      });
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi lưu thông tin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Đội #{team.slotNumber} • {isAdminMode ? 'Chế độ Admin' : 'Đội của bạn'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Chỉnh Sửa {team.name}
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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Danh Sách Thành Viên ({members.length}/5 người)
            </label>
            {members.length < 5 && (
              <button
                type="button"
                onClick={addMember}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors"
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
                className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    Thành viên #{index + 1}
                  </span>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Họ và tên <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      MSSV (Mã số sinh viên) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.studentId}
                      onChange={(e) => handleMemberChange(index, 'studentId', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Gmail <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      SĐT / Zalo <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-sm disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};