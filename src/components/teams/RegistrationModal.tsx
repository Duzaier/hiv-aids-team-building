'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import {
  X,
  UserPlus,
  Trash2,
  User as UserIcon,
  GraduationCap,
  Mail,
  Phone,
  AlertCircle,
  Shield
} from 'lucide-react';

export interface MemberFormItem {
  name: string;
  studentId: string;
  email: string;
  phone: string;
}

interface RegistrationModalProps {
  isOpen: boolean;
  targetSlot: number;
  currentUser: User | null;
  onClose: () => void;
  onSubmit: (teamData: {
    teamName?: string;
    members: MemberFormItem[];
    slotNumber: number;
  }) => Promise<{ success: boolean; error?: string } | void> | void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  targetSlot,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<MemberFormItem[]>([
    { name: '', studentId: '', email: '', phone: '' },
    { name: '', studentId: '', email: '', phone: '' }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultTeamName = `??i ${targetSlot}`;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setIsSubmitting(false);

      // Pre-fill member 1 with current user if logged in (minimum 2 members)
      setMembers([
        {
          name: currentUser?.name || '',
          studentId: '',
          email: currentUser?.email || '',
          phone: ''
        },
        { name: '', studentId: '', email: '', phone: '' }
      ]);
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleMemberChange = (
    index: number,
    field: keyof MemberFormItem,
    value: string
  ) => {
    const updated = [...members];
    updated[index] = { ...updated[index], [field]: value };
    setMembers(updated);
    if (error) setError(null);
  };

  const addMember = () => {
    if (members.length < 5) {
      setMembers([...members, { name: '', studentId: '', email: '', phone: '' }]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 2) {
      setMembers(members.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (members.length < 2) {
      setError('??i ph?i c? ?t nh?t 2 th?nh vi?n ban ??u');
      return;
    }
    if (members.length > 5) {
      setError('??i ch? ???c t?i ?a 5 th?nh vi?n');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      if (!m.name.trim()) {
        setError(`Vui l?ng nh?p H? v? t?n cho Th?nh vi?n #${i + 1}`);
        return;
      }
      if (!m.studentId.trim()) {
        setError(`Vui l?ng nh?p MSSV cho Th?nh vi?n #${i + 1}`);
        return;
      }
      if (!m.email.trim() || !emailRegex.test(m.email.trim())) {
        setError(`Vui l?ng nh?p Gmail h?p l? cho Th?nh vi?n #${i + 1}`);
        return;
      }
      if (!m.phone.trim() || m.phone.trim().length < 8) {
        setError(`Vui l?ng nh?p S? ?i?n tho?i (Zalo) h?p l? cho Th?nh vi?n #${i + 1}`);
        return;
      }
    }

    // Check duplicate student IDs
    const studentIds = members.map((m) => m.studentId.trim().toLowerCase());
    const uniqueStudentIds = new Set(studentIds);
    if (uniqueStudentIds.size !== studentIds.length) {
      setError('C?c th?nh vi?n trong c?ng m?t ??i kh?ng ???c tr?ng MSSV.');
      return;
    }

    // Check duplicate emails
    const emails = members.map((m) => m.email.trim().toLowerCase());
    const uniqueEmails = new Set(emails);
    if (uniqueEmails.size !== emails.length) {
      setError('C?c th?nh vi?n trong c?ng m?t ??i kh?ng ???c tr?ng Gmail.');
      return;
    }

    const cleanMembers = members.map((m) => ({
      name: m.name.trim(),
      studentId: m.studentId.trim(),
      email: m.email.trim().toLowerCase(),
      phone: m.phone.trim()
    }));

    try {
      setIsSubmitting(true);
      const res = await onSubmit({
        teamName: defaultTeamName,
        members: cleanMembers,
        slotNumber: targetSlot
      });

      if (res && res.success === false) {
        setError(res.error || '??ng k? th?t b?i. Vui l?ng ki?m tra l?i th?ng tin.');
      }
    } catch (err: any) {
      setError(err?.message || 'C? l?i x?y ra khi k?t n?i m?y ch?.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div
        ref={scrollContainerRef}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-white shadow-md shadow-rose-600/20 shrink-0">
              <Shield className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                ??i #{targetSlot}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                ??ng K? {defaultTeamName}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="??ng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Representative info notice */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 block text-[11px]">T?i kho?n ??i di?n ??ng k?:</span>
                <span className="font-semibold text-white truncate block">
                  {currentUser.name} ({currentUser.email})
                </span>
              </div>
            </div>
          )}

          {/* Members List Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300 block">
                  Th?ng Tin Th?nh Vi?n ({members.length}/5 ng??i)
                </label>
                <span className="text-[11px] text-slate-400">
                  T?i thi?u 2, t?i ?a 5 ng??i ? C?n ?i?n ??y ?? MSSV, Gmail, S?T (Zalo) ?? Ban T? Ch?c li?n h?
                </span>
              </div>
              {members.length < 5 && (
                <button
                  type="button"
                  onClick={addMember}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Th?m ng??i</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={index}
                  className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-rose-950 text-rose-300 font-bold text-xs border border-rose-500/30">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-white">
                        Th?nh vi?n #{index + 1} {index === 0 && <span className="text-amber-400 font-normal">(??i di?n ??i)</span>}
                      </span>
                    </div>

                    {members.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors text-xs flex items-center gap-1 cursor-pointer"
                        title="X?a th?nh vi?n n?y"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">X?a</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* H? v? t?n */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                        <UserIcon className="w-3 h-3 text-slate-500" />
                        <span>H? v? t?n</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nguy?n V?n An"
                        value={member.name}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                        required
                      />
                    </div>

                    {/* MSSV */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                        <GraduationCap className="w-3 h-3 text-blue-400" />
                        <span>MSSV (M? s? sinh vi?n)</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: SE170123"
                        value={member.studentId}
                        onChange={(e) => handleMemberChange(index, 'studentId', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono transition-colors"
                        required
                      />
                    </div>

                    {/* Gmail */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>Gmail</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="VD: an.nv@gmail.com"
                        value={member.email}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                        required
                      />
                    </div>

                    {/* S?T / Zalo */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 mb-1 flex items-center gap-1.5">
                        <Phone className="w-3 h-3 text-slate-500" />
                        <span>S? ?i?n tho?i (Zalo)</span>
                        <span className="text-rose-400">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="VD: 0912345678"
                        value={member.phone}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              H?y
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer border border-rose-500/30 ${
                isSubmitting ? 'bg-rose-900/80 cursor-wait opacity-80' : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>?ang ghi danh...</span>
                </>
              ) : (
                <span>??NG K?</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
