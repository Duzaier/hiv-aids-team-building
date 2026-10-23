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
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [captainIndex, setCaptainIndex] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setTeamName(team.name);
      const memberNames = team.members.map((m) => m.name);
      setMembers(memberNames);

      const activeCaptain = (team.captainName || team.ownerName || '').toLowerCase().trim();
      const capIdx = memberNames.findIndex((name) => name.toLowerCase().trim() === activeCaptain);
      setCaptainIndex(capIdx >= 0 ? capIdx : 0);

      setError(null);
    }
  }, [team, isOpen]);

  if (!isOpen || !team) return null;

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);
    setError(null);
  };

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, '']);
    }
  };

  const removeMember = (indexToRemove: number) => {
    if (members.length > 3) {
      const updated = members.filter((_, idx) => idx !== indexToRemove);
      setMembers(updated);

      if (captainIndex === indexToRemove) {
        setCaptainIndex(0);
      } else if (captainIndex > indexToRemove) {
        setCaptainIndex(captainIndex - 1);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanTeamName = teamName.trim();
    if (!cleanTeamName) {
      setError('Vui lòng nhập tên đội');
      return;
    }

    const cleanMembers = members.map((m) => m.trim());
    if (cleanMembers.some((m) => !m)) {
      setError('Vui lòng điền đầy đủ họ tên cho tất cả thành viên trong danh sách');
      return;
    }

    const uniqueMembers = new Set(cleanMembers.map((m) => m.toLowerCase()));
    if (uniqueMembers.size !== cleanMembers.length) {
      setError('Danh sách thành viên không được có họ tên trùng lặp');
      return;
    }

    const selectedCaptain = cleanMembers[captainIndex];
    if (!selectedCaptain) {
      setError('Vui lòng chọn 1 thành viên làm đội trưởng');
      return;
    }

    onSubmit({
      teamId: team.id,
      teamName: cleanTeamName,
      captainName: selectedCaptain,
      members: cleanMembers
    });
  };

  const selectedCaptainName = members[captainIndex]?.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 block">
              {isAdminMode ? 'Chế độ Admin: Điều Chỉnh Đội' : 'Quản Lý Đội Của Bạn'}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Cập Nhật Slot #{team.slotNumber} — {team.name}
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
            <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/40 text-red-200">
              {error}
            </div>
          )}

          {/* Account Info */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
            Người đăng ký (Tài khoản sở hữu): <strong className="text-slate-200">{team.ownerName}</strong>
          </div>

          {/* Team Name */}
          <div>
            <label className="block font-semibold text-slate-200 mb-1">
              Tên đội thi đấu <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={50}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-amber-500 focus:outline-hidden text-white"
            />
          </div>

          {/* Members List & Captain Picker */}
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

            {/* Current Selected Captain Indicator */}
            <div className="mb-3 px-3 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
              <span className="text-slate-400 text-[11px]">Đội trưởng được chọn:</span>
              <span className="font-bold text-amber-400 text-xs">
                {selectedCaptainName ? selectedCaptainName : '(Chưa chọn đội trưởng)'}
              </span>
            </div>

            <div className="space-y-2.5">
              {members.map((member, idx) => {
                const isCurrentCaptain = captainIndex === idx;

                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isCurrentCaptain
                        ? 'bg-amber-950/20 border-amber-500/40'
                        : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-medium text-slate-300 text-[11px]">
                        Thành viên #{idx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        {/* Pick Captain Button */}
                        <button
                          type="button"
                          onClick={() => setCaptainIndex(idx)}
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                            isCurrentCaptain
                              ? 'bg-amber-500 text-slate-950'
                              : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                          }`}
                        >
                          {isCurrentCaptain ? '✓ Đội trưởng' : 'Chọn làm đội trưởng'}
                        </button>

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
                      placeholder={`Nhập họ tên thành viên #${idx + 1}`}
                      maxLength={50}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 focus:border-amber-500 focus:outline-hidden text-white text-xs"
                    />
                  </div>
                );
              })}
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

          {/* Actions */}
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
