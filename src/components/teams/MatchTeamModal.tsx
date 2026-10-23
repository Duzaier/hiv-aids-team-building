'use client';

import React, { useState } from 'react';
import { Team, TeamMatchRequest } from '@/types';
import {
  X,
  HeartHandshake,
  Users,
  Clock,
  CheckCircle2,
  Lightbulb,
  Send,
  AlertCircle
} from 'lucide-react';

interface MatchTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  myTeam: Team | null;
  allTeams: Team[];
  matches: TeamMatchRequest[];
  onSendMatch: (fromTeamId: string, toTeamId: string) => Promise<void>;
  onCancelMatch: (matchId: string) => Promise<void>;
}

export const MatchTeamModal: React.FC<MatchTeamModalProps> = ({
  isOpen,
  onClose,
  myTeam,
  allTeams,
  matches,
  onSendMatch,
  onCancelMatch
}) => {
  const [submittingToId, setSubmittingToId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [confirmTargetTeam, setConfirmTargetTeam] = useState<Team | null>(null);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-6 text-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/20 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block">
                Gh?p / G?p ??i (Match Team)
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                G?p {myTeam.name} V?o ??i Kh?c
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="??ng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Team Status */}
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/90 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-500" />
              <span>??i c?a b?n:</span>
            </span>
            <span className="text-xs font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-md">
              {myTeam.name} ({myCount}/5 th?nh vi?n)
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {myTeam.members.map((m) => (
              <span
                key={m.id}
                className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 border border-slate-700/60"
              >
                {m.name}
              </span>
            ))}
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Quy t?c g?p:</strong> Khi ??i nh?n ch?p nh?n, to?n b? <strong>{myCount} th?nh vi?n</strong> c?a {myTeam.name} s? chuy?n sang ??i m?i. V? tr? <strong>Slot #{myTeam.slotNumber}</strong> c?a b?n s? ???c gi?i ph?ng tr? th?nh 5 slot tr?ng.
            </span>
          </div>
        </div>

        {/* Pending Requests */}
        {pendingOutgoing.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Y?u c?u ?ang ch? duy?t ({pendingOutgoing.length})</span>
            </h4>
            <div className="space-y-2">
              {pendingOutgoing.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-amber-950/30 border border-amber-500/40 text-xs gap-2"
                >
                  <div className="min-w-0">
                    <span className="font-semibold text-amber-200 block truncate">
                      ?? g?i ??n {m.toTeamName} (Slot #{m.toSlotNumber})
                    </span>
                    <span className="text-[10px] text-amber-400/80 block">
                      ?ang ch? ??i di?n {m.toTeamName} ho?c Admin x?c nh?n
                    </span>
                  </div>
                  <button
                    onClick={() => handleCancel(m.id)}
                    disabled={cancellingId === m.id}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 font-medium text-xs transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {cancellingId === m.id ? '?ang h?y...' : 'H?y y?u c?u'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Eligible Teams List */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span>C?c ??i c?n ?? slot tr?ng ({eligibleTeams.length})</span>
          </h4>

          {eligibleTeams.length === 0 ? (
            <div className="p-5 rounded-xl bg-slate-950/50 border border-dashed border-slate-800 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
              <AlertCircle className="w-6 h-6 text-slate-600" />
              <span>Hi?n t?i kh?ng c? ??i n?o c? ?? s? slot tr?ng ?? ti?p nh?n {myCount} th?nh vi?n c?a ??i b?n (t?ng t?i ?a 5 ng??i/??i).</span>
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
                        <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950/80 text-sky-300 border border-sky-500/40 font-bold flex items-center gap-1">
                          <Users className="w-3 h-3 text-sky-400" />
                          C?n tr?ng {targetEmpty} slot
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Hi?n c?: <span className="text-slate-300">{target.members.length}/5 ng??i</span>
                        {' ? '}
                        Sau khi g?p: <span className="text-emerald-400 font-bold">{newTotal}/5 ng??i</span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        Ng??i ??i di?n: {target.ownerName}
                      </div>
                    </div>

                    <div className="w-full sm:w-auto shrink-0">
                      {isPending ? (
                        <span className="inline-flex items-center justify-center gap-1 w-full sm:w-auto text-center px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                          <Clock className="w-3 h-3" />
                          ?ang ch? duy?t
                        </span>
                      ) : (
                        <button
                          onClick={() => setConfirmTargetTeam(target)}
                          disabled={submittingToId === target.id}
                          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all text-center flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer border border-purple-500/30"
                        >
                          <HeartHandshake className="w-4 h-4" />
                          <span>G?i y?u c?u Match</span>
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
          <div className="absolute inset-0 z-10 p-5 bg-slate-900/95 backdrop-blur-md rounded-2xl flex flex-col justify-center animate-fade-in border border-purple-500/30">
            <h4 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-purple-400" />
              <span>X?c nh?n g?i y?u c?u Match?</span>
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              B?n c? ch?c ch?n mu?n g?i y?u c?u g?p <strong>{myTeam.name}</strong> ({myCount} ng??i) v?o <strong>{confirmTargetTeam.name}</strong> ({confirmTargetTeam.members.length}/5 ng??i)?
              <br /><br />
              Khi ???c ng??i ??i di?n {confirmTargetTeam.name} ho?c Admin ch?p nh?n, c?c th?nh vi?n s? chuy?n sang {confirmTargetTeam.name} v? Slot #{myTeam.slotNumber} s? ???c gi?i ph?ng.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmTargetTeam(null)}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
              >
                H?y b?
              </button>
              <button
                onClick={() => handleSend(confirmTargetTeam.id)}
                disabled={submittingToId === confirmTargetTeam.id}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submittingToId === confirmTargetTeam.id ? '?ang g?i...' : 'X?c nh?n g?i'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors cursor-pointer"
          >
            ??ng
          </button>
        </div>
      </div>
    </div>
  );
};
