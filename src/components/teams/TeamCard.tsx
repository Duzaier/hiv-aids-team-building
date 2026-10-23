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
      className={`group relative rounded-3xl transition-all duration-300 flex flex-col justify-between overflow-hidden ${
        isMyTeam
          ? 'bg-gradient-to-b from-slate-900 via-slate-900 to-red-950/40 border-2 border-amber-500 shadow-xl shadow-amber-500/10 ring-2 ring-amber-500/30'
          : isRegistered
          ? 'bg-slate-900/90 border border-slate-800 hover:border-slate-700 shadow-lg shadow-black/40 hover:-translate-y-1'
          : 'bg-slate-950/60 border-2 border-dashed border-slate-800 hover:border-red-500/50 hover:bg-slate-900/40 shadow-sm'
      }`}
    >
      {/* Top Banner Accent */}
      <div
        className={`h-2.5 w-full bg-gradient-to-r ${meta.accentColor} ${
          !isRegistered ? 'opacity-30 group-hover:opacity-100 transition-opacity' : ''
        }`}
      />

      <div className="p-6 sm:p-7 flex-1 flex flex-col">
        {/* Header: Slot Badge & Status */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <span
              className={`inline-flex items-center justify-center w-10 h-10 rounded-2xl font-black text-sm tracking-wider ${
                isMyTeam
                  ? 'bg-gradient-to-br from-amber-500 to-red-600 text-white shadow-md shadow-amber-500/20'
                  : isRegistered
                  ? 'bg-gradient-to-br from-red-600 to-rose-700 text-white shadow-md shadow-red-600/20'
                  : 'bg-slate-800 text-slate-400 group-hover:text-red-400 transition-colors'
              }`}
            >
              0{slotNumber}
            </span>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
                Vá»‹ trÃ­ #{slotNumber}
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {meta.badgeTitle}
              </span>
            </div>
          </div>

          <div>
            {isMyTeam ? (
              <Badge variant="my-team">
                <Sparkles className="w-3 h-3 text-amber-400 mr-0.5" />
                Äá»™i cá»§a báº¡n
              </Badge>
            ) : isRegistered ? (
              <Badge variant="registered">
                <CheckCircle2 className="w-3 h-3 text-red-400 mr-0.5" />
                ÄÃ£ ghi danh
              </Badge>
            ) : (
              <Badge variant="available">
                CÃ²n trá»‘ng
              </Badge>
            )}
          </div>
        </div>

        {/* Content Body */}
        {isRegistered ? (
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Team Name */}
              <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2 group-hover:text-red-400 transition-colors">
                {team.name}
              </h4>
              <p className="text-xs text-slate-400 mb-5 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Äá»™i trÆ°á»Ÿng: <strong className="text-slate-300 font-semibold">{team.ownerName}</strong></span>
              </p>

              {/* Members Section (Publicly Visible as requested) */}
              <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800/80 mb-6">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-red-400" />
                    ThÃ nh viÃªn Ä‘á»™i ({team.members.length}/5)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    CÃ´ng khai
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {team.members.map((member, index) => (
                    <span
                      key={member.id}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-slate-900 border border-slate-800 text-slate-200"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                      <span className="font-medium">{member.name}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Registered Timestamp & Actions */}
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <span>ÄÄƒng kÃ½: {team.registeredAt}</span>

              {isMyTeam && (
                <button
                  onClick={() => onEditClick(team)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold text-xs transition-colors focus:ring-2 focus:ring-amber-500"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Chá»‰nh sá»­a
                </button>
              )}

              {currentRole === 'ADMIN' && !isMyTeam && (
                <button
                  onClick={() => onAdminClick(team)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 font-semibold text-xs transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Quáº£n lÃ½ Admin
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Available Empty State */
          <div className="flex-1 flex flex-col justify-between py-4">
            <div>
              <h4 className="text-lg font-bold text-slate-300 mb-2 group-hover:text-white transition-colors">
                Slot sáºµn sÃ ng Ä‘Ã³n chÃ o Ä‘á»™i má»›i
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-6 italic">
                "{meta.motto}"
              </p>

              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 flex items-center gap-2.5">
                <Users className="w-4 h-4 text-slate-400" />
                <span>YÃªu cáº§u: 1 Ä‘á»™i trÆ°á»Ÿng + 2 Ä‘áº¿n 4 thÃ nh viÃªn (3 - 5 ngÆ°á»i).</span>
              </div>
            </div>

            {/* Available State CTA Button */}
            <div className="pt-6">
              {currentRole === 'GUEST' ? (
                <button
                  onClick={onLoginPrompt}
                  className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-all shadow-sm flex items-center justify-center gap-2 group-hover:bg-red-600"
                >
                  ÄÄƒng nháº­p Ä‘á»ƒ Ä‘Äƒng kÃ½ Slot #{slotNumber}
                </button>
              ) : userAlreadyOwnsTeam ? (
                <div className="w-full py-2.5 px-3 rounded-xl text-center bg-slate-900/70 border border-slate-800 text-xs text-slate-400 flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Báº¡n Ä‘Ã£ cÃ³ Ä‘á»™i. Má»—i tÃ i khoáº£n sá»Ÿ há»¯u 1 Ä‘á»™i.
                </div>
              ) : (
                <button
                  onClick={() => onRegisterClick(slotNumber)}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/20 hover:shadow-red-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  ÄÄƒng kÃ½ vÃ o Vá»‹ trÃ­ #{slotNumber}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
