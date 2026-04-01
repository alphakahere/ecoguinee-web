// ── Waste & severity ────────────────────────────────────────────────────────
export type WasteType = 'solid' | 'liquid' | 'mixed';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type InterventionStatus = 'reported' | 'in-progress' | 'resolved';
export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'SUPERVISOR' | 'AGENT' | 'USER';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export type CampaignStatus = 'planifiee' | 'en-cours' | 'terminee' | 'annulee';
export type CampaignType = 'sensibilisation' | 'promotion' | 'formation';

// ── Core interfaces ─────────────────────────────────────────────────────────
export interface Sector {
  id: string;
  name: string;
  hotspotCount: number;
  resolvedCount: number;
  population?: number;
}

export interface Territoire {
  id: string;
  name: string;
  hotspotCount: number;
  resolvedCount: number;
  coordinates: [number, number];
  sectors: Sector[];
}

export interface Hotspot {
  id: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    territoire: string;
    sector: string;
  };
  wasteType: WasteType;
  severity: SeverityLevel;
  description: string;
  photoUrl?: string;
  reportedBy: string;
  reportedAt: string; // ISO string
  status: InterventionStatus;
  assignedTo?: string;
}

export interface Intervention {
  id: string;
  hotspotId: string;
  status: InterventionStatus;
  assignedTo: string;
  assignedAt: string;
  startedAt?: string;
  completedAt?: string;
  notes?: string;
}

export interface PME {
  id: string;
  name: string;
  slug: string;
  acronym?: string;
  contact: string;
  activeInterventions: number;
  completedInterventions: number;
  sectors: string[];
}

export interface DashboardStats {
  totalHotspots: number;
  activeInterventions: number;
  resolvedCases: number;
  pendingReports: number;
  weeklyTrend: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  address?: string;
  organizationId?: string;
  memberOrganizationId?: string;
  territoire?: string;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
}

// ── Campaigns ───────────────────────────────────────────────────────────────
export interface CampaignStatusEvent {
  date: string;
  from: CampaignStatus | null;
  to: CampaignStatus;
  by: string;
  note?: string;
}

export interface CampaignDocument {
  id: string;
  titre: string;
  type: 'pdf' | 'ppt' | 'doc' | 'xls';
  taille: string;
  description?: string;
}

export interface CampaignPhoto {
  id: string;
  url: string;
  legende?: string;
}

export interface Campaign {
  id: string;
  slug: string;
  titre: string;
  description: string;
  type: CampaignType;
  commune: string;
  secteur: string;
  datePrevue: string;
  dateFinEstimee?: string;
  agentId: string;
  agentNom: string;
  pmeOrganisatrice?: string;
  statut: CampaignStatus;
  participants?: number;
  notes?: string;
  createdBy: string;
  createdAt: string;
  statusHistory: CampaignStatusEvent[];
  documents?: CampaignDocument[];
  photos?: CampaignPhoto[];
}

// ── Nav ─────────────────────────────────────────────────────────────────────
export interface NavItem {
  label: string;
  href: string;
  icon: string; // lucide icon name
  badge?: number;
}

// ── Metadata maps ───────────────────────────────────────────────────────────
export const CAMP_STATUS_META: Record<CampaignStatus, { label: string; bg: string; text: string; dot: string }> = {
  planifiee:  { label: 'Planifiée',  bg: 'bg-blue-500/10',   text: 'text-blue-500',         dot: '#3B82F6' },
  'en-cours': { label: 'En cours',   bg: 'bg-[#E8A020]/10',  text: 'text-[#E8A020]',        dot: '#E8A020' },
  terminee:   { label: 'Terminée',   bg: 'bg-[#6FCF4A]/10',  text: 'text-[#6FCF4A]',        dot: '#6FCF4A' },
  annulee:    { label: 'Annulée',    bg: 'bg-muted',         text: 'text-muted-foreground', dot: '#6B7280' },
};

export const CAMP_TYPE_META: Record<CampaignType, { label: string; emoji: string; color: string; bg: string }> = {
  sensibilisation: { label: 'Sensibilisation', emoji: '📢', color: '#2D7D46', bg: 'rgba(45,125,70,0.1)' },
  promotion:       { label: 'Promotion',       emoji: '🎯', color: '#E8A020', bg: 'rgba(232,160,32,0.1)' },
  formation:       { label: 'Formation',       emoji: '📚', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
};

export const SEVERITY_META: Record<SeverityLevel, { label: string; color: string; bg: string }> = {
  low:      { label: 'Faible',    color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  medium:   { label: 'Moyen',     color: 'text-[#E8A020]',   bg: 'bg-[#E8A020]/10' },
  high:     { label: 'Élevé',     color: 'text-orange-500',  bg: 'bg-orange-500/10' },
  critical: { label: 'Critique',  color: 'text-[#D94035]',   bg: 'bg-[#D94035]/10' },
};

export const STATUS_META: Record<InterventionStatus, { label: string; color: string; bg: string }> = {
  reported:      { label: 'Signalé',   color: 'text-[#D94035]',  bg: 'bg-[#D94035]/10' },
  'in-progress': { label: 'En cours',  color: 'text-[#E8A020]',  bg: 'bg-[#E8A020]/10' },
  resolved:      { label: 'Résolu',    color: 'text-[#6FCF4A]',  bg: 'bg-[#6FCF4A]/10' },
};

export const ROLE_META: Record<UserRole, { label: string; color: string; bg: string; dot: string }> = {
  SUPER_ADMIN: { label: 'Super administrateur', color: 'text-[#D94035]', bg: 'bg-[#D94035]/10', dot: '#D94035' },
  ADMIN:       { label: 'Administrateur', color: 'text-[#D94035]', bg: 'bg-[#D94035]/10', dot: '#D94035' },
  MANAGER:     { label: 'Manager',        color: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10', dot: '#E8A020' },
  SUPERVISOR:  { label: 'Superviseur',    color: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10', dot: '#E8A020' },
  AGENT:       { label: 'Agent',          color: 'text-[#2D7D46]', bg: 'bg-[#2D7D46]/10', dot: '#2D7D46' },
  USER:        { label: 'Citoyen',        color: 'text-muted-foreground', bg: 'bg-muted', dot: '#6B7280' },
};

export function redirectByRole(role: UserRole): string {
  switch (role) {
    case 'SUPER_ADMIN':
    case 'ADMIN':
      return '/admin';
    case 'MANAGER':
    case 'SUPERVISOR':
      return '/superviseur';
    case 'AGENT':
      return '/agent';
    case 'USER':
    default:
      return '/';
  }
}
