'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { X } from 'lucide-react';

interface RegistrationModalProps {
  isOpen: boolean;
  targetSlot: number;
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (teamData: {
    teamName?: string;
    members: string[];
    slotNumber: number;
  }) => Promise<{ success: boolean; error?: string } | void> | void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  targetSlot,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<string[]>(['', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultTeamName = `Đội ${targetSlot}`;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);

      // Pre-fill member 1 with current user if logged in
      if (currentUser?.name) {
        setMembers([currentUser.name, '', '']);
      } else {
        setMembers(['', '', '']);
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
    if (error) setError(null);
  };

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, '']);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 3) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const handleFillMyName = (index: number) => {
    if (currentUser?.name) {
      handleMemberChange(index, currentUser.name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMembers = members.map((m) => m.trim());
    const emptyMemberIndex = cleanMembers.findIndex((m) => !m);
    if (emptyMemberIndex !== -1) {
      const msg = `Vui lòng nhập họ tên cho thành viên #${emptyMemberIndex + 1}`;
      setError(msg);
      return;
    }

    if (cleanMembers.length < 3) {
      setError('Đội thi đấu bắt buộc phải có tối thiểu 3 thành viên');
      return;
    }

    const uniqueMembers = new Set(cleanMembers.map((m) => m.toLowerCase()));
    if (uniqueMembers.size !== cleanMembers.length) {
      setError('Danh sách thành viên không được có họ tên trùng lặp');
      return;
    }

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
        className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
              Vị Trí Slot #{targetSlot}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 flex items-start gap-2">
              <span className="font-bold text-red-400">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* Account Info Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-slate-400 block text-[11px]">Tài khoản đại diện đăng ký:</span>
              <strong className="text-slate-200 text-xs">{currentUser?.name}</strong>{' '}
              <span className="text-slate-500 text-[11px]">({currentUser?.email})</span>
            </div>
            <span className="text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-lg self-start sm:self-auto font-medium">
              Tên mặc định: {defaultTeamName}
            </span>
          </div>

          {/* Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-200">
                Danh sách thành viên ({members.length}/5 người){' '}
                <span className="text-red-400">*</span>
              </label>
              <span className="text-[11px] text-slate-400">
                Tối thiểu 3, tối đa 5 người
              </span>
            </div>

            <div className="space-y-2.5">
              {members.map((member, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl border border-slate-800 bg-slate-950"
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-medium text-slate-300 text-[11px]">
                      Thành viên #{idx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      {/* Fill current user name shortcut */}
                      {currentUser?.name && member !== currentUser.name && (
                        <button
                          type="button"
                          onClick={() => handleFillMyName(idx)}
                          className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                        >
                          Tôi tham gia vị trí này
                        </button>
                      )}

                      {/* Remove button */}
                      {members.length > 3 && (
                        <button
                          type="button"
                          onClick={() => removeMember(idx)}
                          className="text-[11px] text-slate-500 hover:text-red-400 px-1"
                          title="Xóa thành viên"
                        >
                          Xóa
                        </button>
                      )}
                    </div>
                  </div>

                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={`Nhập họ và tên thành viên #${idx + 1}`}
                    maxLength={50}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-red-500 focus:outline-hidden text-white placeholder-slate-600 text-xs"
                  />
                </div>
              ))}
            </div>

            {members.length < 5 && (
              <button
                type="button"
                onClick={addMember}
                className="mt-2.5 w-full py-1.5 rounded-xl border border-dashed border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-medium text-xs transition-colors"
              >
                + Thêm thành viên ({members.length + 1}/5)
              </button>
            )}
          </div>

          {/* Bottom Error Alert */}
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
              <span className="font-bold text-red-400">⚠️ Lỗi:</span>
              <span>{error}</span>
            </div>
          )}

          {/* Action Buttons */}
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
                isSubmitting ? 'bg-red-850 cursor-wait opacity-80' : 'bg-red-600 hover:bg-red-500 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Đang ghi danh...
                </>
              ) : (
                `Hoàn tất đăng ký ${defaultTeamName}`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
