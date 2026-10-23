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
      title="Xác Nhận Hủy Đăng Ký Đội"
      subtitle="Thao tác này chỉ dành cho Quản trị viên và yêu cầu kiểm tra cẩn trọng."
    >
      <div className="space-y-4">
        <div className="p-3 sm:p-4 rounded-xl bg-red-950/50 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-white">Cảnh báo hành động xóa dữ liệu</p>
            <p className="text-xs leading-relaxed text-red-300">
              Bạn đang chuẩn bị hủy đăng ký của <strong>{team.name}</strong> (Vị trí Slot #{team.slotNumber}).
            </p>
          </div>
        </div>

        {/* Policy explanation */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1.5">
          <p className="font-semibold text-slate-200 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            Chính sách giải phóng Slot:
          </p>
          <p className="text-slate-400 leading-relaxed text-[11px] sm:text-xs">
            Ngay khi xác nhận xóa, <strong>Vị trí #{team.slotNumber}</strong> sẽ lập tức trở lại trạng thái <em>Còn trống (Available)</em>. Đội đăng ký tiếp theo sẽ có thể ghi danh vào vị trí này.
          </p>
        </div>

        {/* Team Summary */}
        <div className="p-3 sm:p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5">
          <div className="flex justify-between">
            <span className="text-slate-400">Đội thi đấu:</span>
            <span className="font-bold text-white">{team.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Đội trưởng:</span>
            <span className="font-medium text-slate-200 truncate ml-2">{team.ownerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Số lượng thành viên:</span>
            <span className="font-medium text-slate-200">{team.members.length} người</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            Hủy thao tác
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/30 flex items-center gap-2 transition-all"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Đang xóa...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 shrink-0" />
                Xác nhận xóa
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
