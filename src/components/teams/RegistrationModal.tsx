'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { User } from '@/types';
import { Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: number;
  currentUser: User | null;
  onRegisterSuccess: (teamData: {
    slotNumber: number;
    teamName: string;
    members: string[];
  }) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  targetSlot,
  currentUser,
  onRegisterSuccess
}) => {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['', '', '']);
  const [errors, setErrors] = useState<{ teamName?: string; members?: string[]; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      const initialLeader = currentUser?.name ? `${currentUser.name} (Đội trưởng)` : '';
      setMembers([initialLeader, '', '']);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser]);

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    if (errors.members && errors.members[index]) {
      const updatedErr = [...(errors.members || [])];
      updatedErr[index] = '';
      setErrors({ ...errors, members: updatedErr });
    }
  };

  const handleAddMember = () => {
    if (members.length < 5) {
      setMembers([...members, '']);
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 3) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const validate = () => {
    const newErrors: { teamName?: string; members?: string[]; general?: string } = {};
    const trimmedTeam = teamName.trim();

    if (!trimmedTeam) {
      newErrors.teamName = 'Tên đội là bắt buộc';
    } else if (trimmedTeam.length < 2) {
      newErrors.teamName = 'Tên đội phải từ 2 ký tự';
    } else if (trimmedTeam.length > 50) {
      newErrors.teamName = 'Tên đội không quá 50 ký tự';
    }

    const memberErrors: string[] = [];
    const trimmedMembers = members.map((m) => m.trim());
    const seenNames = new Set<string>();

    trimmedMembers.forEach((name, idx) => {
      if (!name) {
        memberErrors[idx] = `Vui lòng nhập họ tên thành viên ${idx + 1}`;
      } else if (name.length < 2) {
        memberErrors[idx] = 'Họ tên phải từ 2 ký tự';
      } else if (seenNames.has(name.toLowerCase())) {
        memberErrors[idx] = 'Tên thành viên bị trùng lặp';
      } else {
        seenNames.add(name.toLowerCase());
      }
    });

    if (memberErrors.some((e) => !!e)) {
      newErrors.members = memberErrors;
    }

    if (trimmedMembers.length < 3 || trimmedMembers.length > 5) {
      newErrors.general = 'Đội phải có từ 3 đến 5 thành viên';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);

      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      } catch (err) {}

      onRegisterSuccess({
        slotNumber: targetSlot,
        teamName: teamName.trim(),
        members: members.map((m) => m.trim())
      });
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Đăng Ký Đội Vào Vị Trí #${targetSlot}`}
      subtitle="Quy định mỗi đội gồm từ 3 đến 5 thành viên. Mỗi tài khoản sở hữu 1 đội."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Team Name Input */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="teamName" className="block text-xs sm:text-sm font-semibold text-slate-200">
              Tên đội thi đấu <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {teamName.trim().length}/50 ký tự
            </span>
          </div>
          <input
            id="teamName"
            type="text"
            value={teamName}
            maxLength={50}
            onChange={(e) => {
              setTeamName(e.target.value);
              if (errors.teamName) setErrors({ ...errors, teamName: undefined });
            }}
            placeholder="Ví dụ: Chiến Binh Hy Vọng..."
            className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-1 transition-all ${
              errors.teamName
                ? 'border-red-500 focus:ring-red-500'
                : 'border-slate-800 focus:border-red-500 focus:ring-red-500'
            }`}
          />
          {errors.teamName && (
            <p className="mt-1 text-xs text-red-400">
              {errors.teamName}
            </p>
          )}
        </div>

        {/* Members List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200">
                Danh sách thành viên ({members.length}/5) <span className="text-red-400">*</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Tối thiểu 3 người, tối đa 5 người (Người 1 là Đội trưởng).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              disabled={members.length >= 5}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                members.length >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              + Thêm người
            </button>
          </div>

          <div className="space-y-2">
            {members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-6 h-8 rounded bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={
                      idx === 0
                        ? 'Họ và tên Đội trưởng'
                        : `Họ và tên thành viên ${idx + 1}`
                    }
                    className={`w-full px-3 py-2 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:ring-1 transition-all ${
                      errors.members && errors.members[idx]
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-slate-800 focus:border-red-500 focus:ring-red-500'
                    }`}
                  />
                  {errors.members && errors.members[idx] && (
                    <p className="mt-1 text-xs text-red-400">
                      {errors.members[idx]}
                    </p>
                  )}
                </div>

                {members.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-950 transition-colors shrink-0"
                    title="Xóa thành viên này"
                    aria-label="Xóa thành viên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.general && (
            <p className="mt-2 text-xs text-red-400">
              {errors.general}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Đang lưu...' : 'Hoàn tất ghi danh'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
