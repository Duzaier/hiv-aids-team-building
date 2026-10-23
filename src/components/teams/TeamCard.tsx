'use client';

import React from 'react';
import { Team, User, Role, TeamMatchRequest } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Badge } from '@/components/ui/Badge';

interface TeamCardProps {
  slotNumber: number;
  team?: Team;
  currentUser: User | null;
  currentRole: Role;
  ownedTeamId?: string;
  myOwnedTeam?: Team | null;
  matches?: TeamMatchRequest[];
  onRegisterClick: (slotNumber: number) => void;
  onEditClick: (team: Team) => void;
  onAdminClick: (team: Team) => void;
  onLoginPrompt: () => void;
  onOpenMatchModal?: (team: Team) => void;
  onAcceptMatch?: (matchId: string) => void;
  onRejectMatch?: (matchId: string) => void;
  onCancelMatch?: (matchId: string) => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  slotNumber,
  team,
  currentUser,
  currentRole,
  ownedTeamId,
  myOwnedTeam,
  matches = [],
  onRegisterClick,
  onEditClick,
  onAdminClick,
  onLoginPrompt,
  onOpenMatchModal,
  onAcceptMatch,
  onRejectMatch,
  onCancelMatch
}) => {
  const meta = SLOT_METADATA.find((m) => m.slotNumber === slotNumber) || SLOT_METADATA[0];
  const isRegistered = !!team;
  const isMyTeam = isRegistered && (team.ownerId === currentUser?.id || team.id === ownedTeamId);
  const userAlreadyOwnsTeam = !!ownedTeamId || (currentRole === 'OWNER');

  const remainingSlots = isRegistered ? 5 - team.members.length : 5;

  // Incoming matches waiting for this team to accept
  const incomingMatches = isRegistered
    ? matches.filter((m) => m.toTeamId === team.id && m.status === 'PENDING')
    : [];

  // Outgoing match sent by this team
  const outgoingMatch = isRegistered
    ? matches.find((m) => m.fromTeamId === team.id && m.status === 'PENDING')
    : null;

  // Can the current user's team merge into this team?
  const canMyTeamFitHere =
    isRegistered &&
    !isMyTeam &&
    myOwnedTeam &&
    myOwnedTeam.members.length + team.members.length <= 5;

  return (
    <div
      className={`relative rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isMyTeam
          ? 'bg-slate-900 border-2 border-amber-500/80 shadow-lg'
          : isRegistered
          ? 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-md'
          : 'bg-slate-950/60 border border-dashed border-slate-800 hover:border-red-500/50'
      }`}
    >
      {/* Top Banner Accent Line */}
      <div
        className={`h-1.5 w-full bg-gradient-to-r ${meta.accentColor} ${
          !isRegistered ? 'opacity-30' : ''
        }`}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header: Slot Number & Status & Remaining Slots */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs shrink-0 ${
                isMyTeam
                  ? 'bg-amber-500 text-slate-950 font-bold'
                  : isRegistered
                  ? 'bg-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              0{slotNumber}
            </span>
            <div className="min-w-0">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white block truncate">
                ĐỘI {slotNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isRegistered ? (
              <>
                {remainingSlots > 0 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                    Trống {remainingSlots} slot
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                    Đủ 5/5
                  </span>
                )}
                {isMyTeam ? (
                  <Badge variant="my-team">Đội của bạn</Badge>
                ) : (
                  <Badge variant="registered">Đã ghi danh</Badge>
                )}
              </>
            ) : (
              <Badge variant="available">Còn trống</Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isRegistered ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Member count & Owner info */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="text-[11px] text-slate-400 truncate">
                  Người đại diện: <span className="text-slate-200 font-medium">{team.ownerName}</span>
                </div>
              </div>

              {/* Members Section */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-3">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-slate-300">
                    Danh sách thành viên
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member) => (
                    <span
                      key={member.id}
                      className={`px-2.5 py-1 rounded-md text-[11px] max-w-full truncate transition-all flex items-center gap-1.5 ${
                        member.isFromIndividual
                          ? 'bg-purple-950/50 text-purple-300 border border-purple-500/40 font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{member.name}</span>
                      {member.isFromIndividual && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/30 text-purple-200">
                          Ghép
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outgoing Match Request Alert */}
              {outgoingMatch && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <span className="font-semibold text-amber-200 block truncate">
                      ⏳ Đang gửi yêu cầu gộp sang {outgoingMatch.toTeamName}
                    </span>
                    <span className="text-[10px] text-amber-400/80 block">
                      Đang chờ đại diện {outgoingMatch.toTeamName} hoặc Admin xác nhận
                    </span>
                  </div>
                  {isMyTeam && onCancelMatch && (
                    <button
                      onClick={() => onCancelMatch(outgoingMatch.id)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] border border-rose-500/30 font-semibold shrink-0 transition-colors"
                    >
                      Hủy
                    </button>
                  )}
                </div>
              )}

              {/* Incoming Match Requests (Visible to Team Owner & Admin) */}
              {incomingMatches.length > 0 && (isMyTeam || currentRole === 'ADMIN') && (
                <div className="mb-3 space-y-2">
                  {incomingMatches.map((m) => (
                    <div
                      key={m.id}
                      className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-xs animate-fade-in"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-purple-300 flex items-center gap-1.5 truncate">
                          🤝 Yêu cầu gộp từ {m.fromTeamName}
                        </span>
                        <span className="text-[10px] text-purple-200 bg-purple-900/80 px-2 py-0.5 rounded font-bold shrink-0">
                          +{m.fromMembersCount} người
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                        {m.fromTeamName} muốn chuyển <strong>{m.fromMembersCount} người</strong> sang {team.name} (đạt tổng <strong>{team.members.length + m.fromMembersCount}/5</strong> thành viên). Slot #{m.fromSlotNumber} sẽ được giải phóng thành 5 slot trống.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAcceptMatch && onAcceptMatch(m.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors text-center"
                        >
                          ✓ Chấp nhận gộp
                        </button>
                        <button
                          onClick={() => onRejectMatch && onRejectMatch(m.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors shrink-0"
                        >
                          ✕ Từ chối
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Meta & Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="text-[11px] truncate">Đăng ký: {team.registeredAt}</span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Match Team Button: if isMyTeam and team not full */}
                {isMyTeam && remainingSlots > 0 && onOpenMatchModal && (
                  <button
                    onClick={() => onOpenMatchModal(team)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-300 border border-purple-500/50 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    🤝 Gộp Đội
                  </button>
                )}

                {/* Quick Match into this team if my team fits */}
                {canMyTeamFitHere && onOpenMatchModal && myOwnedTeam && (
                  <button
                    onClick={() => onOpenMatchModal(myOwnedTeam)}
                    className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1"
                  >
                    🤝 Xin Gộp Vào
                  </button>
                )}

                {isMyTeam && (
                  <button
                    onClick={() => onEditClick(team)}
                    className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors shrink-0"
                  >
                    Chỉnh sửa
                  </button>
                )}

                {currentRole === 'ADMIN' && !isMyTeam && (
                  <button
                    onClick={() => onAdminClick(team)}
                    className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition-colors shrink-0"
                  >
                    Quản lý Admin
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Available Empty State */
          <div className="flex-1 flex flex-col justify-end pt-12 pb-1">
            {/* CTA Button */}
            <div>
              {userAlreadyOwnsTeam ? (
                <div className="w-full py-2.5 px-3 rounded-xl text-center bg-slate-900 border border-slate-800 text-xs text-slate-400 font-medium">
                  Tài khoản đã có đội
                </div>
              ) : (
                <button
                  onClick={() => (currentRole === 'GUEST' ? onLoginPrompt() : onRegisterClick(slotNumber))}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-sm transition-colors text-center uppercase tracking-wider"
                >
                  ĐĂNG KÝ
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};