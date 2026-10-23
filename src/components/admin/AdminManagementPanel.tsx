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
  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Bảng Quản Trị Viên (Admin Privileges)
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Kiểm Soát 6 Vị Trí Đăng Ký
          </h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold self-start sm:self-auto">
          Quyền Admin cao nhất
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4 leading-relaxed">
        Quản trị viên có toàn quyền chỉnh sửa thông tin đội, phân định lại đội trưởng hoặc giải phóng vị trí (xóa đội) khi phát hiện vi phạm.
      </p>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
              <th className="py-2.5 px-3">Slot</th>
              <th className="py-2.5 px-3">Tên Đội</th>
              <th className="py-2.5 px-3">Đội Trưởng</th>
              <th className="py-2.5 px-3">Người Đăng Ký</th>
              <th className="py-2.5 px-3">Thành Viên</th>
              <th className="py-2.5 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3 px-3">
                  <span className="font-bold text-slate-200">
                    Slot #{team.slotNumber}
                  </span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-semibold text-white block">{team.name}</span>
                </td>
                <td className="py-3 px-3">
                  <span className="font-bold text-amber-400 block">{team.captainName || team.ownerName}</span>
                </td>
                <td className="py-3 px-3 text-slate-300">
                  <span>{team.ownerName}</span>
                </td>
                <td className="py-3 px-3 text-slate-400">
                  <span>{team.members.length}/5 người</span>
                </td>
                <td className="py-3 px-3 text-right space-x-2">
                  <button
                    onClick={() => onEditTeam(team)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => onDeleteTeam(team)}
                    className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-[11px] font-semibold transition-colors"
                  >
                    Giải phóng slot
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
