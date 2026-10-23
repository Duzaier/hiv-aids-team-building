'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Team } from '@/types';
import { Plus, Trash2, AlertCircle, Sparkles, Loader2, Lock } from 'lucide-react';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  isAdminEdit?: boolean;
  onUpdateSuccess: (updatedTeam: Team) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  isAdminEdit = false,
  onUpdateSuccess
}) => {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ teamName?: string; members?: string[]; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team && isOpen) {
      setTeamName(team.name);
      setMembers(team.members.map((m) => m.name));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [team, isOpen]);

  if (!team) return null;

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    if (errors.members && errors.members[index]) {
      const updatedErr = [...errors.members];
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
      newErrors.teamName = 'Tên đội không được để trống';
    } else if (trimmedTeam.length < 2) {
      newErrors.teamName = 'Tên đội phải từ 2 ký tự trở lên';
    } else if (trimmedTeam.length > 50) {
      newErrors.teamName = 'Tên đội tối đa 50 ký tự';
    }

    const memberErrors: string[] = [];
    const trimmedMembers = members.map((m) => m.trim());
    const seenNames = new Set<string>();

    trimmedMembers.forEach((name, idx) => {
      if (!name) {
        memberErrors[idx] = `Vui lòng nhập tên thành viên ${idx + 1}`;
      } else if (name.length < 2) {
        memberErrors[idx] = 'Tên phải từ 2 ký tự';
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
      newErrors.general = 'Đội bắt buộc có từ 3 đến 5 thành viên';
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
      const updated: Team = {
        ...team,
        name: teamName.trim(),
        members: members.map((name, i) => ({
          id: team.members[i]?.id || `m-new-${Date.now()}-${i}`,
          name: name.trim()
        }))
      };
      onUpdateSuccess(updated);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdminEdit ? `Quản Trị: Chỉnh Sửa Đội #${team.slotNumber}` : `Chỉnh Sửa Đội Của Bạn (#${team.slotNumber})`}
      subtitle={`Vị trí Slot #${team.slotNumber} và quyền sở hữu được khóa cố định để đảm bảo tính toàn vẹn.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
        {/* Immutable Meta Info */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Vị trí cố định (Slot)</span>
            <span className="font-bold text-white flex items-center gap-1 text-xs sm:text-sm">
              <Lock className="w-3 h-3 text-amber-400 shrink-0" />
              Thẻ số 0{team.slotNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Chủ sở hữu đội</span>
            <span className="font-semibold text-slate-300 truncate block text-xs sm:text-sm">
              {team.ownerName}
            </span>
          </div>
        </div>

        {/* Team Name */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="editTeamName" className="block text-xs sm:text-sm font-semibold text-slate-200">
              Tên đội thi đấu <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {teamName.trim().length}/50 ký tự
            </span>
          </div>
          <input
            id="editTeamName"
            type="text"
            value={teamName}
            maxLength={50}
            onChange={(e) => {
              setTeamName(e.target.value);
              if (errors.teamName) setErrors({ ...errors, teamName: undefined });
            }}
            className="w-full px-3.5 py-2.5 sm:py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-white text-xs sm:text-sm"
          />
          {errors.teamName && (
            <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.teamName}
            </p>
          )}
        </div>

        {/* Members Management */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <div>
              <label className="block text-xs sm:text-sm font-semibold text-slate-200">
                Thành viên đội ({members.length}/5) <span className="text-red-400">*</span>
              </label>
              <p className="text-[11px] sm:text-xs text-slate-400">
                Điều chỉnh tên, thêm hoặc bớt trong giới hạn 3 - 5 người.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              disabled={members.length >= 5}
              className={`inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl text-xs font-bold transition-all shrink-0 ${
                members.length >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Thêm ({members.length}/5)
            </button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-7 h-9 sm:w-8 sm:h-10 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={`Họ và tên thành viên ${idx + 1}...`}
                    className="w-full px-3 py-2 sm:py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-white text-xs sm:text-sm"
                  />
                  {errors.members && errors.members[idx] && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 shrink-0" />
                      {errors.members[idx]}
                    </p>
                  )}
                </div>

                {members.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors shrink-0"
                    title="Xóa thành viên"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.general && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {errors.general}
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-3 sm:pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 flex items-center gap-1.5 sm:gap-2 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Đang lưu...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 shrink-0" />
                Cập nhật
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
