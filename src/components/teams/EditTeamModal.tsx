'use client';

import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { X } from 'lucide-react';

interface EditTeamModalProps {
  isOpen: boolean;
  team: Team | null;
  isAdminMode?: boolean;
  onClose: () => void;
  onSubmit: (updatedData: {
    teamId: string;
    teamName: string;
    captainName: string;
    members: string[];
  }) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  team,
  isAdminMode = false,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setMembers(team.members.map((m) => m.name));
      setError(null);
    }
  }, [team]);

  if (!isOpen || !team) return null;

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
    if (members.length > 1) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanMembers = members.map((m) => m.trim());
    const emptyMemberIndex = cleanMembers.findIndex((m) => !m);
    if (emptyMemberIndex !== -1) {
      setError(`Vui lòng nhập họ tên cho thành viên #${emptyMemberIndex + 1}`);
      return;
    }

    const uniqueMembers = new Set(cleanMembers.map((m) => m.toLowerCase()));
    if (uniqueMembers.size !== cleanMembers.length) {
      setError('Danh sách thành viên không được có họ tên trùng lặp');
      return;
    }

    onSubmit({
      teamId: team.id,
      teamName: team.name,
      captainName: '',
      members: cleanMembers
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              Slot #{team.slotNumber} • {isAdminMode ? 'Chế độ Admin' : 'Đội của bạn'}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200">
              {error}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-semibold text-slate-200">
                Danh sách thành viên ({members.length}/5 người)
              </label>
              <span className="text-[11px] text-slate-400">
                Tối đa 5 người
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

                    {members.length > 1 && (
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

                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={`Nhập họ tên thành viên #${idx + 1}`}
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

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
