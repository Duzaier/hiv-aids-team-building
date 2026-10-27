'use client';

import React, { useState, useEffect, useRef } from 'react';
import { User } from '@/types';
import { X, UserPlus, Trash2, Lock, Crown, AlertCircle } from 'lucide-react';

export interface MemberFormItem {
  name: string;
  studentId: string;
  email: string;
  phone: string;
  isCaptain?: boolean;
}

interface RegistrationModalProps {
  isCapacityFull?: boolean;
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
  isCapacityFull = false,
  targetSlot,
  currentUser,
  onClose,
  onSubmit
}) => {
  const [members, setMembers] = useState<MemberFormItem[]>([
    { name: '', studentId: '', email: '', phone: '', isCaptain: true }
  ]);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const defaultTeamName = `Đội ${targetSlot}`;

  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFieldErrors({});
      setIsSubmitting(false);

      // Pre-fill member 1 with current user if logged in, defaults to Captain
      setMembers([
        {
          name: '',
          studentId: '',
          email: currentUser?.email || '',
          phone: '',
          isCaptain: true
        }
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

    // Clear specific field error
    const key = `${index}_${field}`;
    if (fieldErrors[key]) {
      const nextErrors = { ...fieldErrors };
      delete nextErrors[key];
      setFieldErrors(nextErrors);
    }
    if (error) setError(null);
  };

  const handleSetCaptain = (index: number) => {
    const updated = members.map((m, i) => ({
      ...m,
      isCaptain: i === index
    }));
    setMembers(updated);
  };

  const addMember = () => {
    if (members.length < 5 && !isSubmitting) {
      setMembers([
        ...members,
        { name: '', studentId: '', email: '', phone: '', isCaptain: false }
      ]);
    }
  };

  const removeMember = (index: number) => {
    if (members.length > 1 && !isSubmitting) {
      const isRemovingCaptain = members[index].isCaptain;
      const updated = members.filter((_, i) => i !== index);
      // If the removed member was captain, default member #1 to captain
      if (isRemovingCaptain || !updated.some((m) => m.isCaptain)) {
        updated[0] = { ...updated[0], isCaptain: true };
      }
      setMembers(updated);
      setFieldErrors({});
    }
  };

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    let firstErrorMsg = '';

    if (members.length < 1) {
      setError('Đội thi đấu bắt buộc phải có tối thiểu 1 thành viên');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[\d\s+().-]{8,20}$/;

    const seenNames = new Map<string, number>();
    const seenStudentIds = new Map<string, number>();
    const seenEmails = new Map<string, number>();

    for (let i = 0; i < members.length; i++) {
      const m = members[i];
      const cleanName = m.name.trim();
      const cleanStudentId = m.studentId.trim();
      const cleanEmail = m.email.trim().toLowerCase();
      const cleanPhone = m.phone.trim();

      // Họ và tên
      if (!cleanName) {
        errors[`${i}_name`] = 'Vui lòng nhập Họ và tên';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Vui lòng nhập Họ và tên.`;
      } else if (cleanName.length < 2) {
        errors[`${i}_name`] = 'Họ tên phải có ít nhất 2 ký tự';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Họ tên phải có ít nhất 2 ký tự.`;
      }

      // MSSV
      if (!cleanStudentId) {
        errors[`${i}_studentId`] = 'Vui lòng nhập MSSV';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Vui lòng nhập Mã số sinh viên (MSSV).`;
      } else if (cleanStudentId.length < 3) {
        errors[`${i}_studentId`] = 'MSSV không hợp lệ (tối thiểu 3 ký tự)';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: MSSV không hợp lệ.`;
      }

      // Email
      if (!cleanEmail) {
        errors[`${i}_email`] = 'Vui lòng nhập địa chỉ Gmail';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Vui lòng nhập Gmail.`;
      } else if (!emailRegex.test(cleanEmail)) {
        errors[`${i}_email`] = 'Địa chỉ Gmail không đúng định dạng';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Gmail không hợp lệ (VD: user@gmail.com).`;
      }

      // Số điện thoại / Zalo
      if (!cleanPhone) {
        errors[`${i}_phone`] = 'Vui lòng nhập số điện thoại hoặc Zalo';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Vui lòng nhập số điện thoại hoặc Zalo.`;
      } else if (!phoneRegex.test(cleanPhone) || cleanPhone.replace(/\D/g, '').length < 8) {
        errors[`${i}_phone`] = 'Số điện thoại không hợp lệ (tối thiểu 8 số)';
        if (!firstErrorMsg) firstErrorMsg = `Thành viên #${i + 1}: Số điện thoại không hợp lệ (tối thiểu 8 số).`;
      }

      // Trùng lặp trong đội
      if (cleanName) {
        const lowerName = cleanName.toLowerCase();
        if (seenNames.has(lowerName)) {
          const prevIdx = seenNames.get(lowerName)!;
          errors[`${i}_name`] = `Trùng họ tên với Thành viên #${prevIdx + 1}`;
          if (!firstErrorMsg) firstErrorMsg = `Họ tên "${cleanName}" bị trùng giữa Thành viên #${prevIdx + 1} và #${i + 1}.`;
        } else {
          seenNames.set(lowerName, i);
        }
      }

      if (cleanStudentId) {
        const upperId = cleanStudentId.toUpperCase();
        if (seenStudentIds.has(upperId)) {
          const prevIdx = seenStudentIds.get(upperId)!;
          errors[`${i}_studentId`] = `Trùng MSSV với Thành viên #${prevIdx + 1}`;
          if (!firstErrorMsg) firstErrorMsg = `MSSV "${cleanStudentId}" bị trùng giữa Thành viên #${prevIdx + 1} và #${i + 1}.`;
        } else {
          seenStudentIds.set(upperId, i);
        }
      }

      if (cleanEmail) {
        if (seenEmails.has(cleanEmail)) {
          const prevIdx = seenEmails.get(cleanEmail)!;
          errors[`${i}_email`] = `Trùng Gmail với Thành viên #${prevIdx + 1}`;
          if (!firstErrorMsg) firstErrorMsg = `Gmail "${cleanEmail}" bị trùng giữa Thành viên #${prevIdx + 1} và #${i + 1}.`;
        } else {
          seenEmails.set(cleanEmail, i);
        }
      }
    }

    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setError(firstErrorMsg || 'Vui lòng kiểm tra và hoàn thiện các trường thông tin được đánh dấu.');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    // Ensure at least one member is marked as Captain
    const hasCaptain = members.some((m) => m.isCaptain);
    const cleanMembers: MemberFormItem[] = members.map((m, idx) => ({
      name: m.name.trim(),
      studentId: m.studentId.trim(),
      email: m.email.trim().toLowerCase(),
      phone: m.phone.trim(),
      isCaptain: hasCaptain ? Boolean(m.isCaptain) : idx === 0
    }));

    try {
      setIsSubmitting(true);
      const res = await onSubmit({
        teamName: defaultTeamName,
        members: cleanMembers,
        slotNumber: targetSlot
      });

      if (res && res.success === false) {
        setError(res.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.');
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Có lỗi xảy ra khi kết nối máy chủ.');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div
        ref={scrollContainerRef}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block">
              Đội #{targetSlot}
            </span>
            <h3 className="text-lg sm:text-xl font-black text-white">
              Đăng Ký {defaultTeamName}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in duration-200 shadow-md shadow-red-950/40">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold text-red-300 block mb-0.5">Chưa đảm bảo điều kiện đăng ký:</span>
              <span>{error}</span>
            </div>
          </div>
        )}

        {isCapacityFull && (
          <div className="p-3.5 mb-3 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2.5">
            <Lock className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Hệ thống đã đạt giới hạn tối đa 30 thí sinh tham gia. Cổng đăng ký theo đội hiện đã khóa.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Representative info notice */}
          {currentUser && (
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <div className="min-w-0">
                <span className="text-slate-400 block text-[11px]">Tài khoản đại diện đăng ký:</span>
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
                  Thông Tin Thành Viên ({members.length}/5 người)
                </label>
                <span className="text-[11px] text-slate-400">
                  {members.length === 1
                    ? 'Đội 1 người thì mặc định người này là Đội trưởng.'
                    : 'Nhấp "Chỉ định Đội trưởng" để đổi người làm Đội trưởng.'}
                </span>
              </div>
              {members.length < 5 && (
                <button
                  type="button"
                  onClick={addMember}
                  disabled={isSubmitting || isCapacityFull}
                  className="px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/40 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Thêm người</span>
                </button>
              )}
            </div>

            <div className="space-y-3">
              {members.map((member, index) => (
                <div
                  key={index}
                  className={`p-3.5 sm:p-4 rounded-xl bg-slate-950/70 border transition-colors space-y-2.5 ${
                    member.isCaptain
                      ? 'border-amber-500/50 bg-amber-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-950 text-red-300 font-bold text-xs border border-red-500/30">
                        {index + 1}
                      </span>
                      <span className="text-xs font-bold text-white">
                        Thành viên #{index + 1}
                      </span>

                      {/* Captain Badge or Designation Button */}
                      {member.isCaptain ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                          <Crown className="w-3 h-3 text-amber-400" />
                          <span>Đội trưởng</span>
                        </span>
                      ) : (
                        members.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleSetCaptain(index)}
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-800 hover:bg-amber-950/60 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-500/40 text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-50"
                            title="Chỉ định thành viên này làm Đội trưởng"
                          >
                            <Crown className="w-2.5 h-2.5" />
                            <span>Chỉ định Đội trưởng</span>
                          </button>
                        )
                      )}
                    </div>

                    {members.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMember(index)}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-rose-400 p-1 transition-colors text-xs flex items-center gap-1 cursor-pointer active:scale-95 ml-auto disabled:opacity-50"
                        title="Xóa thành viên này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Xóa</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Họ và tên */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Họ và tên <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Nguyễn Văn An"
                        value={member.name}
                        disabled={isSubmitting}
                        onChange={(e) => handleMemberChange(index, 'name', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                          fieldErrors[`${index}_name`]
                            ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                            : 'border-slate-700 focus:border-red-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {fieldErrors[`${index}_name`] && (
                        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors[`${index}_name`]}</span>
                        </p>
                      )}
                    </div>

                    {/* MSSV */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        MSSV (Mã số sinh viên) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="VD: SE170123"
                        value={member.studentId}
                        disabled={isSubmitting}
                        onChange={(e) => handleMemberChange(index, 'studentId', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                          fieldErrors[`${index}_studentId`]
                            ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                            : 'border-slate-700 focus:border-red-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {fieldErrors[`${index}_studentId`] && (
                        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors[`${index}_studentId`]}</span>
                        </p>
                      )}
                    </div>

                    {/* Gmail */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Gmail <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        placeholder="VD: an.nv@gmail.com"
                        value={member.email}
                        disabled={isSubmitting}
                        onChange={(e) => handleMemberChange(index, 'email', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                          fieldErrors[`${index}_email`]
                            ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                            : 'border-slate-700 focus:border-red-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {fieldErrors[`${index}_email`] && (
                        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors[`${index}_email`]}</span>
                        </p>
                      )}
                    </div>

                    {/* SĐT / Zalo */}
                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">
                        Số điện thoại (Zalo) <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="VD: 0912345678"
                        value={member.phone}
                        disabled={isSubmitting}
                        onChange={(e) => handleMemberChange(index, 'phone', e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl bg-slate-900 border text-xs text-white placeholder-slate-500 focus:outline-hidden transition-colors ${
                          fieldErrors[`${index}_phone`]
                            ? 'border-red-500 ring-1 ring-red-500/50 bg-red-950/20'
                            : 'border-slate-700 focus:border-red-500'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      />
                      {fieldErrors[`${index}_phone`] && (
                        <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3 h-3 shrink-0" />
                          <span>{fieldErrors[`${index}_phone`]}</span>
                        </p>
                      )}
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
              disabled={isSubmitting || isCapacityFull}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isCapacityFull}
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-950/50 cursor-pointer active:scale-95"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang đăng ký đội...</span>
                </>
              ) : (
                <span>Xác Nhận Đăng Ký Đội</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
