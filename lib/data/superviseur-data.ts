import type { Hotspot } from '@/lib/types';
import { hotspots } from './mock-data';

export const SUPERVISEUR = {
  id: 'sup-001',
  name: 'Amadou Diallo',
  firstName: 'Amadou',
  email: 'amadou.diallo@ecoguinee.gn',
  phone: '+224 628 45 67 89',
};

export const PME_PROFILE = {
  id: 'pme-003',
  name: 'PME Vert Guinée',
  initials: 'VG',
  email: 'contact@vertguinee.gn',
  phone: '+224 628 45 67 89',
  address: 'Route de Donka, Dixinn, Conakry',
  type: 'Collecte et traitement des déchets solides',
  secteurs: ['Hamdallaye', 'Zone Commerciale', 'Tombolia', 'Axe Principal'],
  commune: 'Dixinn / Matoto',
  createdAt: '2023-06-15',
  activeInterventions: 4,
  completedInterventions: 52,
};

export const AGENTS = [
  { id: 'ag-01', name: 'Fatoumata Camara',  sector: 'Hamdallaye',       active: true,  interventions: 3, resolved: 8,  rate: 73, lastActive: "Aujourd'hui 09:14" },
  { id: 'ag-02', name: 'Mamadou Kouyaté',   sector: 'Zone Commerciale', active: true,  interventions: 2, resolved: 11, rate: 85, lastActive: "Aujourd'hui 08:45" },
  { id: 'ag-03', name: 'Aissatou Baldé',    sector: 'Tombolia',         active: true,  interventions: 1, resolved: 5,  rate: 62, lastActive: 'Hier 17:30' },
  { id: 'ag-04', name: 'Ibrahim Sylla',     sector: 'Axe Principal',    active: false, interventions: 0, resolved: 3,  rate: 45, lastActive: 'Il y a 3 jours' },
];

const PME_SECTORS = new Set(PME_PROFILE.secteurs);

export const PME_REPORTS: Hotspot[] = [
  ...hotspots.filter(h => PME_SECTORS.has(h.location.sector)),
  {
    id: 'hs-s01',
    location: { lat: 9.537, lng: -13.679, address: 'Hamdallaye Centre', territoire: 'Dixinn', sector: 'Hamdallaye' },
    wasteType: 'solid', severity: 'critical',
    description: 'Accumulation massive en bordure de route principale',
    reportedBy: 'Fatoumata Camara', reportedAt: '2026-03-11T07:00:00', status: 'reported',
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
  },
  {
    id: 'hs-s02',
    location: { lat: 9.555, lng: -13.670, address: 'Rue Commerciale', territoire: 'Dixinn', sector: 'Zone Commerciale' },
    wasteType: 'liquid', severity: 'high',
    description: "Déversement d'eaux usées industrielles",
    reportedBy: 'Mamadou Kouyaté', reportedAt: '2026-03-10T11:30:00', status: 'in-progress', assignedTo: 'Mamadou Kouyaté',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400',
  },
  {
    id: 'hs-s03',
    location: { lat: 9.543, lng: -13.683, address: 'Tombolia Carrefour', territoire: 'Dixinn', sector: 'Tombolia' },
    wasteType: 'mixed', severity: 'medium',
    description: 'Déchets ménagers non collectés depuis 5 jours',
    reportedBy: 'Aissatou Baldé', reportedAt: '2026-03-09T14:00:00', status: 'in-progress', assignedTo: 'Aissatou Baldé',
  },
  {
    id: 'hs-s04',
    location: { lat: 9.591, lng: -13.624, address: 'Axe Principal km4', territoire: 'Matoto', sector: 'Axe Principal' },
    wasteType: 'solid', severity: 'high',
    description: 'Dépôt illicite de déchets de chantier',
    reportedBy: 'Ibrahim Sylla', reportedAt: '2026-03-08T09:15:00', status: 'resolved', assignedTo: 'Ibrahim Sylla',
  },
  {
    id: 'hs-s05',
    location: { lat: 9.538, lng: -13.676, address: 'Marché Hamdallaye', territoire: 'Dixinn', sector: 'Hamdallaye' },
    wasteType: 'solid', severity: 'medium',
    description: 'Poubelles débordantes aux abords du marché',
    reportedBy: 'Citoyen signalement app', reportedAt: '2026-03-12T06:30:00', status: 'reported',
  },
  {
    id: 'hs-s06',
    location: { lat: 9.558, lng: -13.672, address: 'Zone Commerciale Est', territoire: 'Dixinn', sector: 'Zone Commerciale' },
    wasteType: 'solid', severity: 'low',
    description: 'Petits dépôts de déchets plastiques',
    reportedBy: 'Mamadou Kouyaté', reportedAt: '2026-03-07T10:00:00', status: 'resolved', assignedTo: 'Mamadou Kouyaté',
  },
];

