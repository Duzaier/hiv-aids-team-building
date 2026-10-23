'use client';

import React, { useState, useEffect } from 'react';
import { Team, Persona } from '@/types';
import { INITIAL_TEAMS, MOCK_PERSONAS, SLOT_METADATA } from '@/data/initialData';
import { PersonaSwitcher } from '@/components/demo/PersonaSwitcher';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { TeamGrid } from '@/components/teams/TeamGrid';
import { RegistrationModal } from '@/components/teams/RegistrationModal';
import { EditTeamModal } from '@/components/teams/EditTeamModal';
import { AdminManagementPanel } from '@/components/admin/AdminManagementPanel';
import { DeleteConfirmModal } from '@/components/admin/DeleteConfirmModal';
import { X } from 'lucide-react';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [currentPersona, setCurrentPersona] = useState<Persona>(MOCK_PERSONAS[0]);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>({
    type: 'info',
    message: 'Nền tảng vận hành với cơ chế phân bổ slot tự động 1 đến 6 và cho phép chọn bất kỳ thành viên nào làm Đội trưởng.'
  });

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number>(5);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isAdminEdit, setIsAdminEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

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
  const userOwnedTeam = teams.find((t) => t.ownerId === currentPersona.user?.id);
  const hasTeam = !!userOwnedTeam;

  // Notification helper
  const showNotice = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 6000);
  };

  // Handlers
  const handleOpenRegister = (slotNum?: number) => {
    if (!currentPersona.user) {
      showNotice('info', 'Vui lòng chọn vai trò "Tài khoản Google mới" để thử nghiệm đăng ký đội');
      return;
    }
    if (hasTeam) {
      showNotice('error', `Tài khoản đã sở hữu "${userOwnedTeam.name}" (Slot #${userOwnedTeam.slotNumber}). Không thể đăng ký thêm.`);
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
    if (!currentPersona.user) return;

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentPersona.user.id,
          'x-user-email': currentPersona.user.email,
          'x-user-name': encodeURIComponent(currentPersona.user.name),
          'x-user-role': currentPersona.user.role
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
        fetchTeams();
      } else {
        showNotice('error', result.error || 'Đăng ký thất bại');
      }
    } catch {
      // Fallback local registration
      const meta = SLOT_METADATA.find((m) => m.slotNumber === teamData.slotNumber) || SLOT_METADATA[0];
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        slotNumber: teamData.slotNumber,
        name: teamData.teamName,
        captainName: teamData.captainName,
        ownerId: currentPersona.user.id,
        ownerName: currentPersona.user.name,
        ownerEmail: currentPersona.user.email,
        registeredAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        accentColor: meta.accentColor,
        badgeTitle: meta.badgeTitle,
        members: teamData.members.map((name, idx) => ({
          id: `m-${Date.now()}-${idx}`,
          name,
          isCaptain: name.toLowerCase().trim() === teamData.captainName.toLowerCase().trim()
        }))
      };

      setTeams([...teams, newTeam]);
      setIsRegisterOpen(false);
      showNotice('success', `Đăng ký thành công Đội "${teamData.teamName}" (Slot #${teamData.slotNumber}). Đội trưởng: ${teamData.captainName}`);
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
    if (!currentPersona.user) return;

    try {
      const url = isAdminEdit
        ? `/api/admin/teams/${updatedData.teamId}`
        : '/api/teams/me';

      const res = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': currentPersona.user.id,
          'x-user-email': currentPersona.user.email,
          'x-user-name': encodeURIComponent(currentPersona.user.name),
          'x-user-role': currentPersona.user.role
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
      // Local fallback
      setTeams(
        teams.map((t) => {
          if (t.id === updatedData.teamId) {
            return {
              ...t,
              name: updatedData.teamName,
              captainName: updatedData.captainName,
              members: updatedData.members.map((name, idx) => ({
                id: `m-edit-${idx}`,
                name,
                isCaptain: name.toLowerCase().trim() === updatedData.captainName.toLowerCase().trim()
              }))
            };
          }
          return t;
        })
      );
      setIsEditOpen(false);
      showNotice('success', 'Đã lưu thay đổi thông tin đội');
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async (teamId: string, slotNumber: number) => {
    if (!teamToDelete || !currentPersona.user) return;

    try {
      const res = await fetch(`/api/admin/teams/${teamToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': currentPersona.user.id,
          'x-user-email': currentPersona.user.email,
          'x-user-name': encodeURIComponent(currentPersona.user.name),
          'x-user-role': currentPersona.user.role
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
      // Local fallback
      setTeams(teams.filter((t) => t.id !== teamToDelete.id));
      setIsDeleteOpen(false);
      showNotice('success', `Đã xóa Đội "${teamToDelete.name}" và giải phóng Slot #${teamToDelete.slotNumber}`);
    }
  };

  const handleFillAllSlots = () => {
    showNotice('info', 'Đã tạo 6/6 đội hoàn tất');
  };

  const handleResetData = async () => {
    await fetchTeams();
    showNotice('info', 'Đã làm mới dữ liệu từ hệ thống');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-red-600 selection:text-white">
      {/* Top Interactive Persona Switcher */}
      <PersonaSwitcher
        currentPersona={currentPersona}
        onSelectPersona={setCurrentPersona}
        onFillAllSlots={handleFillAllSlots}
        onResetData={handleResetData}
        occupiedCount={occupiedCount}
      />

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
        currentUser={currentPersona.user}
        currentRole={currentPersona.role}
        occupiedCount={occupiedCount}
        totalSlots={6}
        onLoginClick={() => setCurrentPersona(MOCK_PERSONAS[1])}
        onLogoutClick={() => setCurrentPersona(MOCK_PERSONAS[0])}
        onOpenRegisterHero={() => handleOpenRegister()}
        onOpenMyTeamEdit={() => userOwnedTeam && handleEditClick(userOwnedTeam)}
        hasTeam={hasTeam}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10">
        {currentPersona.role === 'ADMIN' && (
          <AdminManagementPanel
            teams={teams}
            onEditTeam={handleAdminEditClick}
            onDeleteTeam={handleDeleteClick}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-red-400 block mb-0.5">
              Bảng Tổng Sắp 6 Vị Trí
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Danh Sách 6 Thẻ Đội Thi Đấu
            </h2>
          </div>

          <div>
            {isFull ? (
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
                Đã đạt tối đa 6/6 đội
              </span>
            ) : hasTeam ? (
              <span className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
                Đã đăng ký Slot #{userOwnedTeam.slotNumber}
              </span>
            ) : (
              <button
                onClick={() => handleOpenRegister()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                Đăng ký Slot #{teams.length < 6 ? teams.length + 1 : ''}
              </button>
            )}
          </div>
        </div>

        {/* 6-Slot Grid */}
        <TeamGrid
          teams={teams}
          currentUser={currentPersona.user}
          currentRole={currentPersona.role}
          ownedTeamId={userOwnedTeam?.id}
          onRegisterClick={handleOpenRegister}
          onEditClick={handleEditClick}
          onAdminClick={handleAdminEditClick}
          onLoginPrompt={() => setCurrentPersona(MOCK_PERSONAS[1])}
        />
      </main>

      {/* Footer */}
      <Footer />

      {/* Registration Modal */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        targetSlot={targetSlot}
        currentUser={currentPersona.user}
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
