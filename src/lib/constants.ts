import type { NavItem } from './types';

export const AGENT_NAV: NavItem[] = [
	{ label: "Accueil", href: "/agent", icon: "Home" },
	{ label: "Signalements", href: "/agent/signalements", icon: "Flag" },
	{ label: "Interventions", href: "/agent/interventions", icon: "Wrench" },
	{ label: "Campagnes", href: "/agent/campagnes", icon: "Megaphone" },
	{ label: "Profil", href: "/agent/profil", icon: "User" },
];

export const SUPERVISEUR_NAV: NavItem[] = [
	{ label: "Dashboard", href: "/superviseur", icon: "LayoutDashboard" },
	{
		label: "Signalements",
		href: "/superviseur/signalements",
		icon: "Flag",
	},
	{
		label: "Interventions",
		href: "/superviseur/interventions",
		icon: "Wrench",
	},
	{ label: "Campagnes", href: "/superviseur/campagnes", icon: "Megaphone" },
	{ label: "Agents", href: "/superviseur/agents", icon: "Users" },
	{
		label: "Rapports & Stats",
		href: "/superviseur/rapports",
		icon: "BarChart3",
	},
	{
		label: "Paramètres",
		href: "/superviseur/parametres",
		icon: "Settings",
	},
];

export const ADMIN_NAV: NavItem[] = [
	{ label: "Tableau de bord", href: "/admin", icon: "LayoutDashboard" },
	{ label: "Utilisateurs", href: "/admin/users", icon: "Users" },
	{ label: "PME", href: "/admin/pme", icon: "Building2" },
	{
		label: "Campagnes",
		href: "/admin/campagnes",
		icon: "Megaphone",
	},
	{
		label: "Signalements",
		href: "/admin/hotspots",
		icon: "AlertTriangle",
	},
	{ label: "Interventions", href: "/admin/interventions", icon: "Wrench" },
	{
		label: "Territoires",
		href: "/admin/territoires",
		icon: "Map",
	},
	{ label: "Paramètres", href: "/admin/parametres", icon: "Settings" },
];
