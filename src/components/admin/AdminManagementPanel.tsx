'use client';

import React, { useState } from 'react';
import { Team, TeamMatchRequest } from '@/types';
import {
  Users,
  ChevronDown,
  Phone,
  Mail,
  GraduationCap,
  Eye,
  EyeOff,
  FileSpreadsheet,
  HeartHandshake,
  ArrowRightLeft
} from 'lucide-react';
import { ExportGoogleSheetModal } from './ExportGoogleSheetModal';

interface AdminManagementPanelProps {
  onDirectMerge?: (team?: Team, preselectedMemberId?: string) => void;
  teams: Team[];
  matches?: TeamMatchRequest[];
  onEditTeam: (team: Team) => void;
  onDeleteTeam: (team: Team) => void;
  onAcceptMatch?: (matchId: string) => void;
  onRejectMatch?: (matchId: string) => void;
  showTeamGrid?: boolean;
  onToggleTeamGrid?: () => void;
  onShowNotice?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const AdminManagementPanel: React.FC<AdminManagementPanelProps> = ({
  teams,
  matches = [],
  onEditTeam,
  onDeleteTeam,
  onAcceptMatch,
  onRejectMatch,
  showTeamGrid,
  onToggleTeamGrid,
  onShowNotice,
  onDirectMerge
}) => {
  const [expandedTeamId, setExpandedTeamId] = useState<string | null>(null);
  const [processingMatchId, setProcessingMatchId] = useState<string | null>(null);
  const [processingAction, setProcessingAction] = useState<'ACCEPT' | 'REJECT' | null>(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const handleAcceptMatch = async (matchId: string) => {
    if (!onAcceptMatch || processingMatchId) return;
    try {
      setProcessingMatchId(matchId);
      setProcessingAction('ACCEPT');
      await onAcceptMatch(matchId);
    } finally {
      setProcessingMatchId(null);
      setProcessingAction(null);
    }
  };

  const handleRejectMatch = async (matchId: string) => {
    if (!onRejectMatch || processingMatchId) return;
    try {
      setProcessingMatchId(matchId);
      setProcessingAction('REJECT');
      await onRejectMatch(matchId);
    } finally {
      setProcessingMatchId(null);
      setProcessingAction(null);
    }
  };

  const pendingMatches = matches.filter((m) => m.status === 'PENDING');

  const toggleExpand = (teamId: string) => {
    setExpandedTeamId(expandedTeamId === teamId ? null : teamId);
  };

  return (
    <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-5">
      {/* Top Header: Title & Global Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>Bảng Quản Trị Đội Thi Đấu</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 font-semibold uppercase">
              Admin
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Quản lý danh sách, ghép chuyển người tùy ý, xuất Google Sheet và phê duyệt gộp đội.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {onDirectMerge && (
            <button
              onClick={() => onDirectMerge()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/35 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
              title="Gộp đội hoặc chuyển thành viên tùy ý giữa các đội"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
              <span>Gộp / Chuyển Người</span>
            </button>
          )}

          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs"
            title="Xuất bảng dữ liệu sang Google Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Google Sheet</span>
          </button>

          {onToggleTeamGrid && (
            <button
              onClick={onToggleTeamGrid}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-95 shadow-xs ${
                showTeamGrid
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-purple-300 border-purple-500/30'
              }`}
              title={showTeamGrid ? 'Thu gọn sơ đồ 6 đội' : 'Mở rộng sơ đồ 6 đội'}
            >
              {showTeamGrid ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ẩn sơ đồ 6 đội</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Xem sơ đồ 6 đội</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pending Match Requests (if any) */}
      {pendingMatches.length > 0 && (
        <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-500/40 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <span>Yêu cầu gộp đội chờ duyệt</span>
              <span className="px-1.5 py-0.2 rounded bg-purple-500/30 text-purple-200 text-[10px]">
                {pendingMatches.length}
              </span>
            </h4>
          </div>

          <div className="space-y-2">
            {pendingMatches.map((m) => (
              <div
                key={m.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs"
              >
                <div>
                  <div className="font-bold text-white">
                    {m.fromTeamName} ({m.fromMembersCount} người) ➔ gộp vào {m.toTeamName} ({m.toMembersCount}/5 người)
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Tổng sau gộp: <strong className="text-emerald-400">{m.fromMembersCount + m.toMembersCount}/5 thành viên</strong>
                    {' — '}
                    Vị trí #{m.fromSlotNumber} sẽ được giải phóng hoàn toàn.
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {onAcceptMatch && (
                    <button
                      onClick={() => handleAcceptMatch(m.id)}
                      disabled={Boolean(processingMatchId)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {processingMatchId === m.id && processingAction === 'ACCEPT' ? 'Đang duyệt...' : 'Chấp thuận'}
                    </button>
                  )}
                  {onRejectMatch && (
                    <button
                      onClick={() => handleRejectMatch(m.id)}
                      disabled={Boolean(processingMatchId)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {processingMatchId === m.id && processingAction === 'REJECT' ? 'Đang từ chối...' : 'Từ chối'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clean Minimalist Teams Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold text-[11px]">
              <th className="py-2.5 px-3.5">Tên Đội</th>
              <th className="py-2.5 px-3.5">Người Đại Diện</th>
              <th className="py-2.5 px-3.5">Quân Số & Trạng Thái</th>
              <th className="py-2.5 px-3.5 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                  Chưa có đội nào đăng ký thi đấu.
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                const isNeedMembers = team.members.length < 5;
                const isExpanded = expandedTeamId === team.id;

                return (
                  <React.Fragment key={team.id}>
                    <tr className="hover:bg-slate-800/25 transition-colors">
                      <td className="py-3 px-3.5">
                        <span className="font-bold text-white block">{team.name}</span>
                        <span className="text-[10px] text-slate-500">Slot #{team.slotNumber}</span>
                      </td>
                      <td className="py-3 px-3.5 text-slate-300">
                        <span className="font-medium text-slate-200">{team.ownerName}</span>
                        <span className="text-[10px] text-slate-500 block truncate max-w-[180px]">{team.ownerEmail}</span>
                      </td>
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-xs">{team.members.length}/5</span>
                          {isNeedMembers ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-medium">
                              Thiếu {5 - team.members.length}
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 font-medium">
                              Đủ 5/5
                            </span>
                          )}

                          <button
                            onClick={() => toggleExpand(team.id)}
                            className="p-1 rounded-md hover:bg-slate-800 text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-0.5 text-[10px] cursor-pointer"
                            title="Xem chi tiết thành viên"
                          >
                            <span>Chi tiết</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3.5 text-right space-x-1.5">
                        {onDirectMerge && team.members.length > 0 && (
                          <button
                            onClick={() => onDirectMerge(team)}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/15 hover:bg-purple-500/30 text-purple-300 border border-purple-500/30 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Gộp đội này hoặc chuyển người sang đội khác"
                          >
                            <HeartHandshake className="w-3 h-3" />
                            <span>Gộp/Chuyển</span>
                          </button>
                        )}
                        <button
                          onClick={() => onEditTeam(team)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => onDeleteTeam(team)}
                          className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>

                    {/* Clean Member Details Accordion */}
                    {isExpanded && (
                      <tr className="bg-slate-950/70">
                        <td colSpan={4} className="p-3.5 border-t border-b border-slate-800">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                            {team.members.map((m, idx) => (
                              <div
                                key={m.id || idx}
                                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-bold text-white">
                                    #{idx + 1}. {m.name}
                                  </span>
                                  {m.isFromIndividual && (
                                    <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-900/50 text-purple-300 border border-purple-500/30 font-medium">
                                      Ghép
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                  <GraduationCap className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                  <span>MSSV: <strong className="text-blue-300 font-mono">{m.studentId || 'Chưa cập nhật'}</strong></span>
                                </div>
                                <div className="text-[11px] text-slate-300 flex items-center gap-1.5 truncate">
                                  <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  <span className="truncate">{m.email || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="text-[11px] text-slate-300 flex items-center gap-1.5">
                                  <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  <span>SĐT: <strong className="text-emerald-300">{m.phone || 'Chưa cập nhật'}</strong></span>
                                </div>

                                {onDirectMerge && (
                                  <button
                                    type="button"
                                    onClick={() => onDirectMerge(team, m.id)}
                                    className="w-full mt-1.5 py-1 px-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/25 text-purple-300 border border-purple-500/25 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                    title={`Chuyển ${m.name} sang đội khác`}
                                  >
                                    <ArrowRightLeft className="w-3 h-3 text-purple-400" />
                                    <span>Chuyển bạn này sang đội khác</span>
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Export Google Sheet Modal */}
      <ExportGoogleSheetModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onShowNotice={onShowNotice}
      />
    </div>
  );
};
