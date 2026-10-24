'use client';

import React, { useState } from 'react';
import { IndividualRegistration, Role, User } from '@/types';
import {
  Users,
  UserPlus,
  HeartHandshake,
  Shuffle,
  RotateCcw,
  Pencil,
  Edit3,
  CheckCircle2,
  Clock,
  Search,
  Trash2,
  Eye
} from 'lucide-react';

interface IndividualPoolViewProps {
  individuals: IndividualRegistration[];
  currentUser: User | null;
  currentRole: Role;
  isLoading: boolean;
  onOpenRegisterIndividual: () => void;
  onOpenEditIndividual?: (ind: IndividualRegistration) => void;
  onViewTeam?: (teamId: string) => void;
  onRefresh: () => void;
  onShowNotice: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const IndividualPoolView: React.FC<IndividualPoolViewProps> = ({
  individuals,
  currentUser,
  currentRole,
  isLoading,
  onOpenRegisterIndividual,
  onOpenEditIndividual,
  onViewTeam,
  onRefresh,
  onShowNotice
}) => {
  const [isRandomizing, setIsRandomizing] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = currentRole === 'ADMIN';

  const totalCount = individuals.length;
  const assignedCount = individuals.filter((i) => !!i.assignedTeamId).length;
  const waitingCount = totalCount - assignedCount;

  // Current user registration
  const myRegistration = React.useMemo(() => {
    let savedId: string | null = null;
    if (typeof window !== 'undefined') {
      try {
        savedId = localStorage.getItem('my_individual_reg_id');
      } catch (e) {}
    }
    return (
      individuals.find(
        (i) =>
          (currentUser?.id && i.userId === currentUser.id) ||
          (currentUser?.email && i.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (savedId && i.id === savedId)
      ) || null
    );
  }, [individuals, currentUser]);

  // Filtered by search
  const filtered = individuals.filter((i) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      i.name.toLowerCase().includes(q) ||
      i.email.toLowerCase().includes(q) ||
      (i.studentId && i.studentId.toLowerCase().includes(q)) ||
      (i.phone && i.phone.includes(q))
    );
  });

