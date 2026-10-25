'use client';

import React, { useState } from 'react';
import { Team, User, Role, TeamMatchRequest } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Users,
  User as UserIcon,
  Clock,
  HeartHandshake,
  Pencil,
  PlusCircle,
  CheckCircle2,
  Check,
  X,
  Eye,
  Trash2,
  Lock
} from 'lucide-react';

interface TeamCardProps {
  slotNumber: number;
  team?: Team;
  currentUser: User | null;
  currentRole: Role;
  ownedTeamId?: string;
  joinedTeamId?: string;
  myOwnedTeam?: Team | null;
  matches?: TeamMatchRequest[];
  isCapacityFull?: boolean;
  onRegisterClick: (slotNumber: number) => void;
  onEditClick: (team: Team) => void;
  onViewDetails?: (team: Team) => void;
  onAdminClick: (team: Team) => void;
  onDeleteTeam?: (team: Team) => void;
  onAdminDirectMerge?: (team: Team) => void;
  onLoginPrompt: () => void;
  onOpenMatchModal?: (team: Team, targetTeam?: Team) => void;
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
  joinedTeamId,
  myOwnedTeam,
  matches = [],
  isCapacityFull = false,
  onRegisterClick,
  onEditClick,
  onViewDetails,
  onAdminClick,
  onDeleteTeam,
  onAdminDirectMerge,
  onLoginPrompt,
  onOpenMatchModal,
  onAcceptMatch,
  onRejectMatch,
  onCancelMatch
}) => {
  const meta = SLOT_METADATA.find((m) => m.slotNumber === slotNumber) || SLOT_METADATA[0];
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'ACCEPT' | 'REJECT' | 'CANCEL' | null>(null);

  const handleAcceptMatch = async (matchId: string) => {
    if (!onAcceptMatch || processingMatchId) return;
    try {
      setProcessingMatchId(matchId);
      setProcessingAction('ACCEPT');
      await onAcceptMatch(matchId);
    } finally {
      setProcessingMatchId(null);
      setProcessingAction(null);
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!onRejectMatch || processingMatchId) return;
    try {
      setProcessingMatchId(matchId);
      setProcessingAction('REJECT');
      await onRejectMatch(matchId);
    } finally {
      setProcessingMatchId(null);
      setProcessingAction(null);
    }
  };

  const handleCancelMatch = async (matchId: string) => {
    if (!onCancelMatch || processingMatchId) return;
    try {
      setProcessingMatchId(matchId);
      setProcessingAction('CANCEL');
      await onCancelMatch(matchId);
    } finally {
      setProcessingMatchId(null);
      setProcessingAction(null);
    }
  };
  const isRegistered = !!team;
  const isTeamCaptain = isRegistered && (team.ownerId === currentUser?.id || team.id === ownedTeamId);
  const isTeamMember =
    isRegistered &&
    !!currentUser &&
    (team.id === joinedTeamId ||
      team.members.some(
        (m) =>
          currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase()
      ));
  const isMyTeam = isTeamCaptain || isTeamMember;

  // Người đại diện: ưu tiên tên thành viên nhập trong khung họ tên (thành viên trùng email hoặc thành viên #1 / đội trưởng)
  const representativeName = isRegistered
    ? team.members.find((m) => m.isCaptain)?.name ||
      team.captainName?.trim() ||
      (team.ownerEmail ? team.members.find((m) => m.email && m.email.toLowerCase() === team.ownerEmail.toLowerCase())?.name : null) ||
      team.members[0]?.name ||
      team.ownerName
    : '';
  const userAlreadyOwnsTeam = !!ownedTeamId || (currentRole === 'OWNER') || isTeamMember;

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
      className={`relative group rounded-2xl transition-all duration-200 flex flex-col justify-between overflow-hidden ${
        isMyTeam
          ? 'bg-slate-900 border-2 border-amber-500/80 shadow-lg'
          : isRegistered
          ? 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-md'
          : 'bg-slate-950/60 border border-dashed border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/40 transition-colors'
      }`}
    >
      {/* Top Banner Accent Line */}
      <div
        className={`h-1.5 w-full ${meta.accentColor} ${
          !isRegistered ? 'opacity-40' : ''
        }`}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Header: Team & Status & Remaining Slots */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 group-hover:scale-105 ${
                isMyTeam
                  ? 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-xs'
                  : isRegistered
                  ? 'bg-red-500/15 text-red-400 border-red-500/30 shadow-xs'
                  : 'bg-slate-900/90 text-slate-400 border-slate-800'
              }`}
            >
              <Shield className="w-5 h-5 shrink-0 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-wide text-white block truncate">
                {team ? team.name : `ĐỘI ${slotNumber}`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isRegistered ? (
              isMyTeam ? (
                <Badge variant="my-team">
                  {isTeamCaptain ? 'Đội của bạn' : 'Đội bạn tham gia'}
                </Badge>
              ) : (
                <Badge variant="registered">Đã ghi danh</Badge>
              )
            ) : isCapacityFull ? (
              <Badge variant="warning">Đã khóa</Badge>
            ) : (
              <Badge variant="available">Còn trống</Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isRegistered ? (
          <div className="flex-1 flex flex-col justify-between">
            {isMyTeam || currentRole === 'ADMIN' ? (
              <div>
                {/* Member count & Owner info (chỉ hiển thị cho đội của mình hoặc Admin) */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400 truncate">
                    <UserIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Người đại diện: <strong className="text-slate-200 font-semibold">{representativeName}</strong></span>
                  </div>
                </div>

                {/* Members Section (chỉ hiển thị cho đội của mình hoặc Admin) */}
                <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-3">
                  <div className="flex items-center justify-between mb-2 text-xs">
                    <span className="font-medium text-slate-300">
                      Danh sách thành viên ({team.members.length}/5)
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
                        {member.isCaptain && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 flex items-center gap-0.5">
                            👑 Đội trưởng
                          </span>
                        )}
                        {member.isFromIndividual && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-900/50 text-purple-300 font-medium tracking-wide border border-purple-500/30">
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
                        Đang gửi yêu cầu xin tham gia sang {outgoingMatch.toTeamName}
                      </span>
                      <span className="text-[10px] text-amber-400/80 block">
                        Đang chờ đại diện {outgoingMatch.toTeamName} hoặc Admin xác nhận
                      </span>
                    </div>
                    {isMyTeam && onCancelMatch && (
                      <button
                        onClick={() => handleCancelMatch(outgoingMatch.id)}
                        disabled={processingMatchId === outgoingMatch.id}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] border border-rose-500/30 font-semibold shrink-0 transition-colors disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                      >
                        {processingMatchId === outgoingMatch.id && processingAction === 'CANCEL' ? (
                          <>
                            <span className="w-2.5 h-2.5 border-2 border-rose-300/30 border-t-rose-300 rounded-full animate-spin" />
                            <span>Đang hủy...</span>
                          </>
                        ) : (
                          <span>Hủy</span>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Incoming Match Requests (Visible to Team Owner & Admin) */}
                {incomingMatches.length > 0 && isMyTeam && currentRole !== 'ADMIN' && (
                  <div className="mb-3 space-y-2">
                    {incomingMatches.map((m) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-xl bg-purple-950/60 border border-purple-500/50 text-xs animate-fade-in"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-purple-300 flex items-center gap-1.5 truncate">
                            <HeartHandshake className="w-4 h-4 text-purple-400 shrink-0" />
                            <span>Yêu cầu xin tham gia từ {m.fromTeamName}</span>
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
                            onClick={() => handleAcceptMatch(m.id)}
                            disabled={!!processingMatchId}
                            className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors text-center flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            {processingMatchId === m.id && processingAction === 'ACCEPT' ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                <span>Đang chấp nhận...</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Chấp nhận</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleRejectMatch(m.id)}
                            disabled={!!processingMatchId}
                            className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            {processingMatchId === m.id && processingAction === 'REJECT' ? (
                              <>
                                <span className="w-3.5 h-3.5 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
                                <span>Đang từ chối...</span>
                              </>
                            ) : (
                              <>
                                <X className="w-3.5 h-3.5" />
                                <span>Từ chối</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Đội của người khác / Khách: Chỉ thấy thanh UI slot kiểm tra có đầy chưa */
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-medium">Trạng thái slot thành viên</span>
                    <span className={team.members.length >= 5 ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                      {team.members.length >= 5 ? "Đã đủ 5/5 thành viên" : `Còn trống ${5 - team.members.length} slot`}
                    </span>
                  </div>

                  {/* 5-slot visual progress indicator bar */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[1, 2, 3, 4, 5].map((slotIdx) => {
                      const isFilled = slotIdx <= team.members.length;
                      return (
                        <div
                          key={slotIdx}
                          className={`h-2.5 rounded-full transition-all ${
                            isFilled
                              ? 'bg-rose-500 shadow-xs shadow-rose-500/30 border border-rose-400/50'
                              : 'bg-slate-800 border border-slate-700/60'
                          }`}
                          title={isFilled ? `Slot #${slotIdx}: Đã có người ghi danh` : `Slot #${slotIdx}: Còn trống`}
                        />
                      );
                    })}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>Đã ghi danh: <strong className="text-slate-300 font-semibold">{team.members.length}/5</strong></span>
                    <span>Tối đa: <strong className="text-slate-300 font-semibold">5 thành viên</strong></span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Meta & Actions (only rendered if there is content/actions) */}
            {(isMyTeam || currentRole === 'ADMIN' || (canMyTeamFitHere && onOpenMatchModal && myOwnedTeam) || (isTeamMember && !isTeamCaptain)) && (
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              {(isMyTeam || currentRole === 'ADMIN') ? (
                <span className="text-[11px] text-slate-400 truncate">Đăng ký: {team.registeredAt}</span>
              ) : null}

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Quick Match into this team if my team fits */}
                {canMyTeamFitHere && onOpenMatchModal && myOwnedTeam && (
                  <button
                    onClick={() => onOpenMatchModal(myOwnedTeam, team)}
                    className="px-2.5 py-1.5 rounded-lg bg-purple-950/80 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
                    <span>Xin Tham Gia</span>
                  </button>
                )}

                {/* Member who joined/randomized: View roster & edit personal info */}
                {isTeamMember && !isTeamCaptain && (
                  <button
                    onClick={() => (onViewDetails ? onViewDetails(team) : onEditClick(team))}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>Xem chi tiết đội</span>
                  </button>
                )}

                {/* Team Captain: Edit full team or view roster */}
                {isTeamCaptain && currentRole !== 'ADMIN' && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {team.members.length < 5 && onOpenMatchModal && (
                      <button
                        onClick={() => onOpenMatchModal(team)}
                        className="px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
                        title="Gửi yêu cầu xin tham gia đội khác"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
                        <span>Xin tham gia</span>
                      </button>
                    )}
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(team)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Xem thông tin thành viên"
                      >
                        <Eye className="w-3 h-3 text-slate-400" />
                        <span>Chi tiết</span>
                      </button>
                    )}
                    <button
                      onClick={() => onEditClick(team)}
                      className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                  </div>
                )}

                {currentRole === 'ADMIN' && (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {onViewDetails && (
                      <button
                        onClick={() => onViewDetails(team)}
                        className="group px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 font-semibold text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Xem chi tiết thành viên"
                      >
                        <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 group-hover:scale-110 transition-all duration-200" />
                        <span>Chi tiết</span>
                      </button>
                    )}
                    {team.members.length < 5 && onAdminDirectMerge && (
                      <button
                        onClick={() => onAdminDirectMerge(team)}
                        className="group px-2.5 py-1.5 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 hover:text-purple-100 border border-purple-500/30 active:scale-95 font-semibold text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Gộp đội này sang đội khác trực tiếp"
                      >
                        <HeartHandshake className="w-3.5 h-3.5 text-purple-300 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200" />
                        <span>Gộp</span>
                      </button>
                    )}
                    <button
                      onClick={() => onAdminClick(team)}
                      className="group px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 active:scale-95 font-semibold text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                      title="Chỉnh sửa thông tin đội"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-300 group-hover:-rotate-12 transition-all duration-200" />
                      <span>Sửa</span>
                    </button>
                    {onDeleteTeam && (
                      <button
                        onClick={() => onDeleteTeam(team)}
                        className="group px-2.5 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-rose-100 border border-rose-500/30 active:scale-95 font-semibold text-xs transition-all shrink-0 flex items-center gap-1 cursor-pointer"
                        title="Xóa đội và giải phóng slot này"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 group-hover:rotate-6 transition-all duration-200" />
                        <span>Xóa</span>
                      </button>
                    )}
                  </div>
                )}


              </div>
            </div>
            )}
          </div>
        ) : (
          /* Available Empty State with balanced height and helpful UI */
          <div className="flex-1 flex flex-col justify-between pt-4 pb-1 min-h-[170px]">
            <div>
              {/* 5 Slot visual indicator */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Trạng thái vị trí</span>
                  <span className="text-emerald-400 font-semibold">Còn trống 5 thành viên</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {[1, 2, 3, 4, 5].map((slotIndex) => (
                    <div
                      key={slotIndex}
                      className="h-2 rounded-full bg-slate-800 border border-slate-700/50"
                      title={`Vị trí thành viên ${slotIndex} còn trống`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <div>
              {isCapacityFull ? (
                <div className="w-full py-2.5 px-3 rounded-xl text-center bg-slate-900/90 border border-slate-800 text-xs text-rose-400 font-semibold flex items-center justify-center gap-1.5 shadow-xs">
                  <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>Đã đủ 30 người (Khóa đăng ký)</span>
                </div>
              ) : userAlreadyOwnsTeam ? (
                <div className="w-full py-2.5 px-3 rounded-xl text-center bg-slate-900 border border-slate-800 text-xs text-slate-400 font-medium">
                  Bạn đã đăng ký 1 đội thi đấu
                </div>
              ) : (
                <button
                  onClick={() => (currentRole === 'GUEST' ? onLoginPrompt() : onRegisterClick(slotNumber))}
                  className="group w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white shadow-sm transition-all duration-150 text-center uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <PlusCircle className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:rotate-90" />
                  <span>Đăng Ký Đội Này</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};