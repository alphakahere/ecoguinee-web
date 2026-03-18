import type { Territoire, Hotspot, PME, DashboardStats, User } from '@/lib/types';

export const territoires: Territoire[] = [
  {
    id: '1', name: 'Kaloum', hotspotCount: 23, resolvedCount: 18,
    coordinates: [9.5092, -13.7122],
    sectors: [
      { id: 's1-1', name: 'Zone Portuaire',     hotspotCount: 8,  resolvedCount: 7, population: 12400 },
      { id: 's1-2', name: 'Zone Administrative', hotspotCount: 5,  resolvedCount: 4, population: 8700 },
      { id: 's1-3', name: 'Centre-ville',        hotspotCount: 10, resolvedCount: 7, population: 21000 },
    ],
  },
  {
    id: '2', name: 'Dixinn', hotspotCount: 31, resolvedCount: 22,
    coordinates: [9.5370, -13.6785],
    sectors: [
      { id: 's2-1', name: 'Hamdallaye',       hotspotCount: 12, resolvedCount: 9, population: 18500 },
      { id: 's2-2', name: 'Zone Commerciale',  hotspotCount: 11, resolvedCount: 8, population: 14200 },
      { id: 's2-3', name: 'Tombolia',          hotspotCount: 8,  resolvedCount: 5, population: 9800 },
    ],
  },
  {
    id: '3', name: 'Matam', hotspotCount: 19, resolvedCount: 15,
    coordinates: [9.5380, -13.6889],
    sectors: [
      { id: 's3-1', name: 'Centre Commercial', hotspotCount: 9,  resolvedCount: 7, population: 22000 },
      { id: 's3-2', name: 'Quartier Nord',     hotspotCount: 10, resolvedCount: 8, population: 16300 },
    ],
  },
  {
    id: '4', name: 'Ratoma', hotspotCount: 45, resolvedCount: 28,
    coordinates: [9.5678, -13.6523],
    sectors: [
      { id: 's4-1', name: 'Zone Résidentielle', hotspotCount: 16, resolvedCount: 10, population: 31000 },
      { id: 's4-2', name: 'Zone Universitaire', hotspotCount: 15, resolvedCount: 9,  population: 19500 },
      { id: 's4-3', name: 'Koloma',             hotspotCount: 14, resolvedCount: 9,  population: 27000 },
    ],
  },
  {
    id: '5', name: 'Matoto', hotspotCount: 52, resolvedCount: 31,
    coordinates: [9.5912, -13.6234],
    sectors: [
      { id: 's5-1', name: 'Axe Principal',     hotspotCount: 20, resolvedCount: 13, population: 38000 },
      { id: 's5-2', name: 'Zone Périphérique',  hotspotCount: 18, resolvedCount: 10, population: 24500 },
      { id: 's5-3', name: 'Bambeto',            hotspotCount: 14, resolvedCount: 8,  population: 19000 },
    ],
  },
];

export const hotspots: Hotspot[] = [
  {
    id: 'hs-001',
    location: { lat: 9.5092, lng: -13.7122, address: 'Avenue de la République', territoire: 'Kaloum', sector: 'Zone Portuaire' },
    wasteType: 'solid', severity: 'critical',
    description: 'Accumulation de déchets plastiques et organiques bloquant le drainage',
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
    reportedBy: 'Mamadou Diallo', reportedAt: '2026-03-10T08:30:00', status: 'reported',
  },
  {
    id: 'hs-002',
    location: { lat: 9.5370, lng: -13.6785, address: 'Rue KA-028', territoire: 'Dixinn', sector: 'Hamdallaye' },
    wasteType: 'liquid', severity: 'high',
    description: "Écoulement d'eaux usées non traitées dans une zone résidentielle",
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400',
    reportedBy: 'Aissatou Bah', reportedAt: '2026-03-11T14:15:00', status: 'in-progress', assignedTo: 'PME Salubrité Plus',
  },
  {
    id: 'hs-003',
    location: { lat: 9.5380, lng: -13.6889, address: 'Marché de Matam', territoire: 'Matam', sector: 'Centre Commercial' },
    wasteType: 'mixed', severity: 'high',
    description: 'Point noir permanent près du marché, déchets organiques et plastiques',
    photoUrl: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=400',
    reportedBy: 'Ibrahima Camara', reportedAt: '2026-03-09T11:20:00', status: 'in-progress', assignedTo: 'Eco Services Guinée',
  },
  {
    id: 'hs-004',
    location: { lat: 9.5678, lng: -13.6523, address: 'Quartier Koloma', territoire: 'Ratoma', sector: 'Zone Résidentielle' },
    wasteType: 'solid', severity: 'medium',
    description: 'Dépôt sauvage de déchets de construction',
    photoUrl: 'https://images.unsplash.com/photo-1604187351574-c75ca79f5807?w=400',
    reportedBy: 'Fatoumata Souaré', reportedAt: '2026-03-08T16:45:00', status: 'resolved', assignedTo: 'PME Salubrité Plus',
  },
  {
    id: 'hs-005',
    location: { lat: 9.5912, lng: -13.6234, address: 'Autoroute Fidel Castro', territoire: 'Matoto', sector: 'Axe Principal' },
    wasteType: 'solid', severity: 'critical',
    description: "Décharge sauvage de grande ampleur le long de l'autoroute",
    photoUrl: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=400',
    reportedBy: 'Mohamed Condé', reportedAt: '2026-03-12T09:00:00', status: 'reported',
  },
  {
    id: 'hs-006',
    location: { lat: 9.5450, lng: -13.6950, address: 'Cité Ministerielle', territoire: 'Kaloum', sector: 'Zone Administrative' },
    wasteType: 'solid', severity: 'low',
    description: 'Petite accumulation de déchets de bureau',
    reportedBy: 'Service Municipal', reportedAt: '2026-03-07T10:30:00', status: 'resolved', assignedTo: 'Eco Services Guinée',
  },
  {
    id: 'hs-007',
    location: { lat: 9.5550, lng: -13.6700, address: 'Tombolia', territoire: 'Dixinn', sector: 'Zone Commerciale' },
    wasteType: 'mixed', severity: 'high',
    description: 'Accumulation près du marché de Tombolia',
    photoUrl: 'https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=400',
    reportedBy: 'Alpha Barry', reportedAt: '2026-03-11T07:15:00', status: 'in-progress', assignedTo: 'PME Vert Guinée',
  },
  {
    id: 'hs-008',
    location: { lat: 9.5800, lng: -13.6400, address: 'Bambeto', territoire: 'Ratoma', sector: 'Zone Universitaire' },
    wasteType: 'solid', severity: 'medium',
    description: 'Déchets près du campus universitaire',
    reportedBy: 'Union des Étudiants', reportedAt: '2026-03-10T15:20:00', status: 'reported',
  },
];