  const handleDeleteIndividual = async (person: IndividualRegistration) => {
    const isSelf =
      (myRegistration && myRegistration.id === person.id) ||
      (currentUser?.email && person.email.toLowerCase() === currentUser.email.toLowerCase());

    const warningDetail = person.assignedTeamId
      ? `\n\nLưu ý: Bạn này hiện đang thuộc Đội ${person.assignedSlot}. Khi xóa sẽ đồng thời rút bạn khỏi đội.`
      : '';

    const confirmMsg = isAdmin
      ? `Bạn có chắc muốn xóa "${person.name}" khỏi danh sách đăng ký không?${warningDetail}`
      : `Bạn có chắc muốn hủy đăng ký tham gia không?${warningDetail}`;

    if (!window.confirm(confirmMsg)) return;

    try {
      setDeletingId(person.id);
      const res = await fetch(`/api/individuals?id=${person.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
          'x-user-name': encodeURIComponent(currentUser?.name || ''),
          'x-user-role': currentUser?.role || 'USER'
        }
      });

      const result = await res.json();
      if (result.success) {
        onShowNotice('success', result.message || `Đã xóa cá nhân "${person.name}" thành công.`);
        if (isSelf) {
          try {
            localStorage.removeItem('my_individual_reg_id');
          } catch (e) {}
        }
        onRefresh();
      } else {
        onShowNotice('error', result.error || 'Xóa cá nhân thất bại.');
      }
    } catch (err: any) {
      onShowNotice('error', err?.message || 'Có lỗi kết nối máy chủ khi xóa cá nhân.');
    } finally {
      setDeletingId(null);
    }
  };

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
      <div className="p-4 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-8 h-8 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-xs shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Danh Sách Đăng Ký Cá Nhân
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Dành cho các bạn chưa có đội. Ban tổ chức sẽ tự động chia đều người vào các đội còn thiếu trước giờ thi đấu.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {!myRegistration && (
              <button
                id="btn-open-register-individual"
                onClick={onOpenRegisterIndividual}
                className="group px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-sm transition-all duration-150 flex items-center gap-2 cursor-pointer border border-purple-500 active:scale-95"
              >
                <UserPlus className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
                <span>Đăng Ký Cá Nhân</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={handleRandomize}
                  disabled={isRandomizing || waitingCount === 0}
                  className={`group px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all duration-150 flex items-center gap-2 ${
                    isRandomizing || waitingCount === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 cursor-pointer active:scale-95'
                  }`}
                  title="Chia đều các bạn đang chờ vào các đội"
                >
                  <Shuffle className={`w-4 h-4 shrink-0 transition-transform duration-300 ${isRandomizing ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                  <span>{isRandomizing ? 'Đang chia đội...' : `Chia đều vào các đội (${waitingCount})`}</span>
                </button>

                {assignedCount > 0 && (
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="group px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    title="Hoàn tác đưa cá nhân trở lại danh sách chờ"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 shrink-0 transition-transform duration-300 ${isResetting ? 'animate-spin' : 'group-hover:-rotate-90'}`} />
                    <span>Hoàn tác</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {myRegistration && (
          <div className="p-4 rounded-xl bg-purple-950/40 border border-purple-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white font-bold text-[10px] uppercase tracking-wider">
                  Đăng ký của bạn
                </span>
                {myRegistration.assignedTeamId ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1.5">
                    <span>✓ Đã ghép vào Đội {myRegistration.assignedSlot}</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-semibold">
                    ⏳ Đang trong danh sách chờ ghép
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span>Họ tên: <strong className="text-white font-bold">{myRegistration.name}</strong></span>
                <span>MSSV: <strong className="text-blue-300 font-mono">{myRegistration.studentId || 'Chưa cập nhật'}</strong></span>
                <span>Gmail: <strong className="text-white">{myRegistration.email}</strong></span>
                <span>SĐT (Zalo): <strong className="text-white">{myRegistration.phone || 'Chưa cập nhật'}</strong></span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              {myRegistration.assignedTeamId && onViewTeam && (
                <button
                  type="button"
                  onClick={() => onViewTeam(myRegistration.assignedTeamId!)}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Xem Đội {myRegistration.assignedSlot}</span>
                </button>
              )}
              <button
                onClick={() => onOpenEditIndividual && onOpenEditIndividual(myRegistration)}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer active:scale-95"
              >
                <Edit3 className="w-3.5 h-3.5" />
                Chỉnh sửa
              </button>
            </div>
          </div>
        )}

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

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo tên, MSSV, email..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500/40 w-full transition-all"
            />
          </div>
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
              {searchTerm ? 'Không tìm thấy kết quả phù hợp' : 'Chưa có ai đăng ký'}
            </p>
            <p className="text-[11px] text-slate-500">
              Bạn chưa có đội? Bấm nút <strong>"Đăng Ký Cá Nhân"</strong> bên trên để vào danh sách chia đội.
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
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-xs sm:text-sm font-bold truncate">
                          {person.name}
                        </strong>
                        {person.studentId && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300 font-mono text-[10px]">
                            MSSV: {person.studentId}
                          </span>
                        )}
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

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {(isAdmin || (myRegistration && myRegistration.id === person.id) || (currentUser && currentUser.email && person.email.toLowerCase() === currentUser.email.toLowerCase())) && (
                      <button
                        onClick={() => onOpenEditIndividual && onOpenEditIndividual(person)}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-purple-600 text-slate-300 hover:text-white border border-slate-700 hover:border-purple-500 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                        title="Chỉnh sửa thông tin nếu điền sai"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    )}

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteIndividual(person)}
                        disabled={deletingId === person.id}
                        className="group px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-400 hover:text-white border border-slate-700 hover:border-rose-500 text-[11px] font-medium transition-all duration-150 flex items-center gap-1 cursor-pointer active:scale-95"
                        title={isAdmin ? "Xóa cá nhân khỏi danh sách đăng ký ghép đội (Quyền Admin)" : "Hủy đăng ký cá nhân của bạn"}
                      >
                        <Trash2 className="w-3 h-3 transition-transform duration-200 group-hover:scale-110" />
                        <span>{deletingId === person.id ? 'Đang xóa...' : (isAdmin ? 'Xóa' : 'Hủy')}</span>
                      </button>
                    )}

                    {isAssigned && (
                      onViewTeam && person.assignedTeamId ? (
                        <button
                          type="button"
                          onClick={() => onViewTeam(person.assignedTeamId!)}
                          className="text-[11px] font-bold text-purple-300 hover:text-white bg-purple-950/60 hover:bg-purple-900/80 border border-purple-500/40 hover:border-purple-400 px-2.5 py-1 rounded-lg inline-flex items-center gap-1 transition-all cursor-pointer shadow-xs active:scale-95 uppercase tracking-wide"
                          title={`Xem chi tiết Đội ${person.assignedSlot}`}
                        >
                          <span>ĐỘI {person.assignedSlot}</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-purple-300 bg-purple-950/60 border border-purple-500/40 px-2.5 py-1 rounded-lg inline-block uppercase tracking-wide">
                          ĐỘI {person.assignedSlot}
                        </span>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
