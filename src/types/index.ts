export type {
  WasteType,
  SeverityLevel,
  InterventionStatus,
  UserRole,
  UserStatus,
  CampaignStatus,
  CampaignType,
  Sector,
  Territoire,
  Hotspot,
  Intervention,
  PME,
  DashboardStats,
  User,
  CampaignStatusEvent,
  CampaignDocument,
  CampaignPhoto,
  Campaign,
  NavItem,
} from '@/lib/types';

export {
  CAMP_STATUS_META,
  CAMP_TYPE_META,
  SEVERITY_META,
  STATUS_META,
  ROLE_META,
  redirectByRole,
} from '@/lib/types';

// ── API-layer aliases ──────────────────────────────────────────────────────
/** A "report" in the API maps to a Hotspot in the UI */
export type { Hotspot as Report } from '@/lib/types';
/** A PME in the UI maps to an SME in the API */
export type { PME as SME } from '@/lib/types';

// ── Offline queue ──────────────────────────────────────────────────────────
export interface PendingReport {
  localId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    territoire: string;
    sector: string;
  };
  wasteType: 'solid' | 'liquid' | 'mixed';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  photoUrl?: string;
  createdAt: string;
}

// ── Filter types ───────────────────────────────────────────────────────────
export interface ReportFilters {
  status?: string;
  severity?: string;
  wasteType?: string;
  territoire?: string;
  search?: string;
}

export interface InterventionFilters {
  status?: string;
  assignedTo?: string;
  reportId?: string;
  smeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CampaignFilters {
  statut?: string;
  type?: string;
  commune?: string;
  search?: string;
}

/** Mirrors backend QueryUserDto (GET /users) */
export interface UserFilters {
  role?: string;
  /** Maps to backend roleGroup: admin | superviseur | agent | public */
  roleGroup?: 'admin' | 'superviseur' | 'agent' | 'public';
  status?: string;
  smeId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

// ── API responses ──────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuthResponse {
  user: import('@/lib/types').User;
  token: string;
}

/** Payload for POST /users */
export interface CreateUserPayload {
  name: string;
  email?: string;
  phone: string;
  role: import('@/lib/types').UserRole;
  territoire?: string;
  status?: import('@/lib/types').UserStatus;
  password?: string;
}

/** Payload for PATCH /users/:id */
export type UpdateUserPayload = Partial<CreateUserPayload>;
