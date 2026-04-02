import { useMemo } from 'react';
import { useZoneTree } from '@/hooks/queries/useZones';
import type { ApiZone } from '@/types/api';

function flattenTree(nodes: ApiZone[]): ApiZone[] {
  const result: ApiZone[] = [];
  function walk(n: ApiZone) { result.push(n); n.children?.forEach(walk); }
  nodes.forEach(walk);
  return result;
}

export function useLocationLabel(communeId: string, quartierId: string, secteurId: string) {
  const { data: tree = [] } = useZoneTree();
  const flat = useMemo(() => flattenTree(tree), [tree]);

  const communeName = flat.find(z => z.id === communeId)?.name ?? communeId;
  const quartierName = flat.find(z => z.id === quartierId)?.name;
  const secteurName = flat.find(z => z.id === secteurId)?.name;

  return [communeName, quartierName, secteurName].filter(Boolean).join(' — ');
}
