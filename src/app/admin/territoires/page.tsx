'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  Plus, ChevronRight, ChevronDown, ChevronLeft, Pencil, Trash2,
  Search, MapPin, FileText, Megaphone, Building2, X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useZoneTree, useZone } from '@/hooks/queries/useZones';
import { useCreateZone } from '@/hooks/mutations/useCreateZone';
import { useUpdateZone } from '@/hooks/mutations/useUpdateZone';
import { useDeleteZone } from '@/hooks/mutations/useDeleteZone';
import { ZoneModal } from '@/components/admin/zone-modal';
import type { ApiZone, CreateZonePayload, UpdateZonePayload, ZoneType } from '@/types/api';
import { ZONE_TYPE_META } from '@/types/api';

// ── Utilities ────────────────────────────────────────────────────────────────

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

function getAncestorIds(nodeId: string, byId: Map<string, ApiZone>): Set<string> {
  const ids = new Set<string>();
  let cur = byId.get(nodeId);
  while (cur?.parentId) { ids.add(cur.parentId); cur = byId.get(cur.parentId); }
  return ids;
}

function getBreadcrumb(nodeId: string, byId: Map<string, ApiZone>): ApiZone[] {
  const path: ApiZone[] = [];
  let cur = byId.get(nodeId);
  while (cur) { path.unshift(cur); cur = cur.parentId ? byId.get(cur.parentId) : undefined; }
  return path;
}

// ── Type colors ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<ZoneType, string> = {
  REGION:         'bg-purple-500/10 text-purple-600',
  PREFECTURE:     'bg-blue-500/10 text-blue-600',
  SUB_PREFECTURE: 'bg-cyan-500/10 text-cyan-600',
  MUNICIPALITY:   'bg-[#2D7D46]/10 text-[#2D7D46]',
  NEIGHBORHOOD:   'bg-[#E8A020]/10 text-[#E8A020]',
  DISTRICT:       'bg-orange-500/10 text-orange-600',
  SECTOR:         'bg-muted text-muted-foreground',
};

// ── TreeNode ──────────────────────────────────────────────────────────────────

interface TreeNodeProps {
  zone: ApiZone;
  depth: number;
  selectedId: string | null;
  expandedIds: Set<string>;
  visibleIds: Set<string> | null;
  autoExpandIds: Set<string>;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
}

