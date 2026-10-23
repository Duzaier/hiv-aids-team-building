'use client';

import React, { useState } from 'react';
import { IndividualRegistration, Role, User } from '@/types';
import {
  Users,
  UserPlus,
  HeartHandshake,
  Sparkles,
  Shuffle,
  RotateCcw,
  Pencil,
  CheckCircle2,
  Clock,
  Search,
  GraduationCap,
  Mail,
  Phone
} from 'lucide-react';

interface IndividualPoolViewProps {
  individuals: IndividualRegistration[];
  currentUser: User | null;
  currentRole: Role;
  isLoading: boolean;
  onOpenRegisterIndividual: () => void;
  onOpenEditIndividual?: (ind: IndividualRegistration) => void;
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

  const handleRandomize = async () => {
    if (!isAdmin) return;
    if (waitingCount === 0) {
      onShowNotice('info', 'Hi?n kh?ng c? c? nh?n n?o trong h?ng ch? gh?p ??i.');
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
        onShowNotice('success', result.message || `?? ph?n b? ng?u nhi?n ${result.assignedCount} c? nh?n v?o c?c ??i!`);
        onRefresh();
      } else {
        onShowNotice('error', result.error || 'Ph?n b? ng?u nhi?n th?t b?i');
      }
    } catch (err: any) {
      onShowNotice('error', err?.message || 'C? l?i k?t n?i m?y ch?');
    } finally {
      setIsRandomizing(false);
    }
  };

  const handleReset = async () => {
    if (!isAdmin) return;
    if (assignedCount === 0) {
      onShowNotice('info', 'Ch?a c? c? nh?n n?o ???c gh?p ??i ?? ho?n t?c.');
      return;
    }

    if (!confirm('B?n c? ch?c ch?n mu?n ho?n t?c t?t c? c?c l??t gh?p c? nh?n v?o ??i kh?ng?')) {
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
        onShowNotice('success', result.message || '?? ho?n t?c v? tr? t?t c? c? nh?n v? danh s?ch ch?.');
        onRefresh();
      } else {
        onShowNotice('error', result.error || 'Ho?n t?c th?t b?i');
      }
    } catch (err: any) {
      onShowNotice('error', err?.message || 'C? l?i k?t n?i m?y ch?');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action & Stat Banner */}
      <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/90 to-slate-950/95 border border-slate-800/90 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 shrink-0">
                <HeartHandshake className="w-4 h-4" />
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Danh S?ch ??ng K? C? Nh?n
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
              D?nh cho nh?ng ng??i tham gia ch?a c? ??i nh?m ri?ng. Khi m?t ??i thi ??u ch?a ?? 5 th?nh vi?n, Ban T? Ch?c s? gh?p ng?u nhi?n b?n v?o c?c ??i c?n tr?ng slot.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5">
            {myRegistration ? (
              <button
                id="btn-edit-my-individual"
                onClick={() => onOpenEditIndividual && onOpenEditIndividual(myRegistration)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all flex items-center gap-2 cursor-pointer border border-amber-400/30"
                title="Ch?nh s?a th?ng tin c? nh?n ?? ??ng k?"
              >
                <Pencil className="w-4 h-4" />
                <span>Ch?nh S?a ??ng K? C?a B?n</span>
              </button>
            ) : (
              <button
                id="btn-open-register-individual"
                onClick={onOpenRegisterIndividual}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer border border-rose-500/40"
              >
                <UserPlus className="w-4 h-4" />
                <span>??ng K? C? Nh?n</span>
              </button>
            )}

            {isAdmin && (
              <>
                <button
                  onClick={handleRandomize}
                  disabled={isRandomizing || waitingCount === 0}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                    isRandomizing || waitingCount === 0
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                      : 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 hover:opacity-95 text-white shadow-purple-600/30 border border-purple-500/40'
                  }`}
                  title="Random ph?n b? c?c c? nh?n ?ang ch? v?o c?c ??i ch?a ?? 5 ng??i"
                >
                  <Shuffle className={`w-4 h-4 ${isRandomizing ? 'animate-spin' : ''}`} />
                  <span>{isRandomizing ? '?ang quay ng?u nhi?n...' : `T? ??ng Gh?p ??i (${waitingCount})`}</span>
                </button>

                {assignedCount > 0 && (
                  <button
                    onClick={handleReset}
                    disabled={isResetting}
                    className="px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Ho?n t?c ??a c? nh?n tr? l?i danh s?ch ch?"
                  >
                    <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                    <span>Ho?n t?c</span>
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Current User Registration Spotlight */}
        {myRegistration && (
          <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950/40 via-rose-950/30 to-slate-950/70 border border-purple-500/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-md bg-gradient-to-r from-rose-600 to-purple-600 text-white font-bold text-[10px] uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  ??ng k? c?a b?n
                </span>
                {myRegistration.assignedTeamId ? (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-[10px] font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    ?? gh?p v?o ??i {myRegistration.assignedSlot}
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/40 text-[10px] font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-400" />
                    ?ang trong danh s?ch ch? gh?p
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <strong className="text-white text-sm font-bold">{myRegistration.name}</strong>
                {myRegistration.studentId && (
                  <span className="text-blue-300 font-mono text-[11px] flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-blue-400" />
                    MSSV: {myRegistration.studentId}
                  </span>
                )}
                <span className="text-slate-400 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-slate-500" />
                  {myRegistration.email}
                </span>
                {myRegistration.phone && (
                  <span className="text-slate-400 flex items-center gap-1">
                    <Phone className="w-3 h-3 text-slate-500" />
                    {myRegistration.phone}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => onOpenEditIndividual && onOpenEditIndividual(myRegistration)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors flex items-center gap-1.5 self-start md:self-center shrink-0 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5 text-amber-400" />
              <span>Ch?nh s?a th?ng tin</span>
            </button>
          </div>
        )}

        {/* 3 Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800/90 flex items-center justify-center text-slate-300 shrink-0 border border-slate-700/60">
              <Users className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                T?ng C? Nh?n
              </span>
              <span className="text-lg font-black text-white">{totalCount} ng??i</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-950/25 border border-amber-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                ?ang Ch? Gh?p ??i
              </span>
              <span className="text-lg font-black text-amber-300">{waitingCount} ng??i</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950/25 border border-emerald-500/30 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                ?? Ph?n B? V?o ??i
              </span>
              <span className="text-lg font-black text-emerald-300">{assignedCount} ng??i</span>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar & List */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden shadow-lg backdrop-blur-sm">
        <div className="p-3 sm:p-4 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="font-bold text-slate-200 text-xs sm:text-sm">
              Danh s?ch c? nh?n ??ng k? ({filtered.length})
            </span>
          </div>

          {/* Search Input with Search Icon */}
          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="T?m theo t?n, MSSV, email..."
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs focus:border-rose-500 focus:outline-hidden focus:ring-1 focus:ring-rose-500/40 w-full transition-all"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="p-10 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-slate-500/30 border-t-rose-400 rounded-full animate-spin" />
            <span>?ang t?i danh s?ch c? nh?n...</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2.5">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-2">
              <HeartHandshake className="w-6 h-6 text-slate-400" />
            </div>
            <p className="font-semibold text-slate-300 text-sm">
              {searchTerm ? 'Kh?ng t?m th?y k?t qu? ph? h?p' : 'Ch?a c? ai ??ng k? di?n c? nh?n'}
            </p>
            <p className="text-[11px] text-slate-500 max-w-md mx-auto leading-relaxed">
              N?u b?n ch?a c? nh?m, h?y b?m n?t <strong className="text-rose-400">"??ng K? C? Nh?n"</strong> ?? ???c gh?p ??i ng?u nhi?n c?ng c?c th?nh vi?n kh?c!
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
                    <span className="w-6 h-6 rounded-md bg-slate-800/80 text-slate-400 text-[11px] font-bold flex items-center justify-center shrink-0 border border-slate-700/40">
                      {index + 1}
                    </span>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <strong className="text-white text-xs sm:text-sm font-bold truncate">
                          {person.name}
                        </strong>
                        {person.studentId && (
                          <span className="px-1.5 py-0.5 rounded bg-blue-950/70 border border-blue-500/40 text-blue-300 font-mono text-[10px] flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-blue-400" />
                            MSSV: {person.studentId}
                          </span>
                        )}
                        {isAssigned ? (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            Gh?p v?o ??i {person.assignedSlot}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-950/50 text-amber-300 border border-amber-500/30 shrink-0 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            Ch? gh?p ??i
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                        <span className="truncate flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-500 shrink-0" />
                          {person.email}
                        </span>
                        {person.phone && (
                          <span className="text-slate-400 truncate hidden sm:flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-500 shrink-0" />
                            {isAdmin ? person.phone : `${person.phone.substring(0, 4)}***`}
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
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white border border-slate-700 hover:border-rose-500 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Ch?nh s?a th?ng tin n?u ?i?n sai"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>S?a</span>
                      </button>
                    )}
                    {isAssigned && (
                      <span className="text-[11px] font-bold text-rose-300 bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-lg inline-block">
                        Slot #{person.assignedSlot}
                      </span>
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
