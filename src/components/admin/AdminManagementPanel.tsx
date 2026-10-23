'use client';

import React from 'react';
import { Team } from '@/types';
import { Shield, Edit, Trash2, Users, Calendar, AlertCircle } from 'lucide-react';

interface AdminManagementPanelProps {
  teams: Team[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
}

export const AdminManagementPanel: React.FC<AdminManagementPanelProps> = ({
  teams,
  onEditTeam,
  onDeleteTeam
}) => {
  const totalSlots = 6;
  const occupiedCount = teams.length;
  const availableCount = totalSlots - occupiedCount;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl mb-12">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              Báº£ng Quáº£n Trá»‹ Há»‡ Thá»‘ng (Administrator)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              ToÃ n quyá»n xem, hiá»‡u chá»‰nh, giáº£i phÃ³ng slot vÃ  kiá»ƒm tra danh sÃ¡ch 6 Ä‘á»™i thi Ä‘áº¥u.
            </p>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
            Tá»•ng slot: <strong className="text-white font-bold">{totalSlots}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-red-950/60 border border-red-500/30 text-red-300">
            ÄÃ£ Ä‘Äƒng kÃ½: <strong className="text-white font-bold">{occupiedCount}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            CÃ²n trá»‘ng: <strong className="text-white font-bold">{availableCount}</strong>
          </span>
        </div>
      </div>

      {/* Teams Table / Grid */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Slot</th>
              <th className="py-3 px-4">TÃªn Äá»™i</th>
              <th className="py-3 px-4">Äá»™i TrÆ°á»Ÿng (Owner)</th>
              <th className="py-3 px-4">ThÃ nh ViÃªn ({teams.reduce((acc, t) => acc + t.members.length, 0)} ngÆ°á»i)</th>
              <th className="py-3 px-4">Thá»i Gian</th>
              <th className="py-3 px-4 text-right">Thao TÃ¡c</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {[1, 2, 3, 4, 5, 6].map((slotNum) => {
              const team = teams.find((t) => t.slotNumber === slotNum);

              if (!team) {
                return (
                  <tr key={slotNum} className="text-slate-400 hover:bg-slate-950/30">
                    <td className="py-3.5 px-3">
                      <span className="inline-block w-7 h-7 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 text-center leading-7 font-bold">
                        0{slotNum}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium italic text-slate-400">
                      (ChÆ°a cÃ³ Ä‘á»™i Ä‘Äƒng kÃ½)
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">â€”</td>
                    <td className="py-3.5 px-4 text-slate-400">â€”</td>
                    <td className="py-3.5 px-4 text-slate-400">â€”</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                        Sáºµn sÃ ng nháº­n Ä‘Äƒng kÃ½
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slotNum} className="text-slate-300 hover:bg-slate-950/50 transition-colors">
                  <td className="py-3.5 px-3">
                    <span className="inline-block w-7 h-7 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 text-center leading-7 font-bold">
                      0{team.slotNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white text-sm block">{team.name}</span>
                    <span className="text-[11px] text-slate-400">{team.badgeTitle}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-semibold text-slate-200 block">{team.ownerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{team.ownerEmail}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-semibold flex items-center gap-1">
                        <Users className="w-3 h-3 text-red-400" />
                        {team.members.length}/5
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {team.members.map((m) => (
                          <span key={m.id} className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                            {m.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {team.registeredAt}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => onEditTeam(team)}
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors"
                        title="Chá»‰nh sá»­a thÃ´ng tin Ä‘á»™i"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTeam(team)}
                        className="p-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 text-red-300 hover:text-red-100 border border-red-500/30 transition-colors"
                        title="XÃ³a Ä‘á»™i vÃ  giáº£i phÃ³ng slot"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Admin Notice */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 text-purple-300">
          <AlertCircle className="w-4 h-4 text-purple-400" />
          HÃ nh Ä‘á»™ng Quáº£n trá»‹ viÃªn Ä‘Æ°á»£c báº£o vá»‡ Server-side vÃ  tá»± Ä‘á»™ng ghi vÃ o Audit Log an toÃ n.
        </span>
      </div>
    </div>
  );
};
