'use client';

import React from 'react';
import { Team, User, Role } from '@/types';
import { TeamCard } from './TeamCard';

interface TeamGridProps {
  teams: Team[];
  currentUser: User | null;
  currentRole: Role;
  ownedTeamId?: string;
  onRegisterClick: (slotNumber: number) => void;
  onEditClick: (team: Team) => void;
  onAdminClick: (team: Team) => void;
  onLoginPrompt: () => void;
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  teams,
  currentUser,
  currentRole,
  ownedTeamId,
  onRegisterClick,
  onEditClick,
  onAdminClick,
  onLoginPrompt
}) => {
  // Always 6 slots (1 to 6)
  const slots = [1, 2, 3, 4, 5, 6];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
      {slots.map((slotNum) => {
        const teamForSlot = teams.find((t) => t.slotNumber === slotNum);
        return (
          <TeamCard
            key={slotNum}
            slotNumber={slotNum}
            team={teamForSlot}
            currentUser={currentUser}
            currentRole={currentRole}
            ownedTeamId={ownedTeamId}
            onRegisterClick={onRegisterClick}
            onEditClick={onEditClick}
            onAdminClick={onAdminClick}
            onLoginPrompt={onLoginPrompt}
          />
        );
      })}
    </div>
  );
};
