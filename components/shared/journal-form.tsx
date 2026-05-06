'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { ImageIcon, Send, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateJournalEntry } from '@/hooks/mutations/useCreateJournalEntry';
import { useUpdateJournalEntry } from '@/hooks/mutations/useUpdateJournalEntry';
import { uploadFiles } from '@/services/uploads';
import { getErrorMessage } from '@/services/api';
import { getImageUrl } from '@/lib/utils';
import type { InterventionJournalEntry } from '@/types/api';

const MAX_PHOTOS = 4;

interface Props {
  interventionId: string;
  /** Earliest valid entry date (ISO datetime or YYYY-MM-DD). Usually intervention.assignedDate. */
  minDate?: string;
  /** When provided, the form runs in edit mode for this entry. */
  entry?: InterventionJournalEntry;
  onSuccess?: () => void;
}

function todayIso(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function JournalForm({ interventionId, minDate, entry, onSuccess }: Props) {
  const today = todayIso();
  const minDateValue = minDate ? minDate.slice(0, 10) : undefined;
  const isEdit = Boolean(entry);

  const [entryDate, setEntryDate] = useState(
    entry?.entryDate?.slice(0, 10) ?? today,
  );
  const [note, setNote] = useState(entry?.note ?? '');
  const [existingUrls, setExistingUrls] = useState<string[]>(entry?.photos ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const create = useCreateJournalEntry();
  const update = useUpdateJournalEntry();
  const mutation = isEdit ? update : create;

  const totalPhotos = existingUrls.length + newFiles.length;

  const newPreviews = useMemo(
    () => newFiles.map((f) => URL.createObjectURL(f)),
    [newFiles],
  );

  useEffect(() => {
    return () => {
      newPreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [newPreviews]);

  const isPending = uploading || mutation.isPending;

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    if (!picked.length) return;
    if (totalPhotos + picked.length > MAX_PHOTOS) {
      toast.error(`Maximum ${MAX_PHOTOS} photos par entrée`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    setNewFiles((prev) => [...prev, ...picked]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleSubmit() {
    if (!note.trim()) {
      toast.error('Ajoutez une note avant de publier');
      return;
    }
    if (entryDate > today) {
      toast.error('La date ne peut pas être dans le futur');
      return;
    }
    if (minDateValue && entryDate < minDateValue) {
      toast.error("La date ne peut pas précéder l'assignation");
      return;
    }

    let uploadedUrls: string[] = [];
    if (newFiles.length > 0) {
      try {
        setUploading(true);
        uploadedUrls = await uploadFiles(newFiles);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Échec du téléversement';
        toast.error(message);
        setUploading(false);
        return;
      } finally {
        setUploading(false);
      }
    }

    const finalPhotos = [...existingUrls, ...uploadedUrls];

    try {
      if (isEdit && entry) {
        await update.mutateAsync({
          interventionId,
          entryId: entry.id,
          note: note.trim(),
          entryDate,
          photos: finalPhotos,
        });
        toast.success('Entrée mise à jour');
      } else {
        await create.mutateAsync({
          interventionId,
          note: note.trim(),
          entryDate,
          photos: finalPhotos,
        });
        toast.success('Entrée ajoutée au journal');
        setNote('');
        setExistingUrls([]);
        setNewFiles([]);
        setEntryDate(today);
      }
      onSuccess?.();
    } catch (err: unknown) {
      const message = getErrorMessage(
        err,
        isEdit
          ? "Impossible de mettre à jour l'entrée"
          : "Impossible d'ajouter l'entrée",
      );
      toast.error(message);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
          Date du travail
        </label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          max={today}
          min={minDateValue}
          disabled={isPending}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
        />
      </div>

      <textarea
        className="w-full min-h-[120px] resize-y px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Aujourd'hui, j'ai fait…"
        disabled={isPending}
        autoFocus
      />

      <div className="space-y-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFiles}
          disabled={isPending || totalPhotos >= MAX_PHOTOS}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPending || totalPhotos >= MAX_PHOTOS}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-5 rounded-lg border-2 border-dashed border-border text-xs font-mono hover:bg-muted/50 hover:border-primary/50 transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-4 h-4" />
          {totalPhotos === 0
            ? 'Ajouter une photo (optionnel)'
            : `Photos (${totalPhotos}/${MAX_PHOTOS})`}
        </button>

        {(existingUrls.length > 0 || newPreviews.length > 0) && (
          <div className="flex flex-wrap gap-2">
            {existingUrls.map((url, i) => (
              <div
                key={`existing-${url}`}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-border"
              >
                <Image
                  src={getImageUrl(url)}
                  alt={`Photo ${i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() =>
                    setExistingUrls((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  disabled={isPending}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center disabled:opacity-50"
                  aria-label="Retirer la photo"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
            {newPreviews.map((src, i) => (
              <div
                key={`new-${src}`}
                className="relative w-24 h-24 rounded-lg overflow-hidden border border-border"
              >
                <Image
                  src={src}
                  alt={`Photo ${existingUrls.length + i + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={() =>
                    setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  disabled={isPending}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center disabled:opacity-50"
                  aria-label="Retirer la photo"
                >
                  <X className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending || !note.trim()}
          className="w-full inline-flex items-center justify-center mt-5 gap-1.5 px-4 py-2.5 rounded-lg text-xs font-mono bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-60 transition-colors"
        >
          {isPending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Send className="w-3.5 h-3.5" />
          )}
          {uploading
            ? 'Téléversement…'
            : mutation.isPending
              ? isEdit
                ? 'Mise à jour…'
                : 'Publication…'
              : isEdit
                ? 'Mettre à jour'
                : 'Publier'}
        </button>
      </div>
    </div>
  );
}
