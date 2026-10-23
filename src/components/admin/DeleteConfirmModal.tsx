'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Team } from '@/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  team: Team | null;
  onConfirmDelete: (teamId: string, slotNumber: number) => Promise<void> | void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  team,
  onConfirmDelete
}) => {
  const [isDeleting, setIsDeleting] = useState(false);

  if (!team) return null;

  const handleConfirm = async () => {
    try {
      setIsDeleting(true);
      await onConfirmDelete(team.id, team.slotNumber);
      onClose();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Xác Nhận Xóa Đội"
      subtitle="Thao tác dành riêng cho Quản trị viên."
    >
      <div className="space-y-3.5">
        <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-xs sm:text-sm text-red-200 space-y-1">
          <p className="font-bold text-white">Bạn có chắc chắn muốn xóa?</p>
          <p className="text-xs text-red-300">
            Đội <strong>{team.name}</strong> (Slot #{team.slotNumber}) sẽ bị xóa và vị trí này lập tức trở lại trạng thái còn trống.
          </p>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Đội thi đấu:</span>
            <span className="font-semibold text-white">{team.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Đội trưởng:</span>
            <span className="text-slate-200 truncate ml-2">{team.ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Số lượng:</span>
            <span className="text-slate-200">{team.members.length} thành viên</span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Đang xóa...</span>
              </>
            ) : (
              <span>Xác nhận xóa</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