export const ACTIVITY_FEED = [
  { id: 1, type: 'report_new',   text: 'Nouveau signalement critique — Hamdallaye Centre',      time: 'Il y a 12 min', color: '#D94035' },
  { id: 2, type: 'intervention', text: 'Intervention hs-s02 mise à jour par Mamadou Kouyaté',    time: 'Il y a 45 min', color: '#E8A020' },
  { id: 3, type: 'resolved',     text: 'Signalement hs-s04 résolu — Axe Principal',              time: 'Il y a 2h',     color: '#6FCF4A' },
  { id: 4, type: 'agent_new',    text: "Aissatou Baldé ajoutée à l'équipe",                      time: 'Il y a 1j',     color: '#2D7D46' },
  { id: 5, type: 'report_new',   text: 'Signalement citoyen validé — Marché Hamdallaye',         time: 'Il y a 1j',     color: '#2D7D46' },
  { id: 6, type: 'intervention', text: 'Intervention hs-s03 démarrée — Tombolia',                time: 'Il y a 2j',     color: '#E8A020' },
  { id: 7, type: 'resolved',     text: 'Signalement hs-s06 résolu — Zone Commerciale',           time: 'Il y a 2j',     color: '#6FCF4A' },
  { id: 8, type: 'report_new',   text: 'Signalement hs-s05 reçu — Poubelles Hamdallaye',         time: 'Il y a 3j',     color: '#E8A020' },
];

export const MONTHLY_CHART = [
  { mois: 'Sep', recus: 18, resolus: 14 },
  { mois: 'Oct', recus: 22, resolus: 18 },
  { mois: 'Nov', recus: 19, resolus: 16 },
  { mois: 'Dec', recus: 25, resolus: 19 },
  { mois: 'Jan', recus: 28, resolus: 22 },
  { mois: 'Fev', recus: 24, resolus: 20 },
  { mois: 'Mar', recus: 31, resolus: 22 },
];

export const EVOLUTION_CHART = [
  { jour: '1 Mar',  signalements: 3, resolus: 2 },
  { jour: '3 Mar',  signalements: 5, resolus: 3 },
  { jour: '5 Mar',  signalements: 2, resolus: 4 },
  { jour: '7 Mar',  signalements: 7, resolus: 5 },
  { jour: '9 Mar',  signalements: 4, resolus: 3 },
  { jour: '11 Mar', signalements: 6, resolus: 4 },
  { jour: '12 Mar', signalements: 4, resolus: 2 },
];

export const SECTOR_CHART = [
  { secteur: 'Hamdallaye',    signalements: 12, resolus: 9 },
  { secteur: 'Zone Comm.',    signalements: 11, resolus: 8 },
  { secteur: 'Tombolia',      signalements: 8,  resolus: 5 },
  { secteur: 'Axe Principal', signalements: 6,  resolus: 4 },
];

export interface SuperviseurIntervention {
  id: string;
  signalementId: string;
  sector: string;
  agentId: string;
  agentName: string;
  status: 'reported' | 'in-progress' | 'resolved';
  assignedAt: string;
  expectedResolutionAt: string;
  notes: string;
  timeline: { id: string; date: string; actor: string; action: string; type: 'created' | 'status_change' | 'note' | 'reassign' }[];
}

