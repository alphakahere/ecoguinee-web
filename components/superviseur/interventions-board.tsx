'use client';

import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDraggable,
  useDroppable,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';
import { useInterventions } from '@/hooks/queries/useInterventions';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import type { ApiIntervention, ApiInterventionStatus } from '@/types/api';
import { getErrorMessage } from '@/services/api';

const COLUMNS: { status: ApiInterventionStatus; label: string; icon: typeof AlertTriangle; color: string }[] = [
  { status: 'ASSIGNED', label: 'Assignées', icon: AlertTriangle, color: '#3B82F6' },
  { status: 'IN_PROGRESS', label: 'En cours', icon: Clock, color: '#E8A020' },
  { status: 'RESOLVED', label: 'Résolues', icon: CheckCircle, color: '#6FCF4A' },
  { status: 'FAILED', label: 'Échouées', icon: XCircle, color: '#D94035' },
];

function getColumnForDrop(
  overId: string | undefined,
  interventions: ApiIntervention[],
): ApiInterventionStatus | null {
  if (!overId) return null;
  if (COLUMNS.some((c) => c.status === overId)) return overId as ApiInterventionStatus;
  const targetItem = interventions.find((i) => i.id === overId);
  return targetItem?.status ?? null;
}

interface InterventionsBoardProps {
  organizationId: string;
}

export function InterventionsBoard({ organizationId }: InterventionsBoardProps) {
  const { data, isLoading } = useInterventions({ organizationId, limit: 100 });
  const interventions: ApiIntervention[] =
    data?.data ?? (Array.isArray(data) ? (data as ApiIntervention[]) : []);

  const updateIntervention = useUpdateIntervention();
  const [activeItem, setActiveItem] = useState<ApiIntervention | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    const item = interventions.find((i) => i.id === id);
    setActiveItem(item ?? null);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveItem(null);

    if (!over) return;

    const interventionId = String(active.id);
    const targetStatus = getColumnForDrop(String(over.id), interventions);
    if (!targetStatus) return;

    const item = interventions.find((i) => i.id === interventionId);
    if (!item || item.status === targetStatus) return;

    try {
      await updateIntervention.mutateAsync({
        id: interventionId,
        payload: { status: targetStatus } as never,
      });
      toast.success('Statut mis à jour');
    } catch (err: unknown) {
      const message = getErrorMessage(err, 'Impossible de déplacer l\'intervention');
      toast.error(message);
    }
  };

  const handleDragCancel = () => {
    setActiveItem(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="h-8 w-8 animate-spin rounded-full border-3 border-primary/30 border-t-primary" />
      </div>
    );
  }

  const draggingDisabled = updateIntervention.isPending;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {COLUMNS.map((col) => {
          const items = interventions.filter((i) => i.status === col.status);
          return (
            <KanbanColumn
              key={col.status}
              col={col}
              items={items}
              draggingDisabled={draggingDisabled}
            />
          );
        })}
      </div>

      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1)' }}>
        {activeItem ? (
          <KanbanCardPreview item={activeItem} colColor={COLUMNS.find((c) => c.status === activeItem.status)?.color ?? '#64748b'} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function KanbanColumn({
  col,
  items,
  draggingDisabled,
}: {
  col: (typeof COLUMNS)[number];
  items: ApiIntervention[];
  draggingDisabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.status,
    disabled: draggingDisabled,
  });

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden flex flex-col min-h-[200px]">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border shrink-0">
        <col.icon className="w-4 h-4" style={{ color: col.color }} />
        <h3 className="font-semibold text-sm">{col.label}</h3>
        <span
          className="ml-auto text-xs font-mono px-2 py-0.5 rounded-full"
          style={{ background: `${col.color}18`, color: col.color }}
        >
          {items.length}
        </span>
      </div>
      <div
        ref={setNodeRef}
        className={`p-3 space-y-3 max-h-[60vh] overflow-y-auto flex-1 transition-colors rounded-b-2xl ${
          isOver ? 'bg-primary/5 ring-1 ring-inset ring-primary/20' : ''
        }`}
      >
        {items.length === 0 ? (
          <p className="text-xs font-mono text-muted-foreground text-center py-8 rounded-xl border border-dashed border-border/80">
            Déposer une intervention ici
          </p>
        ) : (
          items.map((item) => (
            <DraggableKanbanCard
              key={item.id}
              item={item}
              colColor={col.color}
              disabled={draggingDisabled}
            />
          ))
        )}
      </div>
    </div>
  );
}

function DraggableKanbanCard({
  item,
  colColor,
  disabled,
}: {
  item: ApiIntervention;
  colColor: string;
  disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: item.id,
    disabled,
  });

  const style = {
    opacity: isDragging ? 0 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none cursor-grab active:cursor-grabbing"
      {...listeners}
      {...attributes}
    >
      <div className="bg-background rounded-xl p-4 border border-border hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold min-w-0" style={{ color: colColor }}>
            {item.id.slice(0, 8)}
          </span>
        </div>
        {item.notes && <p className="text-sm font-mono mb-2 line-clamp-2">{item.notes}</p>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
              {item.agent?.name
                ?.split(' ')
                .map((n) => n[0])
                .join('') ?? '?'}
            </div>
            <span className="text-[10px] font-mono text-muted-foreground truncate">
              {item.agent?.name ?? '—'}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground shrink-0">
            {item.assignedDate ? formatDate(item.assignedDate) : formatDate(item.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}

function KanbanCardPreview({ item, colColor }: { item: ApiIntervention; colColor: string }) {
  return (
    <div className="bg-background rounded-xl p-4 border-2 border-primary shadow-lg max-w-[280px] cursor-grabbing">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono font-bold" style={{ color: colColor }}>
          {item.id.slice(0, 8)}
        </span>
      </div>
      {item.notes && <p className="text-sm font-mono mb-2 line-clamp-2">{item.notes}</p>}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono text-muted-foreground truncate">{item.agent?.name ?? '—'}</span>
        <span className="text-[10px] font-mono text-muted-foreground">
          {item.assignedDate ? formatDate(item.assignedDate) : formatDate(item.createdAt)}
        </span>
      </div>
    </div>
  );
}
