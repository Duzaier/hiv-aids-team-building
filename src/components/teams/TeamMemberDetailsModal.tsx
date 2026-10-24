'use client';

import React, { useState } from 'react';
import { Team, TeamMember, User } from '@/types';
import {
  X,
  Shield,
  Users,
  User as UserIcon,
  Phone,
  Mail,
  GraduationCap,
  Pencil,
  Check,
  Copy,
  ExternalLink,
  Save,
  AlertCircle,
  Lock
} from 'lucide-react';

interface TeamMemberDetailsModalProps {
  isOpen: boolean;
  team: Team | null;
  currentUser: User | null;
  myIndividualId?: string | null;
  onClose: () => void;
  onRefresh?: () => void;
  onShowNotice?: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const TeamMemberDetailsModal: React.FC<TeamMemberDetailsModalProps> = ({
  isOpen,
  team,
  currentUser,
  myIndividualId,
  onClose,
  onRefresh,
  onShowNotice
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isEditingSelf, setIsEditingSelf] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Find the current user's member record in this team
  const myMember = team?.members.find((m) => {
    if (!currentUser) return false;
    const matchEmail = currentUser.email && m.email && m.email.toLowerCase() === currentUser.email.toLowerCase();
    const matchInd = myIndividualId && m.individualId && m.individualId === myIndividualId;
    return matchEmail || matchInd;
  });

  const [formData, setFormData] = useState({
    name: '',
    studentId: '',
    phone: '',
    email: ''
  });

  // Sync edit form when opening edit mode
  React.useEffect(() => {
    if (myMember) {
      setFormData({
        name: myMember.name || '',
        studentId: myMember.studentId || '',
        phone: myMember.phone || '',
        email: myMember.email || currentUser?.email || ''
      });
      setEditError(null);
    }
  }, [myMember, currentUser]);

  const isOwner = team?.ownerId === currentUser?.id || (currentUser?.email && team?.ownerEmail && team.ownerEmail.toLowerCase() === currentUser.email.toLowerCase());
  const isMember = !!myMember;
  const isAdmin = currentUser?.role === 'ADMIN';

  if (!isOpen || !team) return null;

  if (!isAdmin && !isOwner && !isMember) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
        <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-center text-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Lock className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-base font-bold text-white mb-1.5">Thông tin đội được bảo mật</h3>
          <p className="text-xs text-slate-400 mb-5 leading-relaxed">
            Bạn không thuộc đội này nên không có quyền xem thông tin chi tiết của các thành viên.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const handleSaveSelf = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!myMember && !myIndividualId) return;

    if (!formData.name.trim()) {
      setEditError('Vui lòng nhập họ và tên');
      return;
    }
    if (!formData.studentId.trim()) {
      setEditError('Vui lòng nhập mã số sinh viên (MSSV)');
      return;
    }
    if (!formData.phone.trim()) {
      setEditError('Vui lòng nhập số điện thoại hoặc Zalo liên hệ');
      return;
    }

