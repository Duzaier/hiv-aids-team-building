'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Team } from '@/types';
import { Plus, Trash2, AlertCircle, Sparkles, Loader2, Lock } from 'lucide-react';

interface EditTeamModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  isAdminEdit?: boolean;
  onUpdateSuccess: (updatedTeam: Team) => void;
}

export const EditTeamModal: React.FC<EditTeamModalProps> = ({
  isOpen,
  onClose,
  team,
  isAdminEdit = false,
  onUpdateSuccess
}) => {
  const [teamName, setTeamName] = useState('');
  const [members, setMembers] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ teamName?: string; members?: string[]; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (team && isOpen) {
      setTeamName(team.name);
      setMembers(team.members.map((m) => m.name));
      setErrors({});
      setIsSubmitting(false);
    }
  }, [team, isOpen]);

  if (!team) return null;

  const handleMemberChange = (index: number, value: string) => {
    const updated = [...members];
    updated[index] = value;
    setMembers(updated);

    if (errors.members && errors.members[index]) {
      const updatedErr = [...errors.members];
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
      newErrors.teamName = 'TÃªn Ä‘á»™i khÃ´ng Ä‘Æ°á»£c Ä‘á»ƒ trá»‘ng';
    } else if (trimmedTeam.length < 2) {
      newErrors.teamName = 'TÃªn Ä‘á»™i pháº£i tá»« 2 kÃ½ tá»± trá»Ÿ lÃªn';
    } else if (trimmedTeam.length > 50) {
      newErrors.teamName = 'TÃªn Ä‘á»™i tá»‘i Ä‘a 50 kÃ½ tá»±';
    }

    const memberErrors: string[] = [];
    const trimmedMembers = members.map((m) => m.trim());
    const seenNames = new Set<string>();

    trimmedMembers.forEach((name, idx) => {
      if (!name) {
        memberErrors[idx] = `Vui lÃ²ng nháº­p tÃªn thÃ nh viÃªn ${idx + 1}`;
      } else if (name.length < 2) {
        memberErrors[idx] = 'TÃªn pháº£i tá»« 2 kÃ½ tá»±';
      } else if (seenNames.has(name.toLowerCase())) {
        memberErrors[idx] = 'TÃªn thÃ nh viÃªn bá»‹ trÃ¹ng láº·p';
      } else {
        seenNames.add(name.toLowerCase());
      }
    });

    if (memberErrors.some((e) => !!e)) {
      newErrors.members = memberErrors;
    }

    if (trimmedMembers.length < 3 || trimmedMembers.length > 5) {
      newErrors.general = 'Äá»™i báº¯t buá»™c cÃ³ tá»« 3 Ä‘áº¿n 5 thÃ nh viÃªn';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const updated: Team = {
        ...team,
        name: teamName.trim(),
        members: members.map((name, i) => ({
          id: team.members[i]?.id || `m-new-${Date.now()}-${i}`,
          name: name.trim()
        }))
      };
      onUpdateSuccess(updated);
      onClose();
    }, 500);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isAdminEdit ? `Quáº£n Trá»‹: Chá»‰nh Sá»­a Äá»™i #${team.slotNumber}` : `Chá»‰nh Sá»­a Äá»™i Cá»§a Báº¡n (#${team.slotNumber})`}
      subtitle={`Vá»‹ trÃ­ Slot #${team.slotNumber} vÃ  quyá»n sá»Ÿ há»¯u Ä‘Æ°á»£c khÃ³a cá»‘ Ä‘á»‹nh Ä‘á»ƒ Ä‘áº£m báº£o tÃ­nh toÃ n váº¹n.`}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Immutable Meta Info */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 block mb-0.5">Vá»‹ trÃ­ cá»‘ Ä‘á»‹nh (Slot)</span>
            <span className="font-bold text-white flex items-center gap-1">
              <Lock className="w-3 h-3 text-amber-400" />
              Tháº» sá»‘ 0{team.slotNumber}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block mb-0.5">Chá»§ sá»Ÿ há»¯u Ä‘á»™i</span>
            <span className="font-semibold text-slate-300 truncate block">
              {team.ownerName}
            </span>
          </div>
        </div>

        {/* Team Name */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="editTeamName" className="block text-sm font-semibold text-slate-200">
              TÃªn Ä‘á»™i thi Ä‘áº¥u <span className="text-red-400">*</span>
            </label>
            <span className="text-xs text-slate-400 font-mono">
              {teamName.trim().length}/50 kÃ½ tá»±
            </span>
          </div>
          <input
            id="editTeamName"
            type="text"
            value={teamName}
            maxLength={50}
            onChange={(e) => {
              setTeamName(e.target.value);
              if (errors.teamName) setErrors({ ...errors, teamName: undefined });
            }}
            className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-white text-sm"
          />
          {errors.teamName && (
            <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.teamName}
            </p>
          )}
        </div>

        {/* Members Management */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div>
              <label className="block text-sm font-semibold text-slate-200">
                ThÃ nh viÃªn Ä‘á»™i ({members.length}/5) <span className="text-red-400">*</span>
              </label>
              <p className="text-xs text-slate-400">
                ÄÆ°á»£c phÃ©p Ä‘iá»u chá»‰nh tÃªn, thÃªm hoáº·c bá»›t trong giá»›i háº¡n 3 - 5 ngÆ°á»i.
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
              ThÃªm ({members.length}/5)
            </button>
          </div>

          <div className="space-y-3">
            {members.map((member, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-8 h-10 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 font-mono text-xs flex items-center justify-center font-bold">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <input
                    type="text"
                    value={member}
                    onChange={(e) => handleMemberChange(idx, e.target.value)}
                    placeholder={`Há» vÃ  tÃªn thÃ nh viÃªn ${idx + 1}...`}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-red-500 focus:ring-2 focus:ring-red-500/30 text-white text-sm"
                  />
                  {errors.members && errors.members[idx] && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.members[idx]}
                    </p>
                  )}
                </div>

                {members.length > 3 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveMember(idx)}
                    className="p-2.5 rounded-xl bg-slate-950 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border border-slate-800 transition-colors"
                    title="XÃ³a thÃ nh viÃªn"
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

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Há»§y
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-600/25 flex items-center gap-2 transition-all"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Äang lÆ°u thay Ä‘á»•i...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Cáº­p nháº­t thÃ´ng tin
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
