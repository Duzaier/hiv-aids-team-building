'use client';

import React from 'react';
import { Team } from '@/types';

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
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 mb-8 shadow-xl">
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400 block mb-0.5">
            Quản trị viên
          </span>
          <h3 className="text-base sm:text-xl font-bold text-white">
            Bảng Quản Lý 6 Đội Thi Đấu
          </h3>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
            Tổng: <strong className="text-white">{totalSlots}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-red-950/60 border border-red-500/30 text-red-300">
            Đã đăng ký: <strong className="text-white">{occupiedCount}</strong>
          </span>
          <span className="px-2.5 py-1 rounded-md bg-emerald-950/60 border border-emerald-500/30 text-emerald-300">
            Còn trống: <strong className="text-white">{availableCount}</strong>
          </span>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">Slot</th>
              <th className="py-2.5 px-3">Tên Đội</th>
              <th className="py-2.5 px-3">Đội Trưởng (Email)</th>
              <th className="py-2.5 px-3">Thành Viên</th>
              <th className="py-2.5 px-3">Thời Gian</th>
              <th className="py-2.5 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {[1, 2, 3, 4, 5, 6].map((slotNum) => {
              const team = teams.find((t) => t.slotNumber === slotNum);

              if (!team) {
                return (
                  <tr key={slotNum} className="text-slate-400 hover:bg-slate-950/30">
                    <td className="py-3 px-3 font-mono font-bold text-slate-500">
                      0{slotNum}
                    </td>
                    <td className="py-3 px-3 italic text-slate-500">
                      (Chưa có đội đăng ký)
                    </td>
                    <td className="py-3 px-3 text-slate-500">—</td>
                    <td className="py-3 px-3 text-slate-500">—</td>
                    <td className="py-3 px-3 text-slate-500">—</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/40 text-emerald-400 text-[11px]">
                        Sẵn sàng
                      </span>
                    </td>
                  </tr>
                );
              }

              return (
                <tr key={slotNum} className="text-slate-300 hover:bg-slate-950/50 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-red-400">
                    0{team.slotNumber}
                  </td>
                  <td className="py-3 px-3 font-semibold text-white">
                    {team.name}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-medium text-slate-200 block">{team.ownerName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{team.ownerEmail}</span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex flex-wrap gap-1">
                      {team.members.map((m) => (
                        <span key={m.id} className="px-1.5 py-0.5 rounded bg-slate-950 text-slate-300 border border-slate-800 text-[11px]">
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                    {team.registeredAt}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => onEditTeam(team)}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => onDeleteTeam(team)}
                        className="px-2.5 py-1 rounded bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-500/30 font-medium text-xs transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card List View */}
      <div className="md:hidden mt-3 space-y-2.5">
        {[1, 2, 3, 4, 5, 6].map((slotNum) => {
          const team = teams.find((t) => t.slotNumber === slotNum);

          if (!team) {
            return (
              <div key={slotNum} className="p-2.5 rounded-lg bg-slate-950/40 border border-dashed border-slate-800 flex items-center justify-between text-xs">
                <span className="font-bold text-slate-500">Slot 0{slotNum}</span>
                <span className="italic text-slate-500">Còn trống</span>
              </div>
            );
          }

          return (
            <div key={slotNum} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-red-400">0{slotNum}</span>
                  <span className="font-bold text-white">{team.name}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[11px]"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDeleteTeam(team)}
                    className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/30 text-[11px]"
                  >
                    Xóa
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex justify-between">
                <span>{team.ownerName}</span>
                <span>{team.registeredAt}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notice */}
      <p className="mt-3 text-[11px] text-slate-500">
        Xóa đội sẽ lập tức giải phóng slot cho đội tiếp theo đăng ký.
      </p>
    </div>
  );
};