export const INTERVENTIONS: SuperviseurIntervention[] = [
  {
    id: 'INT-001', signalementId: 'hs-s01', sector: 'Hamdallaye',
    agentId: 'ag-01', agentName: 'Fatoumata Camara', status: 'reported',
    assignedAt: '2026-03-11T08:00:00', expectedResolutionAt: '2026-03-13T18:00:00',
    notes: 'Priorité maximale — axe route nationale',
    timeline: [
      { id: 't1', date: '2026-03-11T08:00:00', actor: 'Amadou Diallo', action: 'Intervention créée et assignée à Fatoumata Camara', type: 'created' },
    ],
  },
  {
    id: 'INT-002', signalementId: 'hs-s02', sector: 'Zone Commerciale',
    agentId: 'ag-02', agentName: 'Mamadou Kouyaté', status: 'in-progress',
    assignedAt: '2026-03-10T12:00:00', expectedResolutionAt: '2026-03-12T18:00:00',
    notes: "Déversement d'eaux usées — contacter la mairie pour pompage",
    timeline: [
      { id: 't1', date: '2026-03-10T12:00:00', actor: 'Amadou Diallo', action: 'Intervention créée et assignée à Mamadou Kouyaté', type: 'created' },
      { id: 't2', date: '2026-03-11T09:30:00', actor: 'Mamadou Kouyaté', action: 'Statut mis à jour : Signalé → En cours', type: 'status_change' },
      { id: 't3', date: '2026-03-11T14:00:00', actor: 'Mamadou Kouyaté', action: 'Note ajoutée : Équipement de pompage commandé, livraison prévue demain', type: 'note' },
    ],
  },
  {
    id: 'INT-003', signalementId: 'hs-s03', sector: 'Tombolia',
    agentId: 'ag-03', agentName: 'Aissatou Baldé', status: 'in-progress',
    assignedAt: '2026-03-09T15:00:00', expectedResolutionAt: '2026-03-11T18:00:00',
    notes: 'Collecte manuelle requise — camion prévu jeudi',
    timeline: [
      { id: 't1', date: '2026-03-09T15:00:00', actor: 'Amadou Diallo', action: 'Intervention créée et assignée à Aissatou Baldé', type: 'created' },
      { id: 't2', date: '2026-03-10T08:00:00', actor: 'Aissatou Baldé', action: 'Statut mis à jour : Signalé → En cours', type: 'status_change' },
    ],
  },
  {
    id: 'INT-004', signalementId: 'hs-s04', sector: 'Axe Principal',
    agentId: 'ag-04', agentName: 'Ibrahim Sylla', status: 'resolved',
    assignedAt: '2026-03-08T10:00:00', expectedResolutionAt: '2026-03-10T18:00:00',
    notes: 'Déchets de chantier évacués — site nettoyé',
    timeline: [
      { id: 't1', date: '2026-03-08T10:00:00', actor: 'Amadou Diallo', action: 'Intervention créée et assignée à Ibrahim Sylla', type: 'created' },
      { id: 't2', date: '2026-03-08T14:00:00', actor: 'Ibrahim Sylla', action: 'Statut mis à jour : Signalé → En cours', type: 'status_change' },
      { id: 't3', date: '2026-03-09T11:00:00', actor: 'Ibrahim Sylla', action: 'Note ajoutée : Benne commandée, arrivée en cours', type: 'note' },
      { id: 't4', date: '2026-03-10T16:30:00', actor: 'Ibrahim Sylla', action: 'Statut mis à jour : En cours → Résolu', type: 'status_change' },
      { id: 't5', date: '2026-03-10T16:35:00', actor: 'Amadou Diallo', action: 'Intervention clôturée par le superviseur', type: 'note' },
    ],
  },
  {
    id: 'INT-005', signalementId: 'hs-s05', sector: 'Hamdallaye',
    agentId: 'ag-01', agentName: 'Fatoumata Camara', status: 'reported',
    assignedAt: '2026-03-12T07:00:00', expectedResolutionAt: '2026-03-14T18:00:00',
    notes: 'Signalement citoyen — vérifier sur place avant intervention',
    timeline: [
      { id: 't1', date: '2026-03-12T07:00:00', actor: 'Amadou Diallo', action: 'Intervention créée et assignée à Fatoumata Camara', type: 'created' },
    ],
  },
  {
    id: 'INT-006', signalementId: 'hs-s06', sector: 'Zone Commerciale',
    agentId: 'ag-02', agentName: 'Mamadou Kouyaté', status: 'resolved',
    assignedAt: '2026-03-07T11:00:00', expectedResolutionAt: '2026-03-09T18:00:00',
    notes: 'Plastiques collectés et acheminés au centre de tri',
    timeline: [
      { id: 't1', date: '2026-03-07T11:00:00', actor: 'Amadou Diallo', action: 'Intervention créée et assignée à Mamadou Kouyaté', type: 'created' },
      { id: 't2', date: '2026-03-07T14:00:00', actor: 'Mamadou Kouyaté', action: 'Statut mis à jour : Signalé → En cours', type: 'status_change' },
      { id: 't3', date: '2026-03-09T10:00:00', actor: 'Mamadou Kouyaté', action: 'Statut mis à jour : En cours → Résolu', type: 'status_change' },
    ],
  },
];
