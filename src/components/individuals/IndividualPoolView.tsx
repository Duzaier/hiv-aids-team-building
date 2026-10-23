'use client';

import React, { useState } from 'react';
import { IndividualRegistration, Role, User } from '@/types';
import { Dices, RefreshCcw, UserPlus, Users, Clock, CheckCircle2 } from 'lucide-react';

interface IndividualPoolViewProps {
  individuals: IndividualRegistration[];
  currentUser: User | null;
  currentRole: Role;
  isLoading: boolean;
  onOpenRegisterIndividual: () => void;
  onRefresh: () => void;
  onShowNotice: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const IndividualPoolView: React.FC<IndividualPoolViewProps> = ({
  individuals,
  currentUser,
  currentRole,
  isLoading,
  onOpenRegisterIndividual,
  onRefresh,
  onShowNotice
}) => {
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentRole === 'ADMIN';

  const totalCount = individuals.length;
  const assignedCount = individuals.filter((i) => !!i.assignedTeamId).length;
  const waitingCount = totalCount - assignedCount;

  // Filtered by search
  const filtered = individuals.filter((i) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      (i.phone && i.phone.includes(q))
    );
  });

  const handleRandomize = async () => {
    if (!isAdmin) return;
    if (waitingCount === 0) {
      onShowNotice('info', 'Hiện không có cá nhân nào trong hàng chờ ghép đội.');
      return;
    }

    try {
      setIsRandomizing(true);
      const res = await fetch('/api/admin/randomize', {
        method: 'POST',
        headers: {
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
          'x-user-name': encodeURIComponent(currentUser?.name || ''),
          'x-user-role': currentUser?.role || 'USER'
        }
      });

      const result = await res.json();
      if (result.success) {
        onShowNotice('success', result.message || `Đã phân bổ ngẫu nhiên ${result.assignedCount} cá nhân vào các đội!`);
        onRefresh();
      } else {
        onShowNotice('error', result.error || 'Phân bổ ngẫu nhiên thất bại');
      }
    } catch (err: any) {
      onShowNotice('error', err?.message || 'Có lỗi kết nối máy chủ');
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleReset = async () => {
    if (!isAdmin) return;
    if (assignedCount === 0) {
      onShowNotice('info', 'Chưa có cá nhân nào được ghép đội để hoàn tác.');
      return;
    }

    if (!confirm('Bạn có chắc chắn muốn hoàn tác tất cả các lượt ghép cá nhân vào đội không?')) {
      return;
    }

    try {
      setIsResetting(true);
      const res = await fetch('/api/admin/randomize/reset', {
        method: 'POST',
        headers: {
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
          'x-user-name': encodeURIComponent(currentUser?.name || ''),
          'x-user-role': currentUser?.role || 'USER'
        }
      });

      const result = await res.json();
      if (result.success) {
        onShowNotice('success', result.message || 'Đã hoàn tác và trả tất cả cá nhân về danh sách chờ.');
        onRefresh();
      } else {
        onShowNotice('error', result.error || 'Hoàn tác thất bại');
      }
    } catch (err: any) {
      onShowNotice('error', err?.message || 'Có lỗi kết nối máy chủ');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Stat Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Danh Sách Đăng Ký Cá Nhân
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Dành cho những người tham gia chưa có đội nhóm riêng. Khi một đội thi đấu chưa đủ 5 thành viên, Admin sẽ bấm nút <strong>RANDOM</strong> để bốc thăm và phân bổ ngẫu nhiên người đăng ký vào các đội còn trống slot.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenRegisterIndividual}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 transition-all flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Đăng Ký Cá Nhân
            </button>

            {isAdmin && (
              <>
                <button
                  onClick={handleRandomize}
                  disabled={isRandomizing || waitingCount === 0}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                    isRandomizing || waitingCount === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                      : 'bg-linear-to-r from-red-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-purple-600/30 animate-pulse'
                  }`}
                  title="Random phân bổ các cá nhân đang chờ vào các đội chưa đủ 5 người"
                >
                  <Dices className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                  {isRandomizing ? 'Đang quay ngẫu nhiên...' : `RANDOM Phân Bổ (${waitingCount})`}
                </button>

                {assignedCount > 0 && (
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5"
                    title="Hoàn tác đưa cá nhân trở lại danh sách chờ"
                  >
                    <RefreshCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    Hoàn tác
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 3 Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-300 shrink-0">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Tổng Cá Nhân
              </span>
              <span className="text-lg font-black text-white">{totalCount} người</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Đang Chờ Ghép Đội
              </span>
              <span className="text-lg font-black text-amber-300">{waitingCount} người</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Đã Phân Bổ Vào Đội
              </span>
              <span className="text-lg font-black text-emerald-300">{assignedCount} người</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-sm">
        <div className="p-3 sm:p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200 text-xs sm:text-sm">
              Danh sách cá nhân đăng ký ({filtered.length})
            </span>
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo tên, email, số điện thoại..."
            className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-purple-500 focus:outline-hidden w-full sm:w-64"
          />
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-500/30 border-t-purple-400 rounded-full animate-spin" />
            Đang tải danh sách cá nhân...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-500 space-y-2">
            <Users className="w-8 h-8 mx-auto text-slate-600 mb-1" />
            <p className="font-medium text-slate-400">
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có ai đăng ký diện cá nhân'}
            </p>
            <p className="text-[11px] text-slate-600">
              Nếu bạn chưa có nhóm, hãy bấm nút <strong>"Đăng Ký Cá Nhân"</strong> để được ghép đội ngẫu nhiên!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filtered.map((person, index) => {
              const isAssigned = !!person.assignedTeamId;

              return (
                <div
                  key={person.id}
                  className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-6 h-6 rounded-md bg-slate-800/80 text-slate-400 text-[11px] font-bold flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-white text-xs sm:text-sm font-bold truncate">
                          {person.name}
                        </strong>
                        {isAssigned ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30 shrink-0">
                            ✓ Ghép vào Đội {person.assignedSlot}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/40 text-amber-300 border border-amber-500/30 shrink-0">
                            ⏳ Chờ ghép đội
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-0.5">
                        <span className="truncate">{person.email}</span>
                        {person.phone && (
                          <span className="text-slate-500 truncate hidden sm:inline">
                            SĐT: {isAdmin ? person.phone : `${person.phone.substring(0, 4)}***`}
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px] shrink-0">
                          {person.registeredAt}
                        </span>
                      </div>
                    </div>
                  </div>

                  {isAssigned && (
                    <div className="text-right sm:text-right shrink-0">
                      <span className="text-[11px] font-bold text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-lg inline-block">
                        Slot #{person.assignedSlot}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
