'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSession, signOut } from 'next-auth/react';
import { Team, User, Role, IndividualRegistration, TeamMatchRequest } from '@/types';
import { SLOT_METADATA } from '@/data/initialData';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TeamGrid } from '@/components/teams/TeamGrid';
import { TeamGridSkeleton } from '@/components/ui/TeamGridSkeleton';
import { X, Users, UserCheck, HeartHandshake } from 'lucide-react';

// Lazy loading overlays & tabs for optimal initial bundle & performance
const RegistrationModal = dynamic(
  () => import('@/components/teams/RegistrationModal').then((m) => m.RegistrationModal),
  { ssr: false }
);

const EditTeamModal = dynamic(
  () => import('@/components/teams/EditTeamModal').then((m) => m.EditTeamModal),
  { ssr: false }
);

const MatchTeamModal = dynamic(
  () => import('@/components/teams/MatchTeamModal').then((m) => m.MatchTeamModal),
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

  // Match requests state
  const [matches, setMatches] = useState<TeamMatchRequest[]>([]);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [teamToMatch, setTeamToMatch] = useState<Team | null>(null);
  const [targetTeamForMatch, setTargetTeamForMatch] = useState<Team | null>(null);

  // Individuals state
  const [individuals, setIndividuals] = useState<IndividualRegistration[]>([]);
  const [isLoadingIndividuals, setIsLoadingIndividuals] = useState(true);
  const [isIndividualModalOpen, setIsIndividualModalOpen] = useState(false);
  const [individualToEdit, setIndividualToEdit] = useState<IndividualRegistration | null>(null);

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

  // Sync match requests with API on load
  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.matches) {
          setMatches(data.matches);
        }
      }
    } catch (err) {
      console.error('Failed to fetch matches:', err);
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
    await Promise.all([fetchTeams(), fetchMatches(), fetchIndividuals()]);
  };

  useEffect(() => {
    fetchTeams();
    fetchMatches();
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
    members: any[];
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

  const handleEditSubmit = async (updatedData: { teamName: string; captainName: string; members: any[] }) => {
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

  // Match Team Handlers
  const handleOpenMatchModal = (team: Team, targetTeam?: Team) => {
    setTeamToMatch(team);
    setTargetTeamForMatch(targetTeam || null);
    setIsMatchModalOpen(true);
  };

  const handleSendMatch = async (fromTeamId: string, toTeamId: string) => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch('/api/matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-name': encodeURIComponent(currentUser.name),
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ fromTeamId, toTeamId })
      });

      const result = await res.json();
      if (result.success) {
        showNotice('success', result.message || 'Đã gửi yêu cầu ghép đội thành công!');
        await refreshAll();
      } else {
        showNotice('error', result.error || 'Gửi yêu cầu ghép đội thất bại');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Có lỗi kết nối khi gửi yêu cầu gộp đội.');
    }
  };

  const handleMatchResponse = async (matchId: string, action: 'ACCEPT' | 'REJECT' | 'CANCEL') => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
      return;
    }

    try {
      const res = await fetch(`/api/matches/${matchId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id,
          'x-user-email': currentUser.email,
          'x-user-name': encodeURIComponent(currentUser.name),
          'x-user-role': currentUser.role
        },
        body: JSON.stringify({ action })
      });

      const result = await res.json();
      if (result.success) {
        showNotice('success', result.message || 'Xử lý yêu cầu gộp đội thành công!');
        await refreshAll();
      } else {
        showNotice('error', result.error || 'Xử lý yêu cầu thất bại');
      }
    } catch (err: any) {
      showNotice('error', err?.message || 'Có lỗi kết nối khi xử lý yêu cầu.');
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
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={() => signOut()}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Navigation Tab Bar: Theo Đội vs Cá Nhân */}
        <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/90 border border-slate-800/80 rounded-2xl w-fit mb-6 sm:mb-8 shadow-xl backdrop-blur-md">
          <button
            id="tab-btn-teams"
            onClick={() => setActiveTab('teams')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'teams' ? 'bg-gradient-to-r from-rose-600 to-red-600 text-white shadow-lg shadow-rose-600/30 border border-rose-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
          >
            <Users className="w-4 h-4" />
            <span>Theo Đội</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${activeTab === 'teams' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {teams.length}/6
            </span>
          </button>

          <button
            id="tab-btn-individuals"
            onClick={() => setActiveTab('individuals')}
            className={`px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'individuals' ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/25 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}`}
          >
            <HeartHandshake className="w-4 h-4" />
            <span>Cá Nhân Ghép Đội</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${activeTab === 'individuals' ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {individuals.length}
            </span>
          </button>
        </div>

        {/* TAB 1: THEO ĐỘI (6 SLOTS) */}
        {activeTab === 'teams' && (
          <div>
            {currentRole === 'ADMIN' && (
              <AdminManagementPanel
                teams={teams}
                matches={matches}
                onEditTeam={handleAdminEditClick}
                onDeleteTeam={handleDeleteClick}
                onAcceptMatch={(mId) => handleMatchResponse(mId, 'ACCEPT')}
                onRejectMatch={(mId) => handleMatchResponse(mId, 'REJECT')}
              />
            )}

            <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
                  Bảng Tổng Sắp 6 Vị Trí
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Danh Sách 6 Đội Thi Đấu
                </h2>
              </div>

              {/* My Team Match CTA button if owned team has < 5 members */}
              {userOwnedTeam && userOwnedTeam.members.length < 5 && (
                <button
                  onClick={() => handleOpenMatchModal(userOwnedTeam)}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all self-start sm:self-auto flex items-center gap-2"
                >
                  🤝 Gộp Đội (Còn trống {5 - userOwnedTeam.members.length} slot)
                </button>
              )}
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
                myOwnedTeam={userOwnedTeam}
                matches={matches}
                onRegisterClick={handleOpenRegister}
                onEditClick={handleEditClick}
                onAdminClick={handleAdminEditClick}
                onLoginPrompt={() => setIsLoginModalOpen(true)}
                onOpenMatchModal={handleOpenMatchModal}
                onAcceptMatch={(mId) => handleMatchResponse(mId, 'ACCEPT')}
                onRejectMatch={(mId) => handleMatchResponse(mId, 'REJECT')}
                onCancelMatch={(mId) => handleMatchResponse(mId, 'CANCEL')}
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
            onOpenRegisterIndividual={() => {
              setIndividualToEdit(null);
              setIsIndividualModalOpen(true);
            }}
            onOpenEditIndividual={(ind) => {
              setIndividualToEdit(ind);
              setIsIndividualModalOpen(true);
            }}
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

      {/* Match Team Modal - Lazy Loaded */}
      {isMatchModalOpen && teamToMatch && (
        <MatchTeamModal
          isOpen={isMatchModalOpen}
          onClose={() => {
            setIsMatchModalOpen(false);
            setTeamToMatch(null);
            setTargetTeamForMatch(null);
          }}
          myTeam={teamToMatch}
          targetTeam={targetTeamForMatch}
          allTeams={teams}
          matches={matches}
          onSendMatch={handleSendMatch}
          onCancelMatch={(mId) => handleMatchResponse(mId, 'CANCEL')}
        />
      )}

      {/* Individual Registration Modal - Lazy Loaded */}
      {isIndividualModalOpen && (
        <IndividualRegistrationModal
          isOpen={isIndividualModalOpen}
          currentUser={currentUser}
          initialData={individualToEdit}
          onClose={() => {
            setIsIndividualModalOpen(false);
            setIndividualToEdit(null);
          }}
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

      {/* Admin Delete Confirmation Modal */}
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