'use client';

import React, { useState, useEffect } from 'react';
import { Team } from '@/types';
import { HeartHandshake, X, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';

interface AdminDirectMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  teams: Team[];
  initialSourceTeam?: Team | null;
  onSuccess: () => void;
  onShowNotice: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminDirectMergeModal: React.FC<AdminDirectMergeModalProps> = ({
  isOpen,
  onClose,
  teams,
  initialSourceTeam,
  onSuccess,
  onShowNotice
}) => {
  const [fromTeamId, setFromTeamId] = useState<string>('');
  const [toTeamId, setToTeamId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Teams eligible to be merged (at least 2 registered teams needed)
  const registeredTeams = teams.filter((t) => t.members.length > 0);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);

      if (initialSourceTeam) {
        setFromTeamId(initialSourceTeam.id);
        const eligibleTarget = registeredTeams.find(
          (t) => t.id !== initialSourceTeam.id && t.members.length + initialSourceTeam.members.length <= 5
        );
        setToTeamId(eligibleTarget ? eligibleTarget.id : '');
      } else {
        const first = registeredTeams[0];
        setFromTeamId(first ? first.id : '');
        const second = registeredTeams.find((t) => t.id !== first?.id && t.members.length + (first?.members.length || 0) <= 5);
        setToTeamId(second ? second.id : '');
      }
    }
  }, [isOpen, initialSourceTeam, teams]);

  if (!isOpen) return null;

  const fromTeam = registeredTeams.find((t) => t.id === fromTeamId) || null;
  const toTeam = registeredTeams.find((t) => t.id === toTeamId) || null;

  const fromCount = fromTeam ? fromTeam.members.length : 0;
  const toCount = toTeam ? toTeam.members.length : 0;
  const totalCount = fromCount + toCount;
  const isValidMerge = fromTeam && toTeam && fromTeam.id !== toTeam.id && totalCount <= 5;

  const handleMergeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidMerge || isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError(null);

      const res = await fetch('/api/admin/teams/merge', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fromTeamId: fromTeam.id,
          toTeamId: toTeam.id
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra khi thực hiện gộp đội.');
      }

      onShowNotice('success', data.message || `Đã gộp thành công ${fromTeam.name} vào ${toTeam.name}!`);
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[Admin Merge Error]:', err);
      setError(err?.message || 'Có lỗi khi gộp đội.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-slate-900 border border-purple-500/30 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
                Quyền Quản Trị Viên (Admin)
              </span>
              <h3 className="text-base sm:text-lg font-black text-white">
                Gộp Đội Trực Tiếp (Không Cần Request)
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleMergeSubmit} className="flex-1 overflow-y-auto space-y-4 pr-1 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Selectors Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Source Team */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-rose-400">
                1. Đội nguồn (Chuyển đi &amp; Giải phóng slot)
              </label>
              <select
                value={fromTeamId}
                onChange={(e) => setFromTeamId(e.target.value)}
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
                <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Đại diện:</span>
                    <strong className="text-slate-200">{fromTeam.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Số thành viên:</span>
                    <span className="text-rose-400 font-bold">{fromCount} người</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Target Team */}
            <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <label className="block text-[11px] font-bold uppercase tracking-wide text-emerald-400">
                2. Đội đích (Nhận thành viên vào)
              </label>
              <select
                value={toTeamId}
                onChange={(e) => setToTeamId(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-medium focus:outline-hidden focus:border-purple-500 cursor-pointer text-xs"
              >
                <option value="">-- Chọn đội nhận --</option>
                {registeredTeams.map((t) => {
                  const fit = t.members.length + fromCount <= 5;
                  return (
                    <option key={t.id} value={t.id} disabled={t.id === fromTeamId}>
                      {t.name} (Slot #{t.slotNumber} — {t.members.length}/5 người) {fit ? '✅' : '❌ (Quá 5 người)'}
                    </option>
                  );
                })}
              </select>
              {toTeam && (
                <div className="pt-1.5 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Đại diện:</span>
                    <strong className="text-slate-200">{toTeam.ownerName}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Số thành viên:</span>
                    <span className="text-emerald-400 font-bold">{toCount} người</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Merge Result Simulation */}
          {fromTeam && toTeam && (
            <div
              className={`p-3.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isValidMerge
                  ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                  : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
              }`}
            >
              <div className="flex items-center gap-2">
                {isValidMerge ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <div className="font-bold text-white text-xs">
                    {fromTeam.name} ({fromCount} người) + {toTeam.name} ({toCount} người) = {totalCount}/5 người
                  </div>
                  <div className="text-[11px] text-slate-300">
                    {isValidMerge
                      ? `Hợp lệ! Sau khi gộp, ${toTeam.name} sẽ có tổng cộng ${totalCount}/5 thành viên.`
                      : `Vượt quá giới hạn! Tối đa mỗi đội chỉ được phép có 5 thành viên.`}
                  </div>
                </div>
              </div>

              {isValidMerge && (
                <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] self-start sm:self-auto shrink-0">
                  Đủ điều kiện gộp
                </span>
              )}
            </div>
          )}

          {/* Explanation Callout */}
          <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-400 space-y-1 text-[11px] leading-relaxed">
            <p className="font-semibold text-slate-300 flex items-center gap-1.5">
              <span>⚡ Cơ chế Gộp Trực Tiếp của Admin:</span>
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-400">
              <li>Toàn bộ {fromCount} thành viên từ <strong>{fromTeam?.name || 'Đội nguồn'}</strong> sẽ chuyển sang <strong>{toTeam?.name || 'Đội đích'}</strong> ngay lập tức.</li>
              <li>Vị trí <strong>Slot #{fromTeam?.slotNumber || '...'}</strong> của Đội nguồn sẽ được <strong>giải phóng hoàn toàn</strong> thành 5 slot trống để các đội khác đăng ký.</li>
              <li>Không cần gửi request hay chờ người đại diện của 2 đội phê duyệt.</li>
            </ul>
          </div>

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
                  <span>Đang xử lý gộp...</span>
                </>
              ) : (
                <>
                  <HeartHandshake className="w-4 h-4" />
                  <span>Xác Nhận Gộp Đội Ngay</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
