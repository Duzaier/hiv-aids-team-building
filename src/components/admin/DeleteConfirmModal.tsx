'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Team } from '@/types';
import { AlertTriangle, Trash2, Loader2, ArrowRight } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onConfirmDelete: (teamId: string, slotNumber: number) => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  team,
  onConfirmDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!team) return null;

  const handleConfirm = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      onConfirmDelete(team.id, team.slotNumber);
      onClose();
    }, 600);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="XÃ¡c Nháº­n Há»§y ÄÄƒng KÃ½ Äá»™i"
      subtitle="Thao tÃ¡c nÃ y chá»‰ dÃ nh cho Quáº£n trá»‹ viÃªn vÃ  yÃªu cáº§u kiá»ƒm tra cáº©n trá»ng."
    >
      <div className="space-y-5">
        <div className="p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Cáº£nh bÃ¡o hÃ nh Ä‘á»™ng xÃ³a dá»¯ liá»‡u</p>
            <p className="text-xs leading-relaxed text-red-300">
              Báº¡n Ä‘ang chuáº©n bá»‹ há»§y Ä‘Äƒng kÃ½ cá»§a <strong>{team.name}</strong> (Vá»‹ trÃ­ Slot #{team.slotNumber}).
            </p>
          </div>
        </div>

        {/* Policy explanation */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-2">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
            ChÃ­nh sÃ¡ch giáº£i phÃ³ng Slot:
          </p>
          <p className="text-slate-400 leading-relaxed">
            Ngay khi xÃ¡c nháº­n xÃ³a, <strong>Vá»‹ trÃ­ #{team.slotNumber}</strong> sáº½ láº­p tá»©c trá»Ÿ láº¡i tráº¡ng thÃ¡i <em>CÃ²n trá»‘ng (Available)</em>. Äá»™i Ä‘Äƒng kÃ½ tiáº¿p theo sáº½ cÃ³ thá»ƒ ghi danh vÃ o vá»‹ trÃ­ nÃ y.
          </p>
        </div>

        {/* Team Summary */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-400">Äá»™i thi Ä‘áº¥u:</span>
            <span className="font-bold text-white">{team.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Äá»™i trÆ°á»Ÿng:</span>
            <span className="font-medium text-slate-200">{team.ownerName} ({team.ownerEmail})</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Sá»‘ lÆ°á»£ng thÃ nh viÃªn:</span>
            <span className="font-medium text-slate-200">{team.members.length} ngÆ°á»i</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Há»§y thao tÃ¡c
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-6 py-2.5 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Äang xÃ³a vÃ  giáº£i phÃ³ng slot...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                XÃ¡c nháº­n xÃ³a vÄ©nh viá»…n
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
