'use client';

import React from 'react';
import { Team, User, Role, TeamMatchRequest } from '@/types';
import { TeamCard } from './TeamCard';

interface TeamGridProps {
  teams: Team[];
  currentUser: User | null;
  currentRole: Role;
  ownedTeamId?: string;
  joinedTeamId?: string;
  myOwnedTeam?: Team | null;
  matches?: TeamMatchRequest[];
  onRegisterClick: (slotNumber: number) => void;
  onEditClick: (team: Team) => void;
  onViewDetails?: (team: Team) => void;
  onAdminClick: (team: Team) => void;
  onDeleteTeam?: (team: Team) => void;
  onLoginPrompt: () => void;
  onOpenMatchModal?: (team: Team, targetTeam?: Team) => void;
  onAcceptMatch?: (matchId: string) => void;
  onRejectMatch?: (matchId: string) => void;
  onCancelMatch?: (matchId: string) => void;
}

export const TeamGrid: React.FC<TeamGridProps> = ({
  teams,
  currentUser,
  currentRole,
  ownedTeamId,
  joinedTeamId,
  myOwnedTeam,
  matches = [],
  onRegisterClick,
  onEditClick,
  onViewDetails,
  onAdminClick,
  onDeleteTeam,
  onLoginPrompt,
  onOpenMatchModal,
  onAcceptMatch,
  onRejectMatch,
  onCancelMatch
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
            joinedTeamId={joinedTeamId}
            myOwnedTeam={myOwnedTeam}
            matches={matches}
            onRegisterClick={onRegisterClick}
            onEditClick={onEditClick}
            onViewDetails={onViewDetails}
            onAdminClick={onAdminClick}
            onDeleteTeam={onDeleteTeam}
            onLoginPrompt={onLoginPrompt}
            onOpenMatchModal={onOpenMatchModal}
            onAcceptMatch={onAcceptMatch}
            onRejectMatch={onRejectMatch}
            onCancelMatch={onCancelMatch}
          />
        );
      })}
    </div>
  );
};
