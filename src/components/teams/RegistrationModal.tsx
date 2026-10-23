'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { User } from '@/types';
import { Plus, Trash2, AlertCircle, CheckCircle2, Sparkles, Loader2, Users } from 'lucide-react';
import confetti from 'canvas-confetti';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetSlot: number;
  currentUser: User | null;
  onRegisterSuccess: (teamData: {
    slotNumber: number;
    teamName: string;
    members: string[];
  }) => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  targetSlot,
  currentUser,
  onRegisterSuccess
}) => {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>(['', '', '']);
  const [errors, setErrors] = useState<{ teamName?: string; members?: string[]; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill member 1 with current user's name when opening
  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      const initialLeader = currentUser?.name ? `${currentUser.name} (Äá»™i trÆ°á»Ÿng)` : '';
      setMembers([initialLeader, '', '']);
      setErrors({});
      setIsSubmitting(false);
    }
  }, [isOpen, currentUser]);

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    // Clear error for this member
    if (errors.members && errors.members[index]) {
      const updatedErr = [...(errors.members || [])];
      updatedErr[index] = '';
      setErrors({ ...errors, members: updatedErr });
    }
  };

  const handleAddMember = () => {
    if (members.length < 5) {
      setMembers([...members, '']);
    }
  };

  const handleRemoveMember = (index: number) => {
    if (members.length > 3) {
      const updated = members.filter((_, i) => i !== index);
      setMembers(updated);
    }
  };

  const validate = () => {
    const newErrors: { teamName?: string; members?: string[]; general?: string } = {};
    const trimmedTeam = teamName.trim();

    if (!trimmedTeam) {
      newErrors.teamName = 'TÃªn Ä‘á»™i lÃ  báº¯t buá»™c';
    } else if (trimmedTeam.length < 2) {
      newErrors.teamName = 'TÃªn Ä‘á»™i pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±';
    } else if (trimmedTeam.length > 50) {
      newErrors.teamName = 'TÃªn Ä‘á»™i khÃ´ng Ä‘Æ°á»£c vÆ°á»£t quÃ¡ 50 kÃ½ tá»±';
    }

    const memberErrors: string[] = [];
    const trimmedMembers = members.map((m) => m.trim());
    const seenNames = new Set<string>();

    trimmedMembers.forEach((name, idx) => {
      if (!name) {
        memberErrors[idx] = `Vui lÃ²ng nháº­p há» tÃªn thÃ nh viÃªn ${idx + 1}`;
      } else if (name.length < 2) {
        memberErrors[idx] = 'Há» tÃªn pháº£i cÃ³ Ã­t nháº¥t 2 kÃ½ tá»±';
      } else if (seenNames.has(name.toLowerCase())) {
        memberErrors[idx] = 'TÃªn thÃ nh viÃªn nÃ y bá»‹ trÃ¹ng láº·p trong Ä‘á»™i';
      } else {
        seenNames.add(name.toLowerCase());
      }
    });

    if (memberErrors.some((e) => !!e)) {
      newErrors.members = memberErrors;
    }

    if (trimmedMembers.length < 3 || trimmedMembers.length > 5) {
      newErrors.general = 'Äá»™i pháº£i cÃ³ tá»« 3 Ä‘áº¿n 5 thÃ nh viÃªn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Simulate network submission
    setTimeout(() => {
      setIsSubmitting(false);

      // Trigger celebration confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // graceful fallback if canvas-confetti fails
      }

      onRegisterSuccess({
        slotNumber: targetSlot,
        teamName: teamName.trim(),
        members: members.map((m) => m.trim())
      });
      onClose();
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`ÄÄƒng KÃ½ Äá»™i VÃ o Vá»‹ TrÃ­ #${targetSlot}`}
      subtitle="Quy Ä‘á»‹nh má»—i Ä‘á»™i gá»“m tá»« 3 Ä‘áº¿n 5 thÃ nh viÃªn. Má»—i tÃ i khoáº£n Google sá»Ÿ há»¯u 1 Ä‘á»™i."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Slot Announcement Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 to-slate-900 border border-red-500/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-red-400 font-semibold uppercase tracking-wider block">
              Vá»‹ trÃ­ Ä‘Æ°á»£c phÃ¢n bá»•
            </span>
            <span className="text-lg font-black text-white">
              Slot #{targetSlot} trÃªn báº£ng tá»•ng sáº¯p
            </span>
          </div>
          <span className="px-3 py-1 rounded-lg bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-bold">
            Thá»© tá»± 0{targetSlot}
          </span>
        </div>

        {/* Team Name Input */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="teamName" className="block text-sm font-semibold text-slate-200">
              TÃªn Ä‘á»™i thi Ä‘áº¥u <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {teamName.trim().length}/50 kÃ½ tá»±
            </span>
          </div>
          <input
            id="teamName"
            type="text"
            value={teamName}
            maxLength={50}
            onChange={(e) => {
              setTeamName(e.target.value);
              if (errors.teamName) setErrors({ ...errors, teamName: undefined });
            }}
            placeholder="VÃ­ dá»¥: Chiáº¿n Binh Hy Vá»ng, Sáº£i BÆ°á»›c Káº¿t Ná»‘i..."
            className={`w-full px-4 py-3 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 transition-all ${
              errors.teamName
                ? 'border-red-500 focus:ring-red-500/50'
                : 'border-slate-800 focus:border-red-500 focus:ring-red-500/30'
            }`}
          />
          {errors.teamName && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.teamName}
            </p>
          )}
        </div>

        {/* Members List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-sm font-semibold text-slate-200">
                Danh sÃ¡ch thÃ nh viÃªn ({members.length}/5) <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-slate-400">
                Tá»‘i thiá»ƒu 3 ngÆ°á»i, tá»‘i Ä‘a 5 ngÆ°á»i (ThÃ nh viÃªn 1 lÃ  Äá»™i trÆ°á»Ÿng).
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddMember}
              disabled={members.length >= 5}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                members.length >= 5
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              ThÃªm ngÆ°á»i ({members.length}/5)
            </button>
          </div>

          <div className="space-y-3">
            {members.map((member, idx) => (
              <div key={idx} className="relative flex items-center gap-2">
                <span className="w-8 h-10 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={
                      idx === 0
                        ? 'Há» vÃ  tÃªn Äá»™i trÆ°á»Ÿng...'
                        : `Há» vÃ  tÃªn thÃ nh viÃªn ${idx + 1}...`
                    }
                    className={`w-full px-4 py-2.5 rounded-xl bg-slate-950 border text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 transition-all ${
                      errors.members && errors.members[idx]
                        ? 'border-red-500 focus:ring-red-500/50'
                        : 'border-slate-800 focus:border-red-500 focus:ring-red-500/30'
                    }`}
                  />
                  {errors.members && errors.members[idx] && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.members[idx]}
                    </p>
                  )}
                </div>

                {/* Delete button (only if > 3 members) */}
                {members.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                    title="XÃ³a thÃ nh viÃªn nÃ y"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {errors.general && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.general}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Há»§y bá»
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Äang xá»­ lÃ½ Ä‘Äƒng kÃ½...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                HoÃ n táº¥t ghi danh
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
