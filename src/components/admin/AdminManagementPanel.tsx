'use client';

import React, { useState } from 'react';
import { Team, TeamMatchRequest } from '@/types';
import { Users, ChevronDown, ChevronUp, Phone, Mail, GraduationCap, Eye, EyeOff, FileSpreadsheet, HeartHandshake } from 'lucide-react';
import { ExportGoogleSheetModal } from './ExportGoogleSheetModal';

interface AdminManagementPanelProps {
  onDirectMerge?: (team?: Team) => void;
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
    <div className="mb-8 p-4 sm:p-6 rounded-2xl bg-slate-900 border border-purple-500/30 shadow-lg space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <h3 className="text-lg sm:text-xl font-black text-white">
          Quản Lý Các Đội Thi Đấu
        </h3>

        <div className="flex items-center gap-2 flex-wrap self-start sm:self-auto">
          {onDirectMerge && (
            <button
              onClick={() => onDirectMerge()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-600/25 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
              title="Admin gộp trực tiếp 2 đội với nhau mà không cần request"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-purple-300" />
              <span>Gộp Đội Trực Tiếp</span>
            </button>
          )}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
            title="Xuất danh sách người tham gia sang Google Sheet"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            <span>Xuất Google Sheet</span>
          </button>

          {onToggleTeamGrid && (
            <button
              onClick={onToggleTeamGrid}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 cursor-pointer ${
                showTeamGrid
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  : 'bg-purple-950/70 hover:bg-purple-900/80 text-purple-200 border-purple-500/40 shadow-sm'
              }`}
              title={showTeamGrid ? 'Ẩn sơ đồ 6 đội bên dưới' : 'Hiển thị sơ đồ 6 đội bên dưới'}
            >
              {showTeamGrid ? (
                <>
                  <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ẩn sơ đồ 6 đội</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5 text-purple-400" />
                  <span>Hiện sơ đồ 6 đội</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Pending Match Requests Section (if any) */}
      {pendingMatches.length > 0 && (
        <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              Yêu cầu gộp đội đang chờ duyệt ({pendingMatches.length})
            </h4>
            <span className="text-[10px] text-purple-300 bg-purple-900/60 px-2 py-0.5 rounded">
              Duyệt trực tiếp
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
                    Vị trí #{m.fromSlotNumber} sẽ được mở lại cho đội khác.
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                  {onAcceptMatch && (
                    <button
                      onClick={() => handleAcceptMatch(m.id)}
                      disabled={!!processingMatchId}
                      className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {processingMatchId === m.id && processingAction === 'ACCEPT' ? (
                        <>
                          <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Đang duyệt...</span>
                        </>
                      ) : (
                        <span>✓ Duyệt Gộp</span>
                      )}
                    </button>
                  )}
                  {onRejectMatch && (
                    <button
                      onClick={() => handleRejectMatch(m.id)}
                      disabled={!!processingMatchId}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {processingMatchId === m.id && processingAction === 'REJECT' ? (
                        <>
                          <span className="w-3 h-3 border-2 border-slate-300/30 border-t-slate-300 rounded-full animate-spin" />
                          <span>Đang từ chối...</span>
                        </>
                      ) : (
                        <span>✕ Từ chối</span>
                      )}
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
              <th className="py-2.5 px-3">Tên Đội</th>
              <th className="py-2.5 px-3">Người Đại Diện</th>
              <th className="py-2.5 px-3">Sĩ Số</th>
              <th className="py-2.5 px-3">Tình Trạng</th>
              <th className="py-2.5 px-3 text-right">Thao Tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {teams.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-slate-500 text-xs">
                  Chưa có đội nào đăng ký thi đấu.
                </td>
              </tr>
            ) : (
              teams.map((team) => {
                const isNeedMembers = team.members.length < 5;
                const isExpanded = expandedTeamId === team.id;

                return (
                  <React.Fragment key={team.id}>
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-bold text-white block">{team.name}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <span>{team.ownerName}</span>
                        <span className="text-[10px] text-slate-500 block">{team.ownerEmail}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-300">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{team.members.length}/5 người</span>
                          <button
                            onClick={() => toggleExpand(team.id)}
                            className="p-1 rounded-md hover:bg-slate-800 text-purple-300 hover:text-purple-200 transition-colors flex items-center gap-1 text-[10px] cursor-pointer"
                            title="Xem chi tiết MSSV, Gmail, SĐT các thành viên"
                          >
                            <span>Chi tiết</span>
                            <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {isNeedMembers ? (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-950/50 text-cyan-300 border border-cyan-500/30 font-medium">
                            Còn thiếu {5 - team.members.length} người
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-medium">
                            Đã đủ 5/5 người
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right space-x-2">
                        {onDirectMerge && team.members.length < 5 && (
                          <button
                            onClick={() => onDirectMerge(team)}
                            className="px-2.5 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 border border-purple-500/40 text-[11px] font-semibold transition-colors inline-flex items-center gap-1 cursor-pointer"
                            title="Gộp đội này sang đội khác trực tiếp"
                          >
                            <HeartHandshake className="w-3 h-3" />
                            <span>Gộp</span>
                          </button>
                        )}
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
                          Xóa đội
                        </button>
                      </td>
                    </tr>

                    {/* Expanded Members Contact Details for Admin */}
                    {isExpanded && (
                      <tr className="bg-slate-950/90">
                        <td colSpan={5} className="p-4 border-t border-b border-purple-500/20">
                          <div className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                            <Users className="w-4 h-4" />
                            <span>Danh Sách Chi Tiết Thành Viên {team.name} (Để Quản Lý & Liên Hệ)</span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            {team.members.map((m, idx) => (
                              <div
                                key={m.id || idx}
                                className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 space-y-1 text-xs"
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
                                  <span>SĐT (Zalo): <strong className="text-emerald-300">{m.phone || 'Chưa cập nhật'}</strong></span>
                                </div>
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

      {/* Google Sheets Export Modal */}
      <ExportGoogleSheetModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onShowNotice={onShowNotice}
      />
    </div>
  );
};