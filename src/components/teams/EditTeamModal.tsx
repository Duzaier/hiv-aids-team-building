'use client';

import React, { useState, useEffect } from 'react';
import { Team, TeamMember } from '@/types';
import {
  X,
  UserPlus,
  Trash2,
  Pencil,
  User as UserIcon,
  GraduationCap,
  Mail,
  Phone,
  AlertCircle
} from 'lucide-react';
import { MemberFormItem } from './RegistrationModal';

interface EditTeamModalProps {
  isOpen: boolean;
  team: Team | null;
  isAdminMode?: boolean;
  onClose: () => void;
  onSubmit: (updatedData: {
    teamName: string;
    captainName: string;
    members: MemberFormItem[];
  }) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  team,
  isAdminMode = false,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<MemberFormItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (team) {
      setMembers(
        team.members.map((m) => ({
          name: m.name || '',
          studentId: m.studentId || '',
          email: m.email || '',
          phone: m.phone || ''
        }))
      );
      setError(null);
    }
  }, [team]);

  if (!isOpen || !team) return null;

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
    if (members.length > 1) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

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
      if (!m.email.trim() || !m.email.includes('@')) {
        setError(`Vui l?ng nh?p Gmail h?p l? cho Th?nh vi?n #${i + 1}`);
        return;
      }
      if (!m.phone.trim()) {
        setError(`Vui l?ng nh?p S?T (Zalo) cho Th?nh vi?n #${i + 1}`);
        return;
      }
    }

    const cleanMembers: MemberFormItem[] = members.map((m) => ({
      name: m.name.trim(),
      studentId: m.studentId.trim(),
      email: m.email.trim().toLowerCase(),
      phone: m.phone.trim()
    }));

    onSubmit({
      teamName: team.name,
      captainName: '',
      members: cleanMembers
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 shadow-md shadow-amber-500/20 shrink-0 font-bold">
              <Pencil className="w-4 h-4" />
            </span>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                ??i #{team.slotNumber} ? {isAdminMode ? 'Ch? ?? Admin' : '??i c?a b?n'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Ch?nh S?a {team.name}
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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Danh S?ch Th?nh Vi?n ({members.length}/5 ng??i)
            </label>
            {members.length < 5 && (
              <button
                type="button"
                onClick={addMember}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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
                className="p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400">
                    Th?nh vi?n #{index + 1}
                  </span>
                  {members.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMember(index)}
                      className="text-slate-400 hover:text-rose-400 text-xs flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>X?a</span>
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                      <UserIcon className="w-3 h-3 text-slate-500" />
                      <span>H? v? t?n</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                      <GraduationCap className="w-3 h-3 text-blue-400" />
                      <span>MSSV (M? s? sinh vi?n)</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={member.studentId}
                      onChange={(e) => handleMemberChange(index, 'studentId', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-500" />
                      <span>Gmail</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-slate-400 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>S?T / Zalo</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      value={member.phone}
                      onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              H?y
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-500/20 cursor-pointer"
            >
              L?u thay ??i
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
