import { format, isValid, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { User } from '@/lib/types';

export type RoleTab = 'all' | 'admin' | 'superviseur' | 'agent' | 'public';

/** e.g. « 15 janv. 2025 » */
export function formatDateShort(iso: string | Date): string {
  const d = typeof iso === 'string' ? parseISO(iso) : iso;
  if (!isValid(d)) return '—';
  return format(d, 'd MMM yyyy', { locale: fr });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function matchesRoleTab(u: User, tab: RoleTab): boolean {
  if (tab === 'all') return true;
  if (tab === 'admin') return u.role === 'ADMIN' || u.role === 'SUPER_ADMIN';
  if (tab === 'superviseur') return u.role === 'SUPERVISOR' || u.role === 'MANAGER';
  if (tab === 'agent') return u.role === 'AGENT';
  if (tab === 'public') return u.role === 'USER';
  return true;
}
