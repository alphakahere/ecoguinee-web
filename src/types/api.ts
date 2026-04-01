import type { UserRole, UserStatus } from '@/lib/types';

// ── Prisma enums ────────────────────────────────────────────────────────────

export type ZoneType =
  | 'REGION'
  | 'PREFECTURE'
  | 'SUB_PREFECTURE'
  | 'MUNICIPALITY'
  | 'NEIGHBORHOOD'
  | 'DISTRICT'
  | 'SECTOR';

export type ApiWasteType = 'LIQUID' | 'SOLID';

export type ApiSeverity = 'LOW' | 'MODERATE' | 'CRITICAL';

export type ReportStatus =
  | 'PENDING_VALIDATION'
  | 'REPORTED'
  | 'IN_PROGRESS'
  | 'RESOLVED';

export type ReportSource = 'AGENT' | 'CITIZEN';

export type ApiInterventionStatus =
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'FAILED';

export type ApiCampaignStatus =
  | 'PLANNED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type ApiCampaignType = 'AWARENESS' | 'PROMOTION' | 'TRAINING';

// ── Models ──────────────────────────────────────────────────────────────────

export interface ApiZone {
  id: string;
  name: string;
  type: ZoneType;
  parentId: string | null;
  parent?: ApiZone;
  children?: ApiZone[];
  _count?: { reports: number; campaigns: number; organizations: number };
  createdAt: string;
  updatedAt: string;
}

