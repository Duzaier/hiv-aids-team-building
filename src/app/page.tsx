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
    message: 'Nền tảng vận hành với cơ chế phân bổ slot tự động 1 đến 6 và kiểm soát xung đột dữ liệu.'
  });

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number>(5);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isAdminEdit, setIsAdminEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.teams)) {
          const formatted: Team[] = data.teams.map((t: any) => {
            const meta = SLOT_METADATA.find((m) => m.slotNumber === t.slotNumber) || SLOT_METADATA[0];
            return {
              id: t.id,
              slotNumber: t.slotNumber,
              name: t.name,
              ownerId: t.ownerId,
              ownerName: t.ownerName || 'Chủ đội',
              ownerEmail: t.ownerEmail || 'user@example.com',
              registeredAt: t.registeredAt,
              accentColor: meta.accentColor,
              badgeTitle: meta.badgeTitle,
              members: t.members
            };
          });
          setTeams(formatted.sort((a, b) => a.slotNumber - b.slotNumber));
        }
      }
    } catch (err) {
      console.warn('API fetch warning:', err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const occupiedCount = teams.length;
  const isFull = occupiedCount >= 6;
  const myTeam = currentPersona.user
    ? teams.find((t) => t.ownerId === currentPersona.user?.id || t.id === currentPersona.ownedTeamId)
    : undefined;
  const hasTeam = !!myTeam;

  const getNextAvailableSlot = (): number => {
    for (let i = 1; i <= 6; i++) {
      if (!teams.some((t) => t.slotNumber === i)) {
        return i;
      }
    }
    return 6;
  };

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (currentPersona.user) {
      headers['x-user-id'] = currentPersona.user.id;
      headers['x-user-email'] = currentPersona.user.email;
      headers['x-user-name'] = encodeURIComponent(currentPersona.user.name);
    }
    return headers;
  };

  const handleLoginPrompt = () => {
    const newUserPersona = MOCK_PERSONAS[1];
    setCurrentPersona(newUserPersona);
    setNotification({
      type: 'success',
      message: `Đăng nhập thành công với tài khoản "${newUserPersona.user?.name}". Bạn có thể đăng ký đội ngay.`
    });
  };

  const handleLogout = () => {
    setCurrentPersona(MOCK_PERSONAS[0]);
    setNotification({
      type: 'info',
      message: 'Đã đăng xuất khỏi tài khoản Google.'
    });
  };

  const handleOpenRegister = (slotNum?: number) => {
    if (isFull) {
      setNotification({
        type: 'error',
        message: 'Đã đạt giới hạn 6 đội. Đăng ký hiện tạm đóng.'
      });
      return;
    }

    if (currentPersona.role === 'GUEST') {
      handleLoginPrompt();
      return;
    }

    if (hasTeam && myTeam) {
      setNotification({
        type: 'info',
        message: `Bạn đã sở hữu "${myTeam.name}". Mỗi tài khoản chỉ đăng ký 1 đội.`
      });
      setTeamToEdit(myTeam);
      setIsAdminEdit(false);
      setIsEditOpen(true);
      return;
    }

    const nextSlot = slotNum && !teams.some((t) => t.slotNumber === slotNum) ? slotNum : getNextAvailableSlot();
    setTargetSlot(nextSlot);
    setIsRegisterOpen(true);
  };

  const handleRegisterSuccess = async ({
    slotNumber,
    teamName,
    members
  }: {
    slotNumber: number;
    teamName: string;
    members: string[];
  }) => {
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ teamName, members })
      });

      const result = await res.json();

      if (res.ok && result.success) {
        await fetchTeams();
        if (currentPersona.id === 'persona-new-user') {
          setCurrentPersona({
            ...currentPersona,
            role: 'OWNER',
            label: `Chủ ${result.team.name}`,
            ownedTeamId: result.team.id,
            description: `Chủ sở hữu ${result.team.name} (Vị trí #${result.team.slotNumber}).`
          });
        }
        setNotification({
          type: 'success',
          message: `Đội "${teamName}" đã ghi danh thành công vào Slot #${result.team.slotNumber}.`
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Đăng ký thất bại'
        });
      }
    } catch (err) {
      console.error('Registration failed:', err);
      setNotification({
        type: 'error',
        message: 'Lỗi kết nối khi gửi dữ liệu'
      });
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

  const handleUpdateSuccess = async (updatedTeam: Team) => {
    try {
      const endpoint = isAdminEdit ? `/api/admin/teams/${updatedTeam.id}` : '/api/teams/me';
      const res = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          teamName: updatedTeam.name,
          members: updatedTeam.members.map((m) => m.name)
        })
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await fetchTeams();
        setNotification({
          type: 'success',
          message: `Đã cập nhật thông tin Đội "${updatedTeam.name}".`
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Cập nhật thất bại'
        });
      }
    } catch (err) {
      console.error('Update error:', err);
      setNotification({
        type: 'error',
        message: 'Lỗi kết nối khi cập nhật'
      });
    }
  };

  const handleDeleteClick = (team: Team) => {
    setTeamToDelete(team);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = async (teamId: string, slotNumber: number) => {
    try {
      const res = await fetch(`/api/admin/teams/${teamId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });

      const result = await res.json();
      if (res.ok && result.success) {
        await fetchTeams();
        setNotification({
          type: 'info',
          message: `Đã xóa đội. Vị trí Slot #${slotNumber} đã được giải phóng.`
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Xóa thất bại'
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({
        type: 'error',
        message: 'Lỗi kết nối khi xóa'
      });
    }
  };

  const handleFillAllSlots = async () => {
    for (let slot = 1; slot <= 6; slot++) {
      if (!teams.some((t) => t.slotNumber === slot)) {
        const meta = SLOT_METADATA[slot - 1];
        await fetch('/api/teams', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-id': `mock-user-slot-${slot}`,
            'x-user-email': `leader.slot0${slot}@test.org`,
            'x-user-name': encodeURIComponent(`Đội Trưởng 0${slot}`)
          },
          body: JSON.stringify({
            teamName: meta.nameDefault,
            members: [
              `Đội Trưởng 0${slot} (Trưởng nhóm)`,
              `Thành viên A (Slot ${slot})`,
              `Thành viên B (Slot ${slot})`,
              `Thành viên C (Slot ${slot})`
            ]
          })
        });
      }
    }
    await fetchTeams();
    setNotification({
      type: 'info',
      message: 'Đã điền đủ 6 slot để kiểm tra trạng thái đầy chỗ.'
    });
  };

  const handleResetData = async () => {
    await fetchTeams();
    setCurrentPersona(MOCK_PERSONAS[0]);
    setNotification({
      type: 'info',
      message: 'Đã khôi phục dữ liệu ban đầu.'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* 1. Persona Switcher */}
      <PersonaSwitcher
        currentPersona={currentPersona}
        onSelectPersona={(p) => {
          setCurrentPersona(p);
          setNotification({
            type: 'info',
            message: `Chuyển vai: ${p.label}. ${p.description}`
          });
        }}
        onFillAllSlots={handleFillAllSlots}
        onResetData={handleResetData}
        occupiedCount={occupiedCount}
      />

      {/* 2. Notification Toast (Clean typographic alert) */}
      {notification && (
        <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-6 py-2.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
            <span className={`font-medium ${
              notification.type === 'success'
                ? 'text-emerald-400'
                : notification.type === 'error'
                ? 'text-red-400'
                : 'text-slate-200'
            }`}>
              {notification.message}
            </span>
            <button
              onClick={() => setNotification(null)}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
              title="Đóng thông báo"
              aria-label="Đóng thông báo"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Header Hero */}
      <Header
        currentUser={currentPersona.user}
        currentRole={currentPersona.role}
        occupiedCount={occupiedCount}
        totalSlots={6}
        onLoginClick={handleLoginPrompt}
        onLogoutClick={handleLogout}
        onOpenRegisterHero={() => handleOpenRegister()}
        onOpenMyTeamEdit={() => {
          if (myTeam) {
            setTeamToEdit(myTeam);
            setIsAdminEdit(false);
            setIsEditOpen(true);
          }
        }}
        hasTeam={hasTeam}
      />

      {/* 4. Main Body */}
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
              <span className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-semibold">
                Đã đủ 6/6 đội
              </span>
            ) : (
              <button
                onClick={() => handleOpenRegister()}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-sm transition-all"
              >
                Đăng ký Slot #{getNextAvailableSlot()}
              </button>
            )}
          </div>
        </div>

        <TeamGrid
          teams={teams}
          currentUser={currentPersona.user}
          currentRole={currentPersona.role}
          ownedTeamId={currentPersona.ownedTeamId}
          onRegisterClick={handleOpenRegister}
          onEditClick={handleEditClick}
          onAdminClick={handleAdminEditClick}
          onLoginPrompt={handleLoginPrompt}
        />
      </main>

      {/* 5. Footer */}
      <Footer />

      {/* 6. Modals */}
      <RegistrationModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        targetSlot={targetSlot}
        currentUser={currentPersona.user}
        onRegisterSuccess={handleRegisterSuccess}
      />

      <EditTeamModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        team={teamToEdit}
        isAdminEdit={isAdminEdit}
        onUpdateSuccess={handleUpdateSuccess}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        team={teamToDelete}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
