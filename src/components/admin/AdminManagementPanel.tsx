'use client';

import React from 'react';
import { Team, TeamMatchRequest } from '@/types';

interface AdminManagementPanelProps {
  teams: Team[];
  matches?: TeamMatchRequest[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
  onAcceptMatch?: (matchId: string) => void;
  onRejectMatch?: (matchId: string) => void;
}

export const AdminManagementPanel: React.FC<AdminManagementPanelProps> = ({
  teams,
  matches = [],
  onEditTeam,
  onDeleteTeam,
  onAcceptMatch,
  onRejectMatch
}) => {
  const pendingMatches = matches.filter((m) => m.status === 'PENDING');

  return (
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 block">
            Bảng Quản Trị Viên (Admin Privileges)
          </span>
          <h3 className="text-lg sm:text-xl font-black text-white">
            Kiểm Soát 6 Vị Trí Đăng Ký & Ghép Đội
          </h3>
        </div>
        <div className="px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/30 text-purple-300 text-xs font-semibold self-start sm:self-auto">
          Quyền Admin cao nhất
        </div>
      </div>

      {/* Pending Match Requests Section (if any) */}
      {pendingMatches.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              🤝 Yêu Cầu Ghép / Gộp Đội Đang Chờ Phê Duyệt ({pendingMatches.length})
            </h4>
            <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
              Admin có quyền duyệt ngay
            </span>
          </div>

          <div className="space-y-2">
            {pendingMatches.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900/90 border border-purple-500/30 text-xs"
              >
                <div>
                  <div className="font-semibold text-white">
                    {m.fromTeamName} ({m.fromMembersCount} người) ➔ gộp vào {m.toTeamName} ({m.toMembersCount}/5 người)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Tổng sau gộp: <strong className="text-emerald-400">{m.fromMembersCount + m.toMembersCount}/5 thành viên</strong>
                    {' • '}
                    Slot #{m.fromSlotNumber} sẽ được giải phóng trở thành 5 slot trống.
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {onAcceptMatch && (
                    <button
                      onClick={() => onAcceptMatch(m.id)}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      ✓ Duyệt Gộp
                    </button>
                  )}
                  {onRejectMatch && (
                    <button
                      onClick={() => onRejectMatch(m.id)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                    >
                      ✕ Từ chối
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
              <th className="py-2.5 px-3">Slot</th>
              <th className="py-2.5 px-3">Tên Đội</th>
              <th className="py-2.5 px-3">Người Đại Diện Đăng Ký</th>
              <th className="py-2.5 px-3">Sĩ Số</th>
              <th className="py-2.5 px-3">Trạng Thái Slot</th>
              <th className="py-2.5 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-slate-500 text-xs">
                  Chưa có đội nào đăng ký thi đấu.
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                const isNeedMembers = team.members.length < 5;

                return (
                  <tr key={team.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-200">
                        Slot #{team.slotNumber}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-white block">{team.name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <span>{team.ownerName}</span>
                      <span className="text-[10px] text-slate-500 block">{team.ownerEmail}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-300">
                      <span className="font-semibold">{team.members.length}/5 người</span>
                    </td>
                    <td className="py-3 px-3">
                      {isNeedMembers ? (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 font-medium">
                          Còn trống {5 - team.members.length} slot (Có thể ghép)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-medium">
                          Đã đủ 5/5 người
                        </span>
                      )}
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
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};