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
import { CheckCircle2, AlertCircle, Info, Sparkles, X, Database } from 'lucide-react';

export default function Home() {
  const [teams, setTeams] = useState<Team[]>(INITIAL_TEAMS);
  const [currentPersona, setCurrentPersona] = useState<Persona>(MOCK_PERSONAS[0]);
  const [isDbSynced, setIsDbSynced] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>({
    type: 'info',
    message: 'Hệ thống đã kết nối Database với Transaction an toàn chống xung đột slot.'
  });

  // Modal states
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [targetSlot, setTargetSlot] = useState<number>(5);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState<Team | null>(null);
  const [isAdminEdit, setIsAdminEdit] = useState(false);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState<Team | null>(null);

  // Fetch live teams from database API
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
          setIsDbSynced(true);
        }
      }
    } catch (err) {
      console.warn('API fetch warning, using local state:', err);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Computed state
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
      message: `Đăng nhập Google thành công với tài khoản "${newUserPersona.user?.name}". Bạn có thể đăng ký đội ngay!`
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
        message: 'Đã đạt giới hạn tối đa 6 đội. Đăng ký hiện đã tạm đóng.'
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
        message: `Tài khoản của bạn đã sở hữu "${myTeam.name}". Mỗi tài khoản chỉ được đăng ký 1 đội.`
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
          message: `Chúc mừng! Đội "${teamName}" đã đăng ký thành công vào Slot #${result.team.slotNumber}!`
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
        message: 'Lỗi kết nối khi gửi dữ liệu đăng ký'
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
          message: `Cập nhật thông tin Đội "${updatedTeam.name}" thành công!`
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
          message: `Đã xóa đội. Vị trí Slot #${slotNumber} hiện đã được giải phóng thành công!`
        });
      } else {
        setNotification({
          type: 'error',
          message: result.error || 'Xóa đội thất bại'
        });
      }
    } catch (err) {
      console.error('Delete error:', err);
      setNotification({
        type: 'error',
        message: 'Lỗi kết nối khi thực hiện xóa'
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
      message: 'Đã lấp đầy toàn bộ 6 Slot để kiểm tra trạng thái Đầy Chỗ (Full Capacity).'
    });
  };

  const handleResetData = async () => {
    await fetchTeams();
    setCurrentPersona(MOCK_PERSONAS[0]);
    setNotification({
      type: 'info',
      message: 'Đã đồng bộ lại dữ liệu từ cơ sở dữ liệu.'
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-red-500 selection:text-white">
      {/* 1. Persona Switcher */}
      <PersonaSwitcher
        currentPersona={currentPersona}
        onSelectPersona={(p) => {
          setCurrentPersona(p);
          setNotification({
            type: 'info',
            message: `Chuyển vai: "${p.label}". ${p.description}`
          });
        }}
        onFillAllSlots={handleFillAllSlots}
        onResetData={handleResetData}
        occupiedCount={occupiedCount}
      />

      {/* 2. Notification Toast */}
      {notification && (
        <div className="bg-slate-900 border-b border-slate-800 px-3 sm:px-4 py-2.5 sm:py-3 transition-all animate-in fade-in">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              {notification.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {notification.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
              {notification.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
              <span className="text-slate-200 truncate sm:whitespace-normal">{notification.message}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isDbSynced && (
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold px-2 py-0.5 rounded-full bg-emerald-950/60 border border-emerald-500/30">
                  <Database className="w-3 h-3" />
                  Prisma DB
                </span>
              )}
              <button
                onClick={() => setNotification(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                title="Đóng"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
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

      {/* 4. Main Body: Admin View or 6-Card Grid */}
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
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-400">
                Bảng Tổng Sắp 6 Đội Thi Đấu
              </span>
              <span className="text-[11px] sm:text-xs text-slate-400">• Đăng ký theo thứ tự</span>
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-white tracking-tight">
              Danh Sách 6 Thẻ Đội Danh Dự
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {isFull ? (
              <span className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đầy đủ 6/6 đội
              </span>
            ) : (
              <button
                onClick={() => handleOpenRegister()}
                className="w-full sm:w-auto justify-center px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-md shadow-red-600/20 flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Đăng ký Slot tiếp theo (Slot #{getNextAvailableSlot()})
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