export interface ApiOrganization {
  id: string;
  name: string;
  slug: string;
  acronym?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  description?: string | null;
  logo?: string | null;
  activityType?: string | null;
  active: boolean;
  zones?: ApiZone[];
  supervisors?: { id: string; name: string }[];
  members?: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiReport {
  id: string;
  type: ApiWasteType;
  severity: ApiSeverity;
  status: ReportStatus;
  source: ReportSource;
  description?: string | null;
  address?: string | null;
  latitude: number;
  longitude: number;
  zoneId: string;
  zone?: ApiZone;
  agentId?: string | null;
  agent?: { id: string; name: string };
  contactName?: string | null;
  contactPhone?: string | null;
  photos: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiIntervention {
  id: string;
  status: ApiInterventionStatus;
  notes?: string | null;
  reportId: string;
  report?: { id: string; address?: string | null; severity?: ApiSeverity };
  agentId: string;
  agent?: { id: string; name: string };
  organizationId: string;
  organization?: { id: string; name: string };
  assignedDate?: string | null;
  resolutionDate?: string | null;
  pvDocument?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiCampaign {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  type: ApiCampaignType;
  status: ApiCampaignStatus;
  zoneId?: string | null;
  zone?: ApiZone;
  address?: string | null;
  scheduledDate: string;
  endDate?: string | null;
  participantCount?: number | null;
  observations?: string | null;
  actualDate?: string | null;
  creatorId: string;
  creator?: { id: string; name: string };
  agentId?: string | null;
  agent?: { id: string; name: string };
  organizationId?: string | null;
  organization?: { id: string; name: string };
  documents: string[];
  photos: string[];
  proofDocument?: string | null;
  proofNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Filter DTOs ─────────────────────────────────────────────────────────────

export interface ZoneFilters {
  type?: ZoneType;
  parentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrganizationFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export type OwnershipFilter = 'all' | 'mine' | 'organization';

export interface ApiReportFilters {
  status?: ReportStatus;
  severity?: ApiSeverity;
  type?: ApiWasteType;
  zoneId?: string;
  organizationId?: string;
  agentId?: string;
  excludeAgentId?: string;
  source?: ReportSource;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApiCampaignFilters {
  status?: ApiCampaignStatus;
  type?: ApiCampaignType;
  zoneId?: string;
  organizationId?: string;
  agentId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── Payloads ────────────────────────────────────────────────────────────────

export interface CreateZonePayload {
  name: string;
  type: ZoneType;
  parentId?: string;
}
export type UpdateZonePayload = Partial<CreateZonePayload>;

export interface CreateManagerPayload {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface CreateOrganizationPayload {
  name: string;
  acronym?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  activityType?: string;
  active?: boolean;
  zoneIds?: string[];
  manager?: CreateManagerPayload;
}
export type UpdateOrganizationPayload = Partial<CreateOrganizationPayload>;

export interface CreateCampaignPayload {
  title: string;
  description?: string;
  type: ApiCampaignType;
  status?: ApiCampaignStatus;
  zoneId?: string;
  address?: string;
  scheduledDate: string;
  endDate?: string;
  creatorId: string;
  agentId?: string;
  organizationId?: string;
  photos?: string[];
  documents?: string[];
  proofDocument?: string;
  proofNote?: string;
}
export type UpdateCampaignPayload = Partial<CreateCampaignPayload> & {
  status?: ApiCampaignStatus;
  proofDocument?: string;
  proofNote?: string;
};

// ── API response wrapper ────────────────────────────────────────────────────

export interface ApiPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// ── French label maps ───────────────────────────────────────────────────────

export const ZONE_TYPE_META: Record<ZoneType, { label: string }> = {
  REGION:          { label: 'Région' },
  PREFECTURE:      { label: 'Préfecture' },
  SUB_PREFECTURE:  { label: 'Sous-préfecture' },
  MUNICIPALITY:    { label: 'Commune' },
  NEIGHBORHOOD:    { label: 'Quartier' },
  DISTRICT:        { label: 'District' },
  SECTOR:          { label: 'Secteur' },
};

export const REPORT_STATUS_META: Record<ReportStatus, { label: string; color: string; bg: string }> = {
  PENDING_VALIDATION: { label: 'En attente',  color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  REPORTED:           { label: 'Signalé',     color: 'text-[#D94035]',   bg: 'bg-[#D94035]/10' },
  IN_PROGRESS:        { label: 'En cours',    color: 'text-[#E8A020]',   bg: 'bg-[#E8A020]/10' },
  RESOLVED:           { label: 'Résolu',      color: 'text-[#6FCF4A]',   bg: 'bg-[#6FCF4A]/10' },
};

export const SEVERITY_META_API: Record<ApiSeverity, { label: string; color: string; bg: string }> = {
  LOW:      { label: 'Faible',    color: 'text-blue-500',    bg: 'bg-blue-500/10' },
  MODERATE: { label: 'Modéré',    color: 'text-[#E8A020]',   bg: 'bg-[#E8A020]/10' },
  CRITICAL: { label: 'Critique',  color: 'text-[#D94035]',   bg: 'bg-[#D94035]/10' },
};

export const WASTE_TYPE_META: Record<ApiWasteType, { label: string; color: string; bg: string }> = {
  LIQUID: { label: 'Liquide', color: 'text-blue-500',  bg: 'bg-blue-500/10' },
  SOLID:  { label: 'Solide',  color: 'text-orange-500', bg: 'bg-orange-500/10' },
};

export const REPORT_SOURCE_META: Record<ReportSource, { label: string }> = {
  AGENT:   { label: 'Agent' },
  CITIZEN: { label: 'Citoyen' },
};

export const API_CAMPAIGN_STATUS_META: Record<ApiCampaignStatus, { label: string; color: string; bg: string }> = {
  PLANNED:     { label: 'Planifiée',  color: 'text-blue-500',         bg: 'bg-blue-500/10' },
  IN_PROGRESS: { label: 'En cours',   color: 'text-[#E8A020]',        bg: 'bg-[#E8A020]/10' },
  COMPLETED:   { label: 'Terminée',   color: 'text-[#6FCF4A]',        bg: 'bg-[#6FCF4A]/10' },
  CANCELLED:   { label: 'Annulée',    color: 'text-muted-foreground', bg: 'bg-muted' },
};

export const API_CAMPAIGN_TYPE_META: Record<ApiCampaignType, { label: string; color: string; bg: string }> = {
  AWARENESS: { label: 'Sensibilisation', color: 'text-[#2D7D46]', bg: 'bg-[#2D7D46]/10' },
  PROMOTION: { label: 'Promotion',       color: 'text-[#E8A020]', bg: 'bg-[#E8A020]/10' },
  TRAINING:  { label: 'Formation',       color: 'text-blue-500',  bg: 'bg-blue-500/10' },
};

export const INTERVENTION_STATUS_META: Record<ApiInterventionStatus, { label: string; color: string; bg: string }> = {
  ASSIGNED:    { label: 'Assignée',  color: 'text-blue-500',         bg: 'bg-blue-500/10' },
  IN_PROGRESS: { label: 'En cours',  color: 'text-[#E8A020]',        bg: 'bg-[#E8A020]/10' },
  RESOLVED:    { label: 'Résolue',   color: 'text-[#6FCF4A]',        bg: 'bg-[#6FCF4A]/10' },
  FAILED:      { label: 'Échouée',   color: 'text-[#D94035]',        bg: 'bg-[#D94035]/10' },
};

export { type UserRole, type UserStatus };
