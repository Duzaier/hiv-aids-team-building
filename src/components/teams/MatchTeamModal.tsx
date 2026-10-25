'use client';

import React, { useState } from 'react';
import { Team, TeamMatchRequest } from '@/types';

interface MatchTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  myTeam: Team | null;
  targetTeam?: Team | null;
  allTeams: Team[];
  matches: TeamMatchRequest[];
  onSendMatch: (fromTeamId: string, toTeamId: string) => Promise<void>;
  onCancelMatch: (matchId: string) => Promise<void>;
}

export const MatchTeamModal: React.FC<MatchTeamModalProps> = ({
  isOpen,
  onClose,
  myTeam,
  targetTeam,
  allTeams,
  matches,
  onSendMatch,
  onCancelMatch
}) => {
  const [submittingToId, setSubmittingToId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmTargetTeam, setConfirmTargetTeam] = useState<Team | null>(null);

  React.useEffect(() => {
    if (isOpen && targetTeam) {
      setConfirmTargetTeam(targetTeam);
    } else if (isOpen) {
      setConfirmTargetTeam(null);
    }
  }, [isOpen, targetTeam]);

  if (!isOpen || !myTeam) return null;

  const myCount = myTeam.members.length;
  // Eligible teams: registered, not myTeam, has room for myCount (myCount + targetCount <= 5)
  const eligibleTeams = allTeams.filter(
    (t) => t.id !== myTeam.id && t.members.length + myCount <= 5
  );

  const pendingOutgoing = matches.filter(
    (m) => m.fromTeamId === myTeam.id && m.status === 'PENDING'
  );

  const handleSend = async (targetTeamId: string) => {
    try {
      setSubmittingToId(targetTeamId);
      await onSendMatch(myTeam.id, targetTeamId);
      setConfirmTargetTeam(null);
    } finally {
      setSubmittingToId(null);
    }
  };

  const handleCancel = async (matchId: string) => {
    try {
      setCancellingId(matchId);
      await onCancelMatch(matchId);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Xin Tham Gia Đội Khác
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Current Team Status */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400">Đội của bạn:</span>
            <span className="text-xs font-bold text-amber-400">
              {myTeam.name} ({myCount}/5 thành viên)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {myTeam.members.map((m) => (
              <span
                key={m.id}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700"
              >
                {m.name}
              </span>
            ))}
          </div>
        </div>

        {/* Pending Requests */}
        {pendingOutgoing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Yêu cầu đang chờ duyệt ({pendingOutgoing.length})
            </h4>
            <div className="space-y-2">
              {pendingOutgoing.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs"
                >
                  <div>
                    <span className="font-semibold text-amber-200 block">
                      Đã gửi đến {m.toTeamName} (Slot #{m.toSlotNumber})
                    </span>
                    <span className="text-[10px] text-amber-400/80">
                      Đang chờ đại diện {m.toTeamName} hoặc Admin xác nhận
                    </span>
                  </div>
                  <button
                    onClick={() => handleCancel(m.id)}
                    disabled={cancellingId === m.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-medium text-xs transition-colors shrink-0 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {cancellingId === m.id ? (
                      <>
                        <span className="w-3 h-3 border-2 border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
                        <span>Đang hủy...</span>
                      </>
                    ) : (
                      <span>Hủy yêu cầu</span>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligible Teams List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
            Các đội có thể ghép ({eligibleTeams.length})
          </h4>

          {eligibleTeams.length === 0 ? (
            <div className="p-4 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-400">
              Hiện tại không có đội nào có đủ số slot trống để tiếp nhận {myCount} thành viên của đội bạn (tổng tối đa 5 người/đội).
            </div>
          ) : (
            <div className="space-y-2.5">
              {eligibleTeams.map((target) => {
                const targetEmpty = 5 - target.members.length;
                const newTotal = myCount + target.members.length;
                const isPending = pendingOutgoing.some((p) => p.toTeamId === target.id);

                return (
                  <div
                    key={target.id}
                    className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-sm text-white">
                          {target.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 font-bold">
                          Còn trống {targetEmpty} slot
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Hiện có: <span className="text-slate-300">{target.members.length}/5 người</span>
                        {' • '}
                        Sau khi gộp: <span className="text-emerald-400 font-bold">{newTotal}/5 người</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Người đại diện: {(target.ownerEmail ? target.members.find((m) => m.email && m.email.toLowerCase() === target.ownerEmail.toLowerCase())?.name : null) || target.members[0]?.name || target.captainName || target.ownerName}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0">
                      {isPending ? (
                        <span className="inline-block w-full sm:w-auto text-center px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                          Đang chờ duyệt
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmTargetTeam(target)}
                          disabled={submittingToId === target.id}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm border border-purple-500 transition-all text-center flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                          Xin tham gia
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Modal Overlay */}
        {confirmTargetTeam && (
          <div className="absolute inset-0 z-10 p-5 bg-slate-900/95 backdrop-blur-sm rounded-2xl flex flex-col justify-center animate-fade-in">
            <h4 className="text-base font-bold text-white mb-2">
              Xác nhận gửi yêu cầu xin tham gia?
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              Bạn có chắc muốn gửi yêu cầu xin tham gia từ <strong>{myTeam.name}</strong> ({myCount} người) vào <strong>{confirmTargetTeam.name}</strong> ({confirmTargetTeam.members.length}/5 người)?
              <br /><br />
              Khi đại diện {confirmTargetTeam.name} hoặc Admin đồng ý, toàn bộ thành viên sẽ chuyển sang {confirmTargetTeam.name} và vị trí #{myTeam.slotNumber} sẽ mở lại cho đội khác.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTargetTeam(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => handleSend(confirmTargetTeam.id)}
                disabled={submittingToId === confirmTargetTeam.id}
                className="flex-1 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
              >
                {submittingToId === confirmTargetTeam.id ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Đang gửi...</span>
                  </>
                ) : (
                  <span>Xác nhận gửi</span>
                )}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};