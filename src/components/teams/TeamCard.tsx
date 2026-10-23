'use client';

import React from 'react';
import { Team, User, Role } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Badge } from '@/components/ui/Badge';

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

  const displayCaptain = team ? (team.captainName || team.ownerName) : '';

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
        {/* Header: Slot Number & Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
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
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block truncate">
                Slot #{slotNumber}
              </span>
              <span className="text-[11px] text-slate-400 truncate block">
                {meta.badgeTitle}
              </span>
            </div>
          </div>

          <div className="shrink-0">
            {isMyTeam ? (
              <Badge variant="my-team">Đội của bạn</Badge>
            ) : isRegistered ? (
              <Badge variant="registered">Đã ghi danh</Badge>
            ) : (
              <Badge variant="available">Còn trống</Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isRegistered ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Team Name */}
              <h4 className="text-base sm:text-xl font-bold text-white tracking-tight mb-1 break-words">
                {team.name}
              </h4>
              
              {/* Captain & Owner info */}
              <div className="mb-3 text-xs space-y-0.5">
                <p className="text-slate-300">
                  Đội trưởng: <strong className="text-amber-400 font-bold">{displayCaptain}</strong>
                </p>
                {team.ownerName && team.ownerName.toLowerCase().trim() !== displayCaptain.toLowerCase().trim() && (
                  <p className="text-[11px] text-slate-500">
                    Người đăng ký: {team.ownerName}
                  </p>
                )}
              </div>

              {/* Members Section (Clean typographic pills, clearly highlighting Captain) */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-4">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-slate-300">
                    Thành viên ({team.members.length}/5)
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    Công khai
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member) => {
                    const isCap =
                      member.isCaptain ||
                      member.name.toLowerCase().trim() === displayCaptain.toLowerCase().trim();

                    return (
                      <span
                        key={member.id}
                        className={`px-2.5 py-0.5 rounded-md text-[11px] max-w-full truncate transition-all ${
                          isCap
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold'
                            : 'bg-slate-900 border border-slate-800 text-slate-300'
                        }`}
                      >
                        {member.name} {isCap ? '(Đội trưởng)' : ''}
                      </span>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom Meta & Actions */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 gap-2">
              <span className="text-[11px] truncate">Đăng ký: {team.registeredAt}</span>

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
        ) : (
          /* Available Empty State */
          <div className="flex-1 flex flex-col justify-between py-2">
            <div>
              <h4 className="text-sm sm:text-base font-semibold text-slate-300 mb-1">
                Vị trí sẵn sàng nhận đăng ký
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-3 italic break-words">
                "{meta.motto}"
              </p>

              <p className="text-[11px] text-slate-500 bg-slate-950 p-2.5 rounded-lg border border-slate-800/60">
                Quy định: 1 đội trưởng + 2 đến 4 thành viên (tổng 3 - 5 người). Người đăng ký có thể tự chọn đội trưởng là bất kỳ ai trong đội.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-4">
              {currentRole === 'GUEST' ? (
                <button
                  onClick={onLoginPrompt}
                  className="w-full py-2 px-3 rounded-lg font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  Đăng nhập để đăng ký Slot #{slotNumber}
                </button>
              ) : userAlreadyOwnsTeam ? (
                <div className="w-full py-2 px-3 rounded-lg text-center bg-slate-900 border border-slate-800 text-[11px] text-slate-400">
                  Tài khoản đã có đội
                </div>
              ) : (
                <button
                  onClick={() => onRegisterClick(slotNumber)}
                  className="w-full py-2 px-3 rounded-lg font-bold text-xs bg-red-600 hover:bg-red-500 text-white shadow-sm transition-colors"
                >
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
