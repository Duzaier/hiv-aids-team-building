'use client';

import React from 'react';
import { Team, User, Role, TeamMatchRequest } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Badge } from '@/components/ui/Badge';
import {
  Shield,
  Users,
  User as UserIcon,
  Sparkles,
  Clock,
  HeartHandshake,
  Pencil,
  PlusCircle,
  CheckCircle2,
  Check,
  X
} from 'lucide-react';

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
      className={`relative rounded-2xl transition-all duration-300 flex flex-col justify-between overflow-hidden backdrop-blur-sm ${
        isMyTeam
          ? 'bg-slate-900/95 border-2 border-amber-500/80 shadow-xl shadow-amber-500/10'
          : isRegistered
          ? 'bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/90 shadow-lg hover:shadow-xl'
          : 'bg-slate-950/60 border border-dashed border-slate-800 hover:border-rose-500/50 hover:bg-slate-900/40 transition-colors'
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
              className={`inline-flex items-center justify-center w-7 h-7 rounded-lg font-black text-xs shrink-0 shadow-sm ${
                isMyTeam
                  ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold'
                  : isRegistered
                  ? 'bg-gradient-to-br from-rose-600 to-red-600 text-white font-bold'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/50'
              }`}
            >
              0{slotNumber}
            </span>
            <div className="min-w-0 flex items-center gap-1.5">
              <Shield className={`w-3.5 h-3.5 shrink-0 ${isRegistered ? 'text-rose-500' : 'text-slate-500'}`} />
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-white block truncate">
                ??I {slotNumber}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isRegistered ? (
              <>
                {remainingSlots > 0 ? (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-sky-950/80 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                    <Users className="w-3 h-3 text-sky-400" />
                    <span>Tr?ng {remainingSlots} slot</span>
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>?? 5/5</span>
                  </span>
                )}
                {isMyTeam ? (
                  <Badge variant="my-team">??i c?a b?n</Badge>
                ) : (
                  <Badge variant="registered">?? ghi danh</Badge>
                )}
              </>
            ) : (
              <Badge variant="available">C?n tr?ng</Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isRegistered ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Member count & Owner info */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="text-[11px] text-slate-400 truncate flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-slate-500 shrink-0" />
                  <span>
                    Ng??i ??i di?n: <strong className="text-slate-200 font-semibold">{team.ownerName}</strong>
                  </span>
                </div>
              </div>

              {/* Members Section */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800/90 mb-3">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>Danh s?ch th?nh vi?n ({team.members.length}/5)</span>
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member) => (
                    <span
                      key={member.id}
                      className={`px-2.5 py-1 rounded-md text-[11px] max-w-full truncate transition-all flex items-center gap-1.5 ${
                        member.isFromIndividual
                          ? 'bg-purple-950/60 text-purple-300 border border-purple-500/50 font-medium'
                          : 'bg-slate-900 border border-slate-800 text-slate-300'
                      }`}
                    >
                      <span>{member.name}</span>
                      {member.isFromIndividual && (
                        <span className="text-[9px] px-1 py-0.2 rounded bg-purple-500/30 text-purple-200 flex items-center gap-0.5 border border-purple-400/30">
                          <Sparkles className="w-2.5 h-2.5 text-purple-300" />
                          Gh?p
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>

              {/* Outgoing Match Request Alert */}
              {outgoingMatch && (
                <div className="mb-3 p-2.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-start gap-2">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
                    <div className="min-w-0">
                      <span className="font-semibold text-amber-200 block truncate">
                        ?ang g?i y?u c?u g?p sang {outgoingMatch.toTeamName}
                      </span>
                      <span className="text-[10px] text-amber-400/80 block">
                        ?ang ch? ??i di?n {outgoingMatch.toTeamName} ho?c Admin x?c nh?n
                      </span>
                    </div>
                  </div>
                  {isMyTeam && onCancelMatch && (
                    <button
                      onClick={() => onCancelMatch(outgoingMatch.id)}
                      className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-300 text-[10px] border border-rose-500/30 font-semibold shrink-0 transition-colors cursor-pointer"
                    >
                      H?y
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
                          <HeartHandshake className="w-4 h-4 text-purple-400 shrink-0" />
                          <span>Y?u c?u g?p t? {m.fromTeamName}</span>
                        </span>
                        <span className="text-[10px] text-purple-200 bg-purple-900/80 px-2 py-0.5 rounded font-bold shrink-0">
                          +{m.fromMembersCount} ng??i
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed mb-2.5">
                        {m.fromTeamName} mu?n chuy?n <strong>{m.fromMembersCount} ng??i</strong> sang {team.name} (??t t?ng <strong>{team.members.length + m.fromMembersCount}/5</strong> th?nh vi?n). Slot #{m.fromSlotNumber} s? ???c gi?i ph?ng th?nh 5 slot tr?ng.
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onAcceptMatch && onAcceptMatch(m.id)}
                          className="flex-1 py-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors text-center flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Ch?p nh?n g?p</span>
                        </button>
                        <button
                          onClick={() => onRejectMatch && onRejectMatch(m.id)}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>T? ch?i</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bottom Meta & Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
              <span className="text-[11px] truncate">??ng k?: {team.registeredAt}</span>

              <div className="flex items-center gap-1.5 flex-wrap">
                {/* Match Team Button: if isMyTeam and team not full */}
                {isMyTeam && remainingSlots > 0 && onOpenMatchModal && (
                  <button
                    onClick={() => onOpenMatchModal(team)}
                    className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-purple-600/30 to-indigo-600/30 hover:from-purple-600/40 hover:to-indigo-600/40 text-purple-300 border border-purple-500/50 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
                    <span>G?p ??i</span>
                  </button>
                )}

                {/* Quick Match into this team if my team fits */}
                {canMyTeamFitHere && onOpenMatchModal && myOwnedTeam && (
                  <button
                    onClick={() => onOpenMatchModal(myOwnedTeam)}
                    className="px-2.5 py-1 rounded-lg bg-purple-950 hover:bg-purple-900 text-purple-200 border border-purple-500/50 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <HeartHandshake className="w-3.5 h-3.5 text-purple-200" />
                    <span>Xin G?p V?o</span>
                  </button>
                )}

                {isMyTeam && (
                  <button
                    onClick={() => onEditClick(team)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil className="w-3 h-3" />
                    <span>Ch?nh s?a</span>
                  </button>
                )}

                {currentRole === 'ADMIN' && !isMyTeam && (
                  <button
                    onClick={() => onAdminClick(team)}
                    className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <Shield className="w-3 h-3" />
                    <span>Qu?n l? Admin</span>
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
                <div className="w-full py-2.5 px-3 rounded-xl text-center bg-slate-900/90 border border-slate-800 text-xs text-slate-400 font-medium">
                  T?i kho?n ?? c? ??i
                </div>
              ) : (
                <button
                  onClick={() => (currentRole === 'GUEST' ? onLoginPrompt() : onRegisterClick(slotNumber))}
                  className="w-full py-2.5 px-3 rounded-xl font-bold text-xs bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-md shadow-rose-600/25 transition-all text-center uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer border border-rose-500/30"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>??NG K?</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
