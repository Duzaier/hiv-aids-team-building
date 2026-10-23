'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import { Team, User, Role, IndividualRegistration } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TeamGrid } from '@/components/teams/TeamGrid';
import { TeamGridSkeleton } from '@/components/ui/TeamGridSkeleton';
import { X, Users, UserCheck } from 'lucide-react';

// Lazy loading overlays & tabs for optimal initial bundle & performance
const RegistrationModal = dynamic(
  () => import('@/components/teams/RegistrationModal').then((m) => m.RegistrationModal),
  { ssr: false }
);

const EditTeamModal = dynamic(
  () => import('@/components/teams/EditTeamModal').then((m) => m.EditTeamModal),
  { ssr: false }
);

const AdminManagementPanel = dynamic(
  () => import('@/components/admin/AdminManagementPanel').then((m) => m.AdminManagementPanel),
  { ssr: false }
);

const DeleteConfirmModal = dynamic(
  () => import('@/components/admin/DeleteConfirmModal').then((m) => m.DeleteConfirmModal),
  { ssr: false }
);

const LoginModal = dynamic(
  () => import('@/components/auth/LoginModal').then((m) => m.LoginModal),
  { ssr: false }
);

const IndividualPoolView = dynamic(
  () => import('@/components/individuals/IndividualPoolView').then((m) => m.IndividualPoolView),
  { ssr: false }
);

const IndividualRegistrationModal = dynamic(
  () => import('@/components/individuals/IndividualRegistrationModal').then((m) => m.IndividualRegistrationModal),
  { ssr: false }
);

