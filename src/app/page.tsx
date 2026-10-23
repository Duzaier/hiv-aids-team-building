'use client';

import React, { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Team, User, Role } from '@/types';
import { INITIAL_TEAMS, SLOT_METADATA } from '@/data/initialData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TeamGrid } from '@/components/teams/TeamGrid';
import { RegistrationModal } from '@/components/teams/RegistrationModal';
import { EditTeamModal } from '@/components/teams/EditTeamModal';
import { AdminManagementPanel } from '@/components/admin/AdminManagementPanel';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { LoginModal } from '@/components/auth/LoginModal';
import { X } from 'lucide-react';

export default function Home() {
  const { data: session, status } = useSession();
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number>(5);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isAdminEdit, setIsAdminEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // Convert NextAuth session to app User object
  const currentUser: User | null = session?.user
    ? {
        id: (session.user as any).id || session.user.email || 'user',
        name: session.user.name || session.user.email?.split('@')[0] || 'Người dùng',
        email: session.user.email || '',
        avatar: session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session.user.name || 'User')}`,
        role: ((session.user as any).role as 'USER' | 'ADMIN') || 'USER'
      }
    : null;

  // Sync teams with API on load
  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.teams) {
          const merged: Team[] = data.teams.map((t: any) => {
            const meta = SLOT_METADATA.find((m) => m.slotNumber === t.slotNumber) || SLOT_METADATA[0];
            return {
              id: t.id,
              slotNumber: t.slotNumber,
              name: t.name,
              captainName: t.captainName || t.ownerName,
              ownerId: t.ownerId,
              ownerName: t.ownerName,
              ownerEmail: t.ownerEmail || '',
              registeredAt: t.registeredAt,
              accentColor: meta.accentColor,
              badgeTitle: meta.badgeTitle,
              members: t.members || []
            };
          });
          setTeams(merged);
        }
      }
    } catch {
      // Fallback to local state
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const occupiedCount = teams.length;
  const isFull = occupiedCount >= 6;

  // Determine if current user owns a team
  const userOwnedTeam = teams.find((t) => t.ownerId === currentUser?.id || (currentUser?.email && t.ownerEmail === currentUser.email));
  const hasTeam = !!userOwnedTeam;

  const currentRole: Role = currentUser
    ? currentUser.role === 'ADMIN'
      ? 'ADMIN'
      : hasTeam
      ? 'OWNER'
      : 'USER'
    : 'GUEST';

  // Notification helper
  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Handlers
  const handleOpenRegister = (slotNum?: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (hasTeam) {
      showNotice('error', `Tài khoản đã sở hữu "${userOwnedTeam?.name}" (Slot #${userOwnedTeam?.slotNumber}). Không thể đăng ký thêm.`);
      return;
    }
    if (isFull) {
      showNotice('error', 'Đã đủ 6/6 đội đăng ký. Cổng đăng ký hiện đã tạm đóng!');
      return;
    }

    const availableSlots = [1, 2, 3, 4, 5, 6].filter((s) => !teams.some((t) => t.slotNumber === s));
    const assigned = slotNum && availableSlots.includes(slotNum) ? slotNum : availableSlots[0];
    setTargetSlot(assigned);
    setIsRegisterOpen(true);
  };

  const handleRegisterSubmit = async (teamData: {
    teamName: string;
    captainName: string;
    members: string[];
    slotNumber: number;
  }) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return { success: false, error: 'Vui lòng đăng nhập trước khi đăng ký đội' };
    }

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-name': encodeURIComponent(currentUser.name),
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          teamName: teamData.teamName,
          captainName: teamData.captainName,
          members: teamData.members
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsRegisterOpen(false);
        showNotice('success', result.message || `Đăng ký thành công Đội "${teamData.teamName}"! Đội trưởng: ${teamData.captainName}`);
        await fetchTeams();
        return { success: true };
      } else {
        const errorMsg = result.error || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';
        showNotice('error', errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err: any) {
      const errorMsg = err?.message || 'Có lỗi kết nối máy chủ khi gửi dữ liệu đăng ký.';
      showNotice('error', errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const handleEditClick = (team: Team) => {
    setTeamToEdit(team);
    setIsAdminEdit(false);
    setIsEditOpen(true);
  };

  const handleAdminEditClick = (team: Team) => {
    setTeamToEdit(team);
    setIsAdminEdit(true);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (updatedData: {
    teamId: string;
    teamName: string;
    captainName: string;
    members: string[];
  }) => {
    if (!currentUser) return;

    try {
      const url = isAdminEdit
        ? `/api/admin/teams/${updatedData.teamId}`
        : '/api/teams/me';

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-name': encodeURIComponent(currentUser.name),
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({
          teamName: updatedData.teamName,
          captainName: updatedData.captainName,
          members: updatedData.members
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsEditOpen(false);
        showNotice('success', result.message || 'Cập nhật thông tin đội thành công');
        fetchTeams();
      } else {
        showNotice('error', result.error || 'Cập nhật thất bại');
      }
    } catch {
      fetchTeams();
      setIsEditOpen(false);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async (teamId: string, slotNumber: number) => {
    if (!teamToDelete || !currentUser) return;

    try {
      const res = await fetch(`/api/admin/teams/${teamToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-name': encodeURIComponent(currentUser.name),
          'x-user-role': currentUser.role
        }
      });

      const result = await res.json();
      if (result.success) {
        setIsDeleteOpen(false);
        showNotice('success', result.message || `Đã giải phóng Slot #${teamToDelete.slotNumber}`);
        fetchTeams();
      } else {
        showNotice('error', result.error || 'Xóa thất bại');
      }
    } catch {
      fetchTeams();
      setIsDeleteOpen(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white">
      {/* Global Toast Notification */}
      {notification && (
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 py-2 text-xs flex items-center justify-between gap-3 text-slate-200">
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                notification.type === 'success'
                  ? 'bg-emerald-500'
                  : notification.type === 'error'
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
            />
            <span className="truncate">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white p-0.5"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        occupiedCount={occupiedCount}
        totalSlots={6}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => signOut()}
        onOpenRegisterHero={() => handleOpenRegister()}
        onOpenMyTeamEdit={() => userOwnedTeam && handleEditClick(userOwnedTeam)}
        hasTeam={hasTeam}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentRole === 'ADMIN' && (
          <AdminManagementPanel
            teams={teams}
            onEditTeam={handleAdminEditClick}
            onDeleteTeam={handleDeleteClick}
          />
        )}

        <div className="mb-6 sm:mb-8">
          <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
            Bảng Tổng Sắp 6 Vị Trí
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Danh Sách 6 Thẻ Đội Thi Đấu
          </h2>
        </div>

        {/* 6-Slot Grid */}
        <TeamGrid
          teams={teams}
          currentUser={currentUser}
          currentRole={currentRole}
          ownedTeamId={userOwnedTeam?.id}
          onRegisterClick={handleOpenRegister}
          onEditClick={handleEditClick}
          onAdminClick={handleAdminEditClick}
          onLoginPrompt={() => setIsLoginModalOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Real Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        targetSlot={targetSlot}
        currentUser={currentUser}
        onClose={() => setIsRegisterOpen(false)}
        onSubmit={handleRegisterSubmit}
      />

      {/* Edit Team Modal */}
      <EditTeamModal
        isOpen={isEditOpen}
        team={teamToEdit}
        isAdminMode={isAdminEdit}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
      />

      {/* Admin Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        team={teamToDelete}
        onClose={() => setIsDeleteOpen(false)}
        onConfirmDelete={handleDeleteConfirm}
      />
    </div>
  );
}
