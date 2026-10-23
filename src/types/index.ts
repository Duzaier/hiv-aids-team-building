export type Role = 'GUEST' | 'USER' | 'OWNER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'USER' | 'ADMIN';
}

export interface TeamMember {
  id: string;
  name: string;
  orderIndex?: number;
  isCaptain?: boolean;
  isFromIndividual?: boolean;
  individualId?: string | null;
  roleDescription?: string;
}

export interface Team {
  id: string;
  slotNumber: number; // 1 to 6
  name: string;        // "Đội 1", "Đội 2", ...
  captainName?: string;
  ownerId: string;     // The Google account user who created the registration
  ownerName: string;   // Name of the account holder
  ownerEmail: string;
  members: TeamMember[];
  registeredAt: string;
  accentColor: string;
  badgeTitle: string;
}

export interface IndividualRegistration {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string | null;
  assignedTeamId?: string | null;
  assignedSlot?: number | null;
  assignedAt?: string | null;
  registeredAt: string;
}

export interface Persona {
  id: string;
  label: string;
  role: Role;
  user: User | null;
  description: string;
  ownedTeamId?: string;
}