export default function Home() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<'teams' | 'individuals'>('teams');

  // Teams state
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  // Individuals state
  const [individuals, setIndividuals] = useState<IndividualRegistration[]>([]);
  const [isLoadingIndividuals, setIsLoadingIndividuals] = useState(true);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number>(1);

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
              name: t.name || `Đội ${t.slotNumber}`,
              captainName: '',
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
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setIsLoadingTeams(false);
    }
  };

  // Sync individuals with API on load
  const fetchIndividuals = async () => {
    try {
      const res = await fetch('/api/individuals');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.individuals) {
          setIndividuals(data.individuals);
        }
      }
    } catch (err) {
      console.error('Failed to fetch individuals:', err);
    } finally {
      setIsLoadingIndividuals(false);
    }
  };

  const refreshAll = async () => {
    await Promise.all([fetchTeams(), fetchIndividuals()]);
  };

  useEffect(() => {
    fetchTeams();
    fetchIndividuals();
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

  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const handleOpenRegister = (slotNum?: number) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }
    if (hasTeam) {
      showNotice('error', `Tài khoản đã sở hữu "${userOwnedTeam?.name}" (Slot #${userOwnedTeam?.slotNumber}). Không thể đăng ký thêm đội.`);
      return;
    }
    if (isFull) {
      showNotice('error', 'Đã đủ 6/6 đội đăng ký. Cổng đăng ký đội hiện đã tạm dừng!');
      return;
    }

    const availableSlots = [1, 2, 3, 4, 5, 6].filter((s) => !teams.some((t) => t.slotNumber === s));
    const assigned = slotNum && availableSlots.includes(slotNum) ? slotNum : availableSlots[0];
    setTargetSlot(assigned);
    setIsRegisterOpen(true);
  };

  const handleRegisterSubmit = async (teamData: {
    teamName?: string;
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
          members: teamData.members
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsRegisterOpen(false);
        showNotice('success', result.message || `Đăng ký thành công ${result.team?.name || 'Đội mới'}!`);
        await refreshAll();
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

  const handleEditSubmit = async (updatedData: { teamName: string; captainName: string; members: string[] }) => {
    if (!teamToEdit) return;

    try {
      const endpoint = isAdminEdit
        ? `/api/admin/teams/${teamToEdit.id}`
        : `/api/teams/${teamToEdit.id}`;

      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
          'x-user-name': encodeURIComponent(currentUser?.name || ''),
          'x-user-role': currentUser?.role || 'USER'
        },
        body: JSON.stringify({
          members: updatedData.members
        })
      });

      const result = await res.json();
      if (result.success) {
        setIsEditOpen(false);
        showNotice('success', 'Đã lưu thay đổi thông tin đội thành công');
        await refreshAll();
      } else {
        showNotice('error', result.error || 'Cập nhật thất bại');
      }
    } catch {
      await refreshAll();
      setIsEditOpen(false);
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!teamToDelete) return;

    try {
      const res = await fetch(`/api/admin/teams/${teamToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentUser?.id || '',
          'x-user-email': currentUser?.email || '',
          'x-user-name': encodeURIComponent(currentUser?.name || ''),
          'x-user-role': currentUser?.role || 'USER'
        }
      });

      const result = await res.json();
      if (result.success) {
        setIsDeleteOpen(false);
        showNotice('success', result.message || `Đã giải phóng Slot #${teamToDelete.slotNumber}`);
        await refreshAll();
      } else {
        showNotice('error', result.error || 'Xóa thất bại');
      }
    } catch {
      await refreshAll();
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

      {/* Header with Skeleton State */}
      <Header
        currentUser={currentUser}
        currentRole={currentRole}
        occupiedCount={occupiedCount}
        totalSlots={6}
        isLoading={isLoadingTeams}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => signOut()}
        onOpenRegisterHero={() => (activeTab === 'teams' ? handleOpenRegister() : setIsIndividualModalOpen(true))}
        onOpenMyTeamEdit={() => userOwnedTeam && handleEditClick(userOwnedTeam)}
        hasTeam={hasTeam}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tab Bar: Theo Đội vs Cá Nhân */}
        <div className="flex items-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl w-fit mb-6 sm:mb-8 shadow-sm">
          <button
            onClick={() => setActiveTab('teams')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'teams'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Users className="w-4 h-4" />
            Theo Đội ({teams.length}/6 Đội)
          </button>

          <button
            onClick={() => setActiveTab('individuals')}
            className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'individuals'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Cá Nhân ({individuals.length} người)
          </button>
        </div>

        {/* TAB 1: THEO ĐỘI (6 SLOTS) */}
        {activeTab === 'teams' && (
          <div>
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
                Danh Sách 6 Đội Thi Đấu
              </h2>
            </div>

            {/* 6-Slot Grid with Skeleton Loading */}
            {isLoadingTeams ? (
              <TeamGridSkeleton />
            ) : (
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
            )}
          </div>
        )}

        {/* TAB 2: CÁ NHÂN (HÀNG ĐỢI & RANDOM PHÂN BỔ) */}
        {activeTab === 'individuals' && (
          <IndividualPoolView
            individuals={individuals}
            currentUser={currentUser}
            currentRole={currentRole}
            isLoading={isLoadingIndividuals}
            onOpenRegisterIndividual={() => setIsIndividualModalOpen(true)}
            onRefresh={refreshAll}
            onShowNotice={showNotice}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Real Login Modal - Lazy Loaded */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
        />
      )}

      {/* Team Registration Modal - Lazy Loaded */}
      {isRegisterOpen && (
        <RegistrationModal
          isOpen={isRegisterOpen}
          targetSlot={targetSlot}
          currentUser={currentUser}
          onClose={() => setIsRegisterOpen(false)}
          onSubmit={handleRegisterSubmit}
        />
      )}

      {/* Individual Registration Modal - Lazy Loaded */}
      {isIndividualModalOpen && (
        <IndividualRegistrationModal
          isOpen={isIndividualModalOpen}
          currentUser={currentUser}
          onClose={() => setIsIndividualModalOpen(false)}
          onSuccess={(msg) => {
            showNotice('success', msg);
            refreshAll();
          }}
        />
      )}

      {/* Edit Team Modal - Lazy Loaded */}
      {isEditOpen && teamToEdit && (
        <EditTeamModal
          isOpen={isEditOpen}
          team={teamToEdit}
          isAdminMode={isAdminEdit}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Admin Delete Confirmation Modal - Lazy Loaded */}
      {isDeleteOpen && teamToDelete && (
        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          team={teamToDelete}
          onClose={() => setIsDeleteOpen(false)}
          onConfirmDelete={handleDeleteConfirm}
        />
      )}
    </div>
  );
}
