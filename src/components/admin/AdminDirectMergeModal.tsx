'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  HeartHandshake,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Users,
  CheckSquare,
  Square,
  Crown
} from 'lucide-react';
import { Team } from '@/types';

interface AdminDirectMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  initialFromTeam?: Team | null;
  initialMemberId?: string | null;
  onSuccess: (msg: string) => void;
}

export const AdminDirectMergeModal: React.FC<AdminDirectMergeModalProps> = ({
  isOpen,
  onClose,
  teams,
  initialFromTeam,
  initialMemberId,
  onSuccess
}) => {
  const registeredTeams = teams.filter((t) => t.members.length > 0);

  const [fromTeamId, setFromTeamId] = useState<string>('');
  const [toTeamId, setToTeamId] = useState<string>('');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize source team and selected members
  useEffect(() => {
    if (isOpen) {
      setError(null);
      let defaultFromId = '';

      if (initialFromTeam && registeredTeams.some((t) => t.id === initialFromTeam.id)) {
        defaultFromId = initialFromTeam.id;
      } else if (registeredTeams.length > 0) {
        defaultFromId = registeredTeams[0].id;
      }
      setFromTeamId(defaultFromId);

      const foundTeam = registeredTeams.find((t) => t.id === defaultFromId);
      if (foundTeam) {
        if (initialMemberId && foundTeam.members.some((m) => m.id === initialMemberId)) {
          setSelectedMemberIds([initialMemberId]);
        } else {
          setSelectedMemberIds(foundTeam.members.map((m) => m.id));
        }
      } else {
        setSelectedMemberIds([]);
      }

      // Default target team to another team if available
      const otherTeam = registeredTeams.find((t) => t.id !== defaultFromId);
      setToTeamId(otherTeam ? otherTeam.id : '');
    }
  }, [isOpen, initialFromTeam, initialMemberId]);

  // When fromTeamId changes, reset selectedMemberIds to all members of that team
  const handleFromTeamChange = (newFromId: string) => {
    setFromTeamId(newFromId);
    setError(null);
    const foundTeam = registeredTeams.find((t) => t.id === newFromId);
    if (foundTeam) {
      setSelectedMemberIds(foundTeam.members.map((m) => m.id));
    } else {
      setSelectedMemberIds([]);
    }
    if (toTeamId === newFromId) {
      const other = registeredTeams.find((t) => t.id !== newFromId);
      setToTeamId(other ? other.id : '');
    }
  };

  if (!isOpen) return null;

  const fromTeam = registeredTeams.find((t) => t.id === fromTeamId);
  const toTeam = registeredTeams.find((t) => t.id === toTeamId);

  const fromCount = fromTeam?.members.length || 0;
  const toCount = toTeam?.members.length || 0;
  const selectedCount = selectedMemberIds.length;
  const targetCapacityAfter = toCount + selectedCount;

  const isAllSelected = fromCount > 0 && selectedCount === fromCount;
  const isNoneSelected = selectedCount === 0;
  const isValidCapacity = targetCapacityAfter <= 5;
  const isValidMerge =
    Boolean(fromTeam && toTeam && fromTeamId !== toTeamId) &&
    selectedCount > 0 &&
    isValidCapacity;

  // Toggle single member
  const toggleMember = (memberId: string) => {
    if (isSubmitting) return;
    setError(null);
    setSelectedMemberIds((prev) =>
      prev.includes(memberId) ? prev.filter((id) => id !== memberId) : [...prev, memberId]
    );
  };

  // Toggle all members
  const toggleSelectAll = () => {
    if (isSubmitting || !fromTeam) return;
    setError(null);
    if (isAllSelected) {
      setSelectedMemberIds([]);
    } else {
      setSelectedMemberIds(fromTeam.members.map((m) => m.id));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidMerge || !fromTeam || !toTeam) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/admin/teams/merge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fromTeamId,
          toTeamId,
          memberIds: selectedMemberIds
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi gộp/chuyển thành viên.');
      }

      onSuccess(data.message || 'Chuyển thành viên thành công!');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Lỗi kết nối khi gộp đội.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-purple-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 bg-linear-to-r from-purple-950/70 via-slate-900 to-slate-900 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>Gộp Đội & Chuyển Người Tùy Ý</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase tracking-wider">
                  Admin
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Chuyển một hoặc nhiều thành viên từ đội này sang đội khác trực tiếp mà không cần chờ duyệt.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* 1. Source Team */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-rose-400 flex items-center gap-1.5">
                <span>1. Đội nguồn (Chuyển người đi)</span>
              </label>
              <select
                value={fromTeamId}
                onChange={(e) => handleFromTeamChange(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-hidden focus:border-purple-500 cursor-pointer text-xs"
              >
                {registeredTeams.map((t) => (
                  <option key={t.id} value={t.id} disabled={t.id === toTeamId}>
                    {t.name} (Slot #{t.slotNumber} — {t.members.length}/5 người)
                  </option>
                ))}
              </select>
              {fromTeam && (
                <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Đại diện:</span>
                    <strong className="text-slate-200">{(fromTeam.ownerEmail ? fromTeam.members.find((m) => m.email && m.email.toLowerCase() === fromTeam.ownerEmail.toLowerCase())?.name : null) || fromTeam.members[0]?.name || fromTeam.captainName || fromTeam.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Tổng quân số hiện tại:</span>
                    <span className="text-rose-400 font-bold">{fromCount} người</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Target Team */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-emerald-400 flex items-center gap-1.5">
                <span>2. Đội đích (Nhận thành viên vào)</span>
              </label>
              <select
                value={toTeamId}
                onChange={(e) => {
                  setToTeamId(e.target.value);
                  setError(null);
                }}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-hidden focus:border-purple-500 cursor-pointer text-xs"
              >
                <option value="">-- Chọn đội nhận --</option>
                {registeredTeams.map((t) => {
                  const available = 5 - t.members.length;
                  const canFit = available >= (selectedCount || 1);
                  return (
                    <option key={t.id} value={t.id} disabled={t.id === fromTeamId}>
                      {t.name} (Slot #{t.slotNumber} — {t.members.length}/5 người) — Trống {available} chỗ {canFit ? '✓' : '⚠️ (Thiếu chỗ)'}
                    </option>
                  );
                })}
              </select>
              {toTeam && (
                <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-0.5">
                  <div className="flex justify-between">
                    <span>Đại diện:</span>
                    <strong className="text-slate-200">{(toTeam.ownerEmail ? toTeam.members.find((m) => m.email && m.email.toLowerCase() === toTeam.ownerEmail.toLowerCase())?.name : null) || toTeam.members[0]?.name || toTeam.captainName || toTeam.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Hiện có:</span>
                    <span className="text-emerald-400 font-bold">{toCount}/5 người (còn trống {5 - toCount} chỗ)</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Member Selection Checklist */}
          {fromTeam && (
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    Chọn thành viên cần chuyển từ {fromTeam.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 text-[11px] font-bold">
                    Đã chọn {selectedCount}/{fromCount}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={isSubmitting}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  {isAllSelected ? (
                    <>
                      <Square className="w-3.5 h-3.5 text-slate-400" />
                      <span>Bỏ chọn tất cả</span>
                    </>
                  ) : (
                    <>
                      <CheckSquare className="w-3.5 h-3.5 text-purple-400" />
                      <span>Chọn tất cả ({fromCount})</span>
                    </>
                  )}
                </button>
              </div>

              {/* Members Grid / List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {fromTeam.members.map((m, idx) => {
                  const isChecked = selectedMemberIds.includes(m.id);
                  return (
                    <div
                      key={m.id || idx}
                      onClick={() => toggleMember(m.id)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2.5 select-none ${
                        isChecked
                          ? 'bg-purple-950/40 border-purple-500/60 shadow-xs'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-75'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer accent-purple-600"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">
                              #{idx + 1}. {m.name}
                            </span>
                            {m.isCaptain && (
                              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold shrink-0">
                                <Crown className="w-2.5 h-2.5" />
                                <span>Trưởng</span>
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            MSSV: <span className="font-mono text-slate-300">{m.studentId || 'N/A'}</span>
                            {m.phone && <span className="ml-2 text-emerald-400 font-mono">{m.phone}</span>}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                          isChecked
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : 'text-slate-500'
                        }`}
                      >
                        {isChecked ? 'Sẽ chuyển' : 'Ở lại'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Merge Result Simulation */}
          {fromTeam && toTeam && (
            <div
              className={`p-3.5 rounded-xl border flex flex-col gap-2 ${
                isValidMerge
                  ? 'bg-purple-950/30 border-purple-500/40 text-purple-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                {isValidMerge ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1 text-xs">
                  <div className="font-bold text-white">
                    Chuyển {selectedCount} người từ {fromTeam.name} sang {toTeam.name} ({toCount} + {selectedCount} = {targetCapacityAfter}/5 người)
                  </div>

                  {isNoneSelected && (
                    <div className="text-[11px] text-amber-300 font-medium">
                      ⚠️ Vui lòng tick chọn ít nhất 1 thành viên ở danh sách trên để chuyển.
                    </div>
                  )}

                  {!isValidCapacity && (
                    <div className="text-[11px] text-rose-300 font-medium">
                      ⚠️ Vượt quá giới hạn 5 người! Đội đích {toTeam.name} hiện chỉ còn trống {5 - toCount} chỗ, không thể nhận {selectedCount} người.
                    </div>
                  )}

                  {isValidMerge && (
                    <div className="text-[11px] space-y-1">
                      {isAllSelected ? (
                        <p className="text-emerald-300 font-medium">
                          ⭐ <strong>Gộp toàn bộ:</strong> Toàn bộ {fromCount} thành viên sẽ chuyển sang {toTeam.name}. Vị trí <strong>Slot #{fromTeam.slotNumber}</strong> của {fromTeam.name} sẽ được <strong>giải phóng hoàn toàn</strong> thành 5 slot trống!
                        </p>
                      ) : (
                        <p className="text-purple-300 font-medium">
                          ⚡ <strong>Chuyển một phần:</strong> {selectedCount} người được chọn sẽ chuyển sang {toTeam.name} (đạt {targetCapacityAfter}/5 người). Đội {fromTeam.name} giữ nguyên Slot #{fromTeam.slotNumber} với <strong>{fromCount - selectedCount} người còn lại</strong>.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={!isValidMerge || isSubmitting}
              className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-2 shadow-lg shadow-purple-900/30 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang xử lý chuyển người...</span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4" />
                  <span>
                    {isAllSelected
                      ? `Xác Nhận Gộp Toàn Bộ Đội (${selectedCount} người)`
                      : `Xác Nhận Chuyển ${selectedCount} Người`}
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
