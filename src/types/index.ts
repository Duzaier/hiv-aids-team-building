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
  roleDescription?: string;
}

export interface Team {
  id: string;
  slotNumber: number; // 1 to 6
  name: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  members: TeamMember[];
  registeredAt: string;
  accentColor: string;
  badgeTitle: string;
}

export interface Persona {
  id: string;
  label: string;
  role: Role;
  user: User | null;
  description: string;
  ownedTeamId?: string;
}