export const pmeList: PME[] = [
  { id: 'pme-001', name: 'PME Salubrité Plus',      contact: '+224 620 12 34 56', activeInterventions: 2, completedInterventions: 45, sectors: ['Kaloum', 'Ratoma'] },
  { id: 'pme-002', name: 'Eco Services Guinée',      contact: '+224 625 78 90 12', activeInterventions: 2, completedInterventions: 38, sectors: ['Matam', 'Kaloum'] },
  { id: 'pme-003', name: 'PME Vert Guinée',          contact: '+224 628 45 67 89', activeInterventions: 1, completedInterventions: 52, sectors: ['Dixinn', 'Matoto'] },
  { id: 'pme-004', name: 'Assainissement Moderne',   contact: '+224 622 33 44 55', activeInterventions: 0, completedInterventions: 29, sectors: ['Matoto', 'Ratoma'] },
];

export const dashboardStats: DashboardStats = {
  totalHotspots: 170,
  activeInterventions: 5,
  resolvedCases: 114,
  pendingReports: 3,
  weeklyTrend: 12.5,
};

export const users: User[] = [
  { id: 'usr-001', name: 'Amadou Kouyaté',    email: 'amadou.kouyate@ecoguinee.gn',  phone: '+224 620 11 22 33', role: 'admin',      status: 'active',    createdAt: '2025-01-15', lastLogin: '2026-03-12T08:45:00' },
  { id: 'usr-002', name: 'Mariama Diallo',     email: 'mariama.diallo@ecoguinee.gn',  phone: '+224 625 44 55 66', role: 'supervisor', territoire: 'Kaloum',  status: 'active',    createdAt: '2025-02-20', lastLogin: '2026-03-11T14:30:00' },
  { id: 'usr-003', name: 'Ibrahima Bah',       email: 'ibrahima.bah@ecoguinee.gn',    phone: '+224 628 77 88 99', role: 'supervisor', territoire: 'Ratoma',  status: 'active',    createdAt: '2025-03-05', lastLogin: '2026-03-12T07:15:00' },
  { id: 'usr-004', name: 'Fatoumata Camara',   email: 'fatoumata.camara@ecoguinee.gn', phone: '+224 622 10 20 30', role: 'agent',     territoire: 'Dixinn',  status: 'active',    createdAt: '2025-04-10', lastLogin: '2026-03-12T09:00:00' },
  { id: 'usr-005', name: 'Mamadou Souaré',     email: 'mamadou.souare@ecoguinee.gn',  phone: '+224 620 40 50 60', role: 'agent',      territoire: 'Matam',   status: 'active',    createdAt: '2025-04-18', lastLogin: '2026-03-11T16:00:00' },
  { id: 'usr-006', name: 'Aissatou Barry',     email: 'aissatou.barry@ecoguinee.gn',  phone: '+224 625 70 80 90', role: 'agent',      territoire: 'Matoto',  status: 'inactive',  createdAt: '2025-05-22', lastLogin: '2026-02-28T10:30:00' },
  { id: 'usr-007', name: 'Oumar Condé',        email: 'oumar.conde@ecoguinee.gn',     phone: '+224 628 01 02 03', role: 'agent',      territoire: 'Kaloum',  status: 'active',    createdAt: '2025-06-01', lastLogin: '2026-03-10T11:45:00' },
  { id: 'usr-008', name: 'Kadiatou Traoré',    email: 'kadiatou.traore@gmail.com',    phone: '+224 622 55 66 77', role: 'public',     territoire: 'Ratoma',  status: 'active',    createdAt: '2025-08-14', lastLogin: '2026-03-09T20:10:00' },
  { id: 'usr-009', name: 'Sory Sylla',         email: 'sory.sylla@gmail.com',         phone: '+224 620 99 88 77', role: 'public',     territoire: 'Matam',   status: 'suspended', createdAt: '2025-09-30', lastLogin: '2026-01-15T08:00:00' },
];
