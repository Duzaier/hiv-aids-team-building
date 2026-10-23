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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl mb-8 sm:mb-12">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/10 shrink-0">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-white flex items-center gap-2">
              Bảng Quản Trị Hệ Thống
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Toàn quyền xem, hiệu chỉnh, xóa và giải phóng slot thi đấu.
            </p>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs flex-wrap">
          <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
            Tổng: <strong className="text-white font-bold">{totalSlots}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-red-950/60 border border-red-500/30 text-red-300">
            Đã đăng ký: <strong className="text-white font-bold">{occupiedCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            Còn trống: <strong className="text-white font-bold">{availableCount}</strong>
          </span>
        </div>
      </div>

      {/* Desktop Table View (Hidden on mobile < 768px) */}
      <div className="hidden md:block mt-6 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <th className="py-3 px-3">Slot</th>
              <th className="py-3 px-4">Tên Đội</th>
              <th className="py-3 px-4">Đội Trưởng (Owner)</th>
              <th className="py-3 px-4">Thành Viên</th>
              <th className="py-3 px-4">Thời Gian</th>
              <th className="py-3 px-4 text-right">Thao Tác</th>
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
                    <td className="py-3.5 px-4 italic text-slate-400">
                      (Chưa có đội đăng ký)
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">—</td>
                    <td className="py-3.5 px-4 text-slate-400">—</td>
                    <td className="py-3.5 px-4 text-slate-400">—</td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-block px-2 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold">
                        Sẵn sàng
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
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEditTeam(team)}
                        className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
                        title="Chỉnh sửa đội"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteTeam(team)}
                        className="p-2 rounded-lg bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/30 transition-colors"
                        title="Xóa đội và giải phóng slot"
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

      {/* Mobile Card List View (Visible on mobile < 768px) */}
      <div className="md:hidden mt-4 space-y-3">
        {[1, 2, 3, 4, 5, 6].map((slotNum) => {
          const team = teams.find((t) => t.slotNumber === slotNum);

          if (!team) {
            return (
              <div key={slotNum} className="p-3 rounded-xl bg-slate-950/40 border border-dashed border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-400">Slot 0{slotNum}</span>
                <span className="italic text-slate-500">Chưa có đội đăng ký</span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 text-[10px]">Trống</span>
              </div>
            );
          }

          return (
            <div key={slotNum} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-red-950 border border-red-500/40 text-red-300 font-bold flex items-center justify-center text-xs">
                    0{slotNum}
                  </span>
                  <span className="font-bold text-white text-sm">{team.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="p-1.5 rounded-md bg-slate-800 text-slate-200"
                    title="Sửa đội"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteTeam(team)}
                    className="p-1.5 rounded-md bg-red-950 text-red-300 border border-red-500/30"
                    title="Xóa đội"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>Đội trưởng: <strong className="text-slate-300">{team.ownerName}</strong></span>
                <span>{team.registeredAt}</span>
              </div>

              <div className="flex flex-wrap gap-1 pt-1">
                {team.members.map((m) => (
                  <span key={m.id} className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[10px]">
                    {m.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Admin Notice */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-purple-300">
          <AlertCircle className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          Hành động xóa sẽ lập tức giải phóng slot cho đội tiếp theo.
        </span>
      </div>
    </div>
  );
};
