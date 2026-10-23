'use client';

import React from 'react';
import { Team, User, Role } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Badge } from '@/components/ui/Badge';
import { Users, Edit3, ShieldAlert, Sparkles, CheckCircle2, UserCheck, Lock } from 'lucide-react';

interface TeamCardProps {
  slotNumber: number;
  team?: Team;
  currentUser: User | null;
  currentRole: Role;
  ownedTeamId?: string;
  onRegisterClick: (slotNumber: number) => void;
  onEditClick: (team: Team) => void;
  onAdminClick: (team: Team) => void;
  onLoginPrompt: () => void;
}

export const TeamCard: React.FC<TeamCardProps> = ({
  slotNumber,
  team,
  currentUser,
  currentRole,
  ownedTeamId,
  onRegisterClick,
  onEditClick,
  onAdminClick,
  onLoginPrompt
}) => {
  const meta = SLOT_METADATA.find((m) => m.slotNumber === slotNumber) || SLOT_METADATA[0];
  const isRegistered = !!team;
  const isMyTeam = isRegistered && (team.ownerId === currentUser?.id || team.id === ownedTeamId);
  const userAlreadyOwnsTeam = !!ownedTeamId || (currentRole === 'OWNER');

  return (
    <div
      className={`group relative rounded-2xl sm:rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isMyTeam
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 border-2 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
          : isRegistered
          ? 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-lg shadow-black/40 hover:-translate-y-1'
          : 'bg-slate-950/60 border-2 border-dashed border-slate-800 hover:border-red-500/50 hover:bg-slate-900/40 shadow-sm'
      }`}
    >
      {/* Top Banner Accent */}
      <div
        className={`h-2 sm:h-2.5 w-full bg-gradient-to-r ${meta.accentColor} ${
          !isRegistered ? 'opacity-30 group-hover:opacity-100 transition-opacity' : ''
        }`}
      />

      <div className="p-4 sm:p-6 flex-1 flex flex-col">
        {/* Header: Slot Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm tracking-wider shrink-0 ${
                isMyTeam
                  ? 'bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-md shadow-amber-500/20'
                  : isRegistered
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-600/20'
                  : 'bg-slate-800 text-slate-400 group-hover:text-red-400 transition-colors'
              }`}
            >
              0{slotNumber}
            </span>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-slate-400 block truncate">
                Slot #{slotNumber}
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400 font-medium truncate block">
                {meta.badgeTitle}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {isMyTeam ? (
              <Badge variant="my-team">
                <Sparkles className="w-3 h-3 text-amber-400 mr-0.5" />
                Đội của bạn
              </Badge>
            ) : isRegistered ? (
              <Badge variant="registered">
                <CheckCircle2 className="w-3 h-3 text-red-400 mr-0.5" />
                Đã ghi danh
              </Badge>
            ) : (
              <Badge variant="available">
                Còn trống
              </Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isRegistered ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Team Name */}
              <h4 className="text-lg sm:text-2xl font-black text-white tracking-tight mb-1.5 group-hover:text-red-400 transition-colors break-words">
                {team.name}
              </h4>
              <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5 truncate">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">Đội trưởng: <strong className="text-slate-200 font-semibold">{team.ownerName}</strong></span>
              </p>

              {/* Members Section (Publicly Visible as requested) */}
              <div className="bg-slate-950/60 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-slate-800/80 mb-5">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-red-400 shrink-0" />
                    Thành viên ({team.members.length}/5)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Công khai
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member) => (
                    <span
                      key={member.id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg text-[11px] sm:text-xs bg-slate-900 border border-slate-800 text-slate-200 max-w-full break-words"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                      <span className="font-medium truncate">{member.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Registered Timestamp & Actions */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400 gap-2">
              <span className="text-[11px] sm:text-xs truncate">Đăng ký: {team.registeredAt}</span>

              {isMyTeam && (
                <button
                  onClick={() => onEditClick(team)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Sửa
                </button>
              )}

              {currentRole === 'ADMIN' && !isMyTeam && (
                <button
                  onClick={() => onAdminClick(team)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition-colors shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Admin
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Available Empty State */
          <div className="flex-1 flex flex-col justify-between py-2 sm:py-3">
            <div>
              <h4 className="text-base sm:text-lg font-bold text-slate-300 mb-1.5 group-hover:text-white transition-colors">
                Slot sẵn sàng đón chào đội mới
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 italic break-words">
                "{meta.motto}"
              </p>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="leading-snug">Yêu cầu: 1 đội trưởng + 2 đến 4 thành viên (3 - 5 người).</span>
              </div>
            </div>

            {/* Available State CTA Button */}
            <div className="pt-4 sm:pt-6">
              {currentRole === 'GUEST' ? (
                <button
                  onClick={onLoginPrompt}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl font-semibold text-xs sm:text-sm bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-sm flex items-center justify-center gap-2 group-hover:bg-red-600"
                >
                  Đăng nhập để đăng ký Slot #{slotNumber}
                </button>
              ) : userAlreadyOwnsTeam ? (
                <div className="w-full py-2 px-3 rounded-xl text-center bg-slate-900/70 border border-slate-800 text-[11px] sm:text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 shrink-0" />
                  Bạn đã có đội (Tối đa 1 đội/tài khoản)
                </div>
              ) : (
                <button
                  onClick={() => onRegisterClick(slotNumber)}
                  className="w-full py-2.5 sm:py-3 px-3 rounded-xl font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  Đăng ký vào Vị trí #{slotNumber}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
