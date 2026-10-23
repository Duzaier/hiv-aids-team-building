'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Team } from '@/types';
import { Trash2 } from 'lucide-react';

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
      newErrors.teamName = 'Tên đội phải từ 2 ký tự';
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
    }, 400);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdminEdit ? `Quản Trị: Chỉnh Sửa Đội #${team.slotNumber}` : `Chỉnh Sửa Đội Của Bạn (#${team.slotNumber})`}
      subtitle={`Vị trí Slot #${team.slotNumber} và chủ đội được khóa cố định.`}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Meta Info */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Vị trí</span>
            <span className="font-bold text-white text-xs sm:text-sm">
              Thẻ số 0{team.slotNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5 text-[11px]">Chủ sở hữu</span>
            <span className="font-semibold text-slate-200 truncate block text-xs sm:text-sm">
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
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-xs sm:text-sm"
          />
          {errors.teamName && (
            <p className="mt-1 text-xs text-red-400">
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
                    placeholder={`Họ và tên thành viên ${idx + 1}`}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-1 focus:ring-red-500 text-white text-xs sm:text-sm"
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
                    title="Xóa thành viên"
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

        {/* Buttons */}
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
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all"
          >
            {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