    try {
      setIsSaving(true);
      setEditError(null);

      const res = await fetch('/api/teams/member', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
          'x-user-name': encodeURIComponent(currentUser?.name || ''),
          'x-user-role': currentUser?.role || 'USER'
        },
        body: JSON.stringify({
          memberId: myMember?.id,
          individualId: myMember?.individualId || myIndividualId || undefined,
          name: formData.name,
          studentId: formData.studentId,
          phone: formData.phone,
          email: formData.email
        })
      });

      const result = await res.json();
      if (result.success) {
        if (onShowNotice) {
          onShowNotice('success', result.message || 'Đã cập nhật thông tin cá nhân của bạn!');
        }
        setIsEditingSelf(false);
        if (onRefresh) {
          onRefresh();
        }
      } else {
        setEditError(result.error || 'Cập nhật thất bại. Vui lòng thử lại.');
      }
    } catch (err: any) {
      setEditError(err?.message || 'Có lỗi kết nối máy chủ');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-red-500/15 text-red-400 border border-red-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              {myMember && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 font-semibold">
                    Đội của bạn
                  </span>
                </div>
              )}
              <h3 className="text-lg sm:text-xl font-black text-white truncate">
                {team.name}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notice for Teammates */}
        <div className="p-3 rounded-xl bg-blue-950/20 border border-blue-500/30 text-blue-200 text-xs mb-5 flex items-start gap-2.5">
          <Users className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-white mb-0.5">Liên hệ nội bộ đội thi đấu</p>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Các bạn cùng đội hãy chủ động kết bạn Zalo hoặc liên hệ số điện thoại của nhau để thảo luận kế hoạch và chuẩn bị thi đấu.
            </p>
          </div>
        </div>

        {/* Edit Self Form Section (if toggled) */}
        {isEditingSelf && myMember && (
          <form
            onSubmit={handleSaveSelf}
            className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/40 mb-5 space-y-3 animate-fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wide">
                <Pencil className="w-3.5 h-3.5" />
                Sửa thông tin cá nhân của bạn
              </span>
              <button
                type="button"
                onClick={() => setIsEditingSelf(false)}
                className="text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Hủy
              </button>
            </div>

            {editError && (
              <div className="p-2.5 rounded-lg bg-red-950/70 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Họ và tên <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  MSSV (Mã số sinh viên) <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.studentId}
                  onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  SĐT / Zalo liên hệ <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">
                  Gmail <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-500"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-amber-500/30">
              <button
                type="button"
                onClick={() => setIsEditingSelf(false)}
                disabled={isSaving}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <span className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu thông tin</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Member Roster List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Danh Sách Thành Viên ({team.members.length}/5)
            </h4>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {team.members.map((member, idx) => {
              const isSelf =
                currentUser &&
                ((currentUser.email && member.email && member.email.toLowerCase() === currentUser.email.toLowerCase()) ||
                  (myIndividualId && member.individualId && member.individualId === myIndividualId));
              const cleanPhone = (member.phone || '').replace(/[^0-9]/g, '');

              return (
                <div
                  key={member.id || idx}
                  className={`p-3.5 rounded-xl border transition-colors ${
                    isSelf
                      ? 'bg-amber-950/20 border-amber-500/40 shadow-xs'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 mb-2.5 border-b border-slate-800/80">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                          isSelf
                            ? 'bg-amber-500 text-slate-950'
                            : member.isFromIndividual
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-200'
                        }`}
                      >
                        {member.name ? member.name.charAt(0).toUpperCase() : `${idx + 1}`}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-white text-xs sm:text-sm truncate">
                            {member.name}
                          </span>
                          {isSelf && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/30 text-amber-300 border border-amber-400/30 font-semibold">
                              Bạn
                            </span>
                          )}
                          {idx === 0 && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold">
                              Đại diện
                            </span>
                          )}
                          {member.isFromIndividual && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-900/50 text-purple-300 border border-purple-500/30 font-medium tracking-wide">
                              Ghép cá nhân
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {isSelf && !isEditingSelf && (
                      <button
                        type="button"
                        onClick={() => setIsEditingSelf(true)}
                        className="self-start sm:self-auto px-2.5 py-1 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3 h-3" />
                        <span>Sửa</span>
                      </button>
                    )}
                  </div>

                  {/* Contact Info Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    {/* MSSV */}
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-slate-400">MSSV:</span>
                      <strong className="text-blue-300 font-mono truncate">
                        {member.studentId || 'Chưa cập nhật'}
                      </strong>
                    </div>

                    {/* Phone / Zalo */}
                    <div className="flex items-center justify-between gap-1 text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-slate-400">SĐT:</span>
                        <strong className="text-white font-mono truncate">
                          {member.phone || 'Chưa có'}
                        </strong>
                      </div>
                      {cleanPhone && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(member.phone || '', `phone-${idx}`)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                            title="Sao chép số điện thoại"
                          >
                            {copiedField === `phone-${idx}` ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                          <a
                            href={`https://zalo.me/${cleanPhone}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] px-1.5 py-0.5 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors flex items-center gap-0.5"
                            title="Mở Zalo"
                          >
                            <span>Zalo</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Gmail */}
                    <div className="flex items-center justify-between gap-1 text-slate-300">
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                        <strong className="text-slate-200 truncate">
                          {member.email || 'Chưa có'}
                        </strong>
                      </div>
                      {member.email && (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleCopy(member.email || '', `email-${idx}`)}
                            className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                            title="Sao chép Gmail"
                          >
                            {copiedField === `email-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-5 border-t border-slate-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
