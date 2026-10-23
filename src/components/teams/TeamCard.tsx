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
              {/* Member count & Owner info */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <div className="text-[11px] text-slate-400 truncate">
                  Người đại diện: <span className="text-slate-200 font-medium">{team.ownerName}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 shrink-0 font-medium">
                  {team.members.length}/5 người
                </span>
              </div>

              {/* Members Section */}
              <div className="bg-slate-950/80 rounded-xl p-3 border border-slate-800 mb-4">
                <div className="flex items-center justify-between mb-2 text-xs">
                  <span className="font-medium text-slate-300">
                    Danh sách thành viên
                  </span>
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {team.members.length < 5 ? `Còn thiếu ${5 - team.members.length} slot` : 'Đã đủ đội hình'}
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