import type { NavItem } from './types';

export const AGENT_NAV: NavItem[] = [
  { label: 'Accueil',       href: '/agent',               icon: 'Home',      badge: 0 },
  { label: 'Signalements',  href: '/agent/signalements',  icon: 'Flag',      badge: 4 },
  { label: 'Interventions', href: '/agent/interventions', icon: 'Wrench',    badge: 3 },
  { label: 'Campagnes',     href: '/agent/campagnes',     icon: 'Megaphone', badge: 0 },
  { label: 'Profil',        href: '/agent/profil',        icon: 'User',      badge: 0 },
];

export const SUPERVISEUR_NAV: NavItem[] = [
  { label: 'Dashboard',       href: '/superviseur',               icon: 'LayoutDashboard', badge: 0 },
  { label: 'Signalements',    href: '/superviseur/signalements',  icon: 'Flag',            badge: 5 },
  { label: 'Interventions',   href: '/superviseur/interventions', icon: 'Wrench',          badge: 2 },
  { label: 'Campagnes',       href: '/superviseur/campagnes',     icon: 'Megaphone',       badge: 0 },
  { label: 'Agents',          href: '/superviseur/agents',        icon: 'Users',           badge: 3 },
  { label: 'Rapports & Stats',href: '/superviseur/rapports',      icon: 'BarChart3',       badge: 0 },
  { label: 'Paramètres',      href: '/superviseur/parametres',    icon: 'Settings',        badge: 0 },
];

export const ADMIN_NAV: (NavItem & { count?: number; alert?: boolean })[] = [
  { label: 'Tableau de bord', href: '/admin',             icon: 'LayoutDashboard' },
  { label: 'Utilisateurs',    href: '/admin/users',       icon: 'Users',           count: 9 },
  { label: 'Territoires',     href: '/admin/territoires', icon: 'Map',             count: 5 },
  { label: 'PME',             href: '/admin/pme',         icon: 'Building2',       count: 4 },
  { label: 'Signalements',    href: '/admin/hotspots',    icon: 'AlertTriangle',   count: 8, alert: true },
  { label: 'Campagnes',       href: '/admin/campagnes',   icon: 'Megaphone',       count: 10 },
  { label: 'Paramètres',      href: '/admin/parametres',  icon: 'Settings' },
];