function TreeNode({ zone, depth, selectedId, expandedIds, visibleIds, autoExpandIds, onSelect, onToggle }: TreeNodeProps) {
  if (visibleIds && !visibleIds.has(zone.id)) return null;

  const isSelected = zone.id === selectedId;
  const isExpanded = expandedIds.has(zone.id) || autoExpandIds.has(zone.id);
  const visibleChildren = zone.children?.filter(c => !visibleIds || visibleIds.has(c.id)) ?? [];
  const hasChildren = visibleChildren.length > 0 || (zone.children?.length ?? 0) > 0;

  return (
    <div>
      <div
        style={{ paddingLeft: `${depth * 14 + 6}px` }}
        onClick={() => onSelect(zone.id)}
        className={cn(
          'flex items-center gap-1 py-1.5 pr-2 rounded-lg cursor-pointer group transition-colors',
          isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-muted/60',
        )}
      >
        <button
          type="button"
          className="shrink-0 w-4 h-4 flex items-center justify-center"
          onClick={(e) => { e.stopPropagation(); if (hasChildren) onToggle(zone.id); }}
        >
          {hasChildren
            ? isExpanded
              ? <ChevronDown className="w-3.5 h-3.5" />
              : <ChevronRight className="w-3.5 h-3.5" />
            : null}
        </button>
        <span className="flex-1 text-sm truncate">{zone.name}</span>
        <span className={cn(
          'shrink-0 text-[10px] font-mono px-1.5 py-0.5 rounded-full',
          isSelected ? 'bg-white/20 text-white' : TYPE_COLORS[zone.type],
        )}>
          {ZONE_TYPE_META[zone.type].label}
        </span>
      </div>

      {isExpanded && visibleChildren.length > 0 && visibleChildren.map(child => (
        <TreeNode
          key={child.id}
          zone={child}
          depth={depth + 1}
          selectedId={selectedId}
          expandedIds={expandedIds}
          visibleIds={visibleIds}
          autoExpandIds={autoExpandIds}
          onSelect={onSelect}
          onToggle={onToggle}
        />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminTerritoiresPage() {
  const { data: roots = [], isLoading, isError } = useZoneTree();

  const flat = useMemo(() => flattenTree(roots), [roots]);
  const byId = useMemo(() => new Map(flat.map(z => [z.id, z])), [flat]);

  /** `undefined` = use default root (Conakry) when present; explicit `null` = user cleared selection */
  const [selectionOverride, setSelectionOverride] = useState<string | null | undefined>(undefined);
  /** `undefined` = expand default root only; once user toggles, full Set is stored */
  const [expandOverride, setExpandOverride] = useState<Set<string> | undefined>(undefined);

  const defaultConakryId = useMemo(
    () => roots.find((r) => r.name.toLowerCase() === 'conakry')?.id ?? null,
    [roots],
  );

  const selectedId =
    selectionOverride !== undefined ? selectionOverride : (defaultConakryId ?? null);

  const defaultExpandedIds = useMemo(
    () => new Set(defaultConakryId ? [defaultConakryId] : []),
    [defaultConakryId],
  );
  const expandedIds = expandOverride ?? defaultExpandedIds;
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ZoneType | ''>('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editZone, setEditZone] = useState<ApiZone | null>(null);
  const [defaultParentId, setDefaultParentId] = useState('');

  const { data: zoneDetail } = useZone(selectedId ?? '');

  const createZone = useCreateZone();
  const updateZone = useUpdateZone();
  const deleteZone = useDeleteZone();
  const isMutating = createZone.isPending || updateZone.isPending || deleteZone.isPending;

  // ── Filter logic ──────────────────────────────────────────────────────────

  const matchingIds = useMemo(() => {
    if (!search && !typeFilter) return null;
    const q = search.toLowerCase();
    return new Set(
      flat
        .filter(z => (!typeFilter || z.type === typeFilter) && (!q || z.name.toLowerCase().includes(q)))
        .map(z => z.id),
    );
  }, [flat, search, typeFilter]);

  const { visibleIds, autoExpandIds } = useMemo(() => {
    if (!matchingIds) return { visibleIds: null, autoExpandIds: new Set<string>() };
    const visible = new Set<string>(matchingIds);
    const autoExpand = new Set<string>();
    for (const id of matchingIds) {
      for (const aid of getAncestorIds(id, byId)) { visible.add(aid); autoExpand.add(aid); }
    }
    return { visibleIds: visible, autoExpandIds: autoExpand };
  }, [matchingIds, byId]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const presentTypes = useMemo(() => {
    const types = new Set(flat.map(z => z.type));
    return (Object.keys(ZONE_TYPE_META) as ZoneType[]).filter(t => types.has(t));
  }, [flat]);

  const breadcrumb = useMemo(
    () => (selectedId ? getBreadcrumb(selectedId, byId) : []),
    [selectedId, byId],
  );
  const selectedNode = selectedId ? byId.get(selectedId) ?? null : null;
  const children = selectedNode?.children ?? [];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggle = useCallback((id: string) => {
    setExpandOverride((prev) => {
      const base = prev ?? new Set(defaultConakryId ? [defaultConakryId] : []);
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [defaultConakryId]);

  const handleSelect = useCallback((id: string) => {
    setSelectionOverride((prev) => {
      const current = prev !== undefined ? prev : (defaultConakryId ?? null);
      return current === id ? null : id;
    });
  }, [defaultConakryId]);

  const openCreate = (parentId = '') => {
    setEditZone(null);
    setDefaultParentId(parentId);
    setModalOpen(true);
  };

  const openEdit = (z: ApiZone) => {
    setEditZone(z);
    setDefaultParentId('');
    setModalOpen(true);
  };

  const handleSave = async (payload: CreateZonePayload | UpdateZonePayload, id?: string) => {
    try {
      if (id) {
        await updateZone.mutateAsync({ id, payload });
        toast.success('Zone mise à jour');
      } else {
        const created = await createZone.mutateAsync(payload as CreateZonePayload);
        toast.success('Zone créée');
        setSelectionOverride(created.id);
      }
      setModalOpen(false);
      setEditZone(null);
    } catch {
      toast.error('Une erreur est survenue');
    }
  };

  const handleDelete = async (z: ApiZone) => {
    if (!window.confirm(`Supprimer « ${z.name} » ?`)) return;
    try {
      await deleteZone.mutateAsync(z.id);
      toast.success('Zone supprimée');
      if (selectedId === z.id) setSelectionOverride(null);
    } catch {
      toast.error('Suppression impossible — la zone a des sous-zones ou des signalements');
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Territoires</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isLoading ? 'Chargement…' : `${flat.length} zone${flat.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => openCreate()} className="font-mono text-xs">
          <Plus className="w-4 h-4 mr-2" /> Nouvelle zone
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <span className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : isError ? (
        <p className="text-sm text-muted-foreground font-mono py-8">Impossible de charger les zones.</p>
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">

          {/* ── Left: tree panel ──────────────────────────────────────────── */}
          <div className={cn('lg:w-72 lg:shrink-0 rounded-2xl border border-border bg-card shadow-sm overflow-hidden', selectedId ? 'hidden lg:block' : 'block')}>
            {/* Search + type filter */}
            <div className="p-3 border-b border-border space-y-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Rechercher…"
                  className="w-full pl-8 pr-7 py-1.5 text-sm rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
                />
                {search && (
                  <button type="button" onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => setTypeFilter('')}
                  className={cn('px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors', !typeFilter ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted/60')}
                >
                  Tous
                </button>
                {presentTypes.map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(prev => prev === t ? '' : t)}
                    className={cn('px-2 py-0.5 rounded-full text-[11px] font-mono transition-colors', typeFilter === t ? 'bg-primary text-primary-foreground' : 'border border-border text-muted-foreground hover:bg-muted/60')}
                  >
                    {ZONE_TYPE_META[t].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tree */}
            <div className="p-2 max-h-[50vh] lg:max-h-[calc(100vh-300px)] overflow-y-auto">
              {roots.length === 0 ? (
                <p className="text-xs text-muted-foreground font-mono py-6 text-center">Aucune zone</p>
              ) : roots.filter(r => !visibleIds || visibleIds.has(r.id)).map(root => (
                <TreeNode
                  key={root.id}
                  zone={root}
                  depth={0}
                  selectedId={selectedId}
                  expandedIds={expandedIds}
                  visibleIds={visibleIds}
                  autoExpandIds={autoExpandIds}
                  onSelect={handleSelect}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </div>

          {/* ── Right: detail panel ───────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {!selectedId ? (
              <div className="hidden lg:flex rounded-2xl border border-border bg-card shadow-sm flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
                <MapPin className="w-8 h-8 opacity-30" />
                <p className="text-sm font-mono">Sélectionnez une zone dans l&apos;arbre</p>
              </div>
            ) : (
              <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-5">

                {/* Zone header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    {/* Mobile back button */}
                    <button
                      type="button"
                      onClick={() => setSelectionOverride(null)}
                      className="lg:hidden flex items-center gap-1 text-xs font-mono text-muted-foreground hover:text-foreground mb-1"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" /> Retour
                    </button>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-xl font-semibold tracking-tight">{selectedNode?.name}</h3>
                      {selectedNode && (
                        <span className={cn('text-xs font-mono px-2 py-0.5 rounded-full', TYPE_COLORS[selectedNode.type])}>
                          {ZONE_TYPE_META[selectedNode.type].label}
                        </span>
                      )}
                    </div>
                    {/* Breadcrumb */}
                    {breadcrumb.length > 1 && (
                      <div className="flex items-center gap-1 flex-wrap">
                        {breadcrumb.map((z, i) => (
                          <span key={z.id} className="flex items-center gap-1">
                            {i > 0 && <ChevronRight className="w-3 h-3 text-muted-foreground shrink-0" />}
                            <button
                              type="button"
                              onClick={() => handleSelect(z.id)}
                              className={cn(
                                'text-xs font-mono hover:text-primary transition-colors',
                                z.id === selectedId ? 'text-foreground font-semibold' : 'text-muted-foreground',
                              )}
                            >
                              {z.name}
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => selectedNode && openEdit(selectedNode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-border hover:bg-muted transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" /> Modifier
                    </button>
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={() => selectedNode && handleDelete(selectedNode)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono border border-[#D94035]/30 text-[#D94035] hover:bg-[#D94035]/10 transition-colors disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Supprimer
                    </button>
                  </div>
                </div>

                {/* Stats */}
                {zoneDetail?._count && (
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { icon: FileText,  label: 'Signalements', value: zoneDetail._count.reports,   color: 'text-[#D94035]', bg: 'bg-[#D94035]/10' },
                      { icon: Megaphone, label: 'Campagnes',    value: zoneDetail._count.campaigns, color: 'text-[#2D7D46]', bg: 'bg-[#2D7D46]/10' },
                      { icon: Building2, label: 'PMEs',         value: zoneDetail._count.smes,      color: 'text-primary',   bg: 'bg-primary/10'   },
                    ].map(({ icon: Icon, label, value, color, bg }) => (
                      <div key={label} className="rounded-xl border border-border p-3 flex items-center gap-3">
                        <span className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', bg)}>
                          <Icon className={cn('w-4 h-4', color)} />
                        </span>
                        <div>
                          <p className="text-xl font-semibold leading-none">{value}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{label}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Children — sectors are leaf nodes */}
                {selectedNode?.type !== 'SECTOR' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">
                      Sous-zones
                      {children.length > 0 && (
                        <span className="ml-2 font-mono text-xs text-muted-foreground">({children.length})</span>
                      )}
                    </h4>
                    <button
                      type="button"
                      onClick={() => selectedId && openCreate(selectedId)}
                      className="flex items-center gap-1 text-xs font-mono text-primary hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter
                    </button>
                  </div>

                  {children.length === 0 ? (
                    <p className="text-sm text-muted-foreground font-mono">Aucune sous-zone</p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {children.map(child => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => {
                            setExpandOverride((prev) => {
                              const base = prev ?? new Set(defaultConakryId ? [defaultConakryId] : []);
                              const next = new Set(base);
                              if (selectedId) next.add(selectedId);
                              return next;
                            });
                            handleSelect(child.id);
                          }}
                          className="flex items-center gap-2 p-2.5 rounded-xl border border-border bg-background hover:bg-muted/50 transition-colors text-left group"
                        >
                          <span className={cn('text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0', TYPE_COLORS[child.type])}>
                            {ZONE_TYPE_META[child.type].label}
                          </span>
                          <span className="text-sm truncate group-hover:text-primary transition-colors">{child.name}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                )}

              </div>
            )}
          </div>

        </div>
      )}

      <ZoneModal
        open={modalOpen}
        zone={editZone}
        allZones={flat}
        defaultParentId={defaultParentId}
        onClose={() => { setModalOpen(false); setEditZone(null); }}
        onSave={handleSave}
        isSubmitting={isMutating}
      />
    </div>
  );
}
