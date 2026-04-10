'use client';

import { useState, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X, FileText, Upload, ImagePlus, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUpdateIntervention } from '@/hooks/mutations/useUpdateIntervention';
import { uploadFiles } from '@/services/uploads';
import { getErrorMessage } from '@/services/api';

const schema = z.object({
  resolutionNote: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  interventionId: string;
  onClose: () => void;
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';
const errorCls = 'mt-1 text-[11px] font-mono text-destructive';

const MAX_PHOTOS = 5;

export function ResolveInterventionDialog({ open, interventionId, onClose }: Props) {
  const updateIntervention = useUpdateIntervention();
  const [pvFile, setPvFile] = useState<File | null>(null);
  const [pvError, setPvError] = useState('');
  const [photoError, setPhotoError] = useState('');
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { resolutionNote: '' },
  });

  const handleClose = () => {
    reset();
    setPvFile(null);
    setPvError('');
    setPhotoFiles([]);
    onClose();
  };

  const handleAddPhotos = (files: FileList | null) => {
    if (!files) return;
    const incoming = Array.from(files);
    setPhotoFiles((prev) => {
      const combined = [...prev, ...incoming];
      return combined.slice(0, MAX_PHOTOS);
    });
    setPhotoError('');
  };

  const removePhoto = (index: number) => {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: FormValues) => {
    if (!pvFile) {
      setPvError('Le document PV est requis');
      return;
    }
    setPvError('');

    setIsUploading(true);
    let pvDocument: string;
    let photos: string[] = [];
    try {
      const toUpload: File[] = [pvFile, ...photoFiles];
      const urls = await uploadFiles(toUpload);
      pvDocument = urls[0];
      photos = urls.slice(1);
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Échec de l'envoi des fichiers");
      toast.error(message);
      setIsUploading(false);
      return;
    }
    setIsUploading(false);

    try {
      await updateIntervention.mutateAsync({
        id: interventionId,
        payload: {
          status: 'RESOLVED',
          pvDocument,
          photos: photos.length > 0 ? photos : undefined,
          resolutionNote: values.resolutionNote?.trim() || undefined,
        },
      });
      toast.success('Intervention résolue');
      handleClose();
    } catch (err: unknown) {
      const message = getErrorMessage(err, "Impossible de résoudre l'intervention");
      toast.error(message);
    }
  };

  const isPending = isUploading || updateIntervention.isPending;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div
              className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Résoudre l'intervention</h2>
                    <p className="text-xs text-muted-foreground font-mono">Joindre le PV de clôture</p>
                  </div>
                </div>
                <button type="button" onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
                <fieldset disabled={isPending} className="space-y-6 disabled:opacity-60">
                {/* PV document */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                    Document PV *
                  </label>
                  {pvFile ? (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-primary/30 bg-primary/5">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-mono truncate flex-1">{pvFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setPvFile(null)}
                        className="w-5 h-5 rounded-full hover:bg-muted flex items-center justify-center text-muted-foreground shrink-0"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                      <Upload className="w-5 h-5 text-primary/60" />
                      <span className="text-xs font-mono text-muted-foreground">Cliquer pour choisir un fichier</span>
                      <input
                        type="file"
                          accept="application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { setPvFile(f); setPvError(''); }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                  {pvError && <p className={errorCls}>{pvError}</p>}
                </div>

                {/* Photos */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
                      Photos * ({photoFiles.length}/{MAX_PHOTOS})
                    </label>
                    {photoFiles.length < MAX_PHOTOS && (
                      <button
                        type="button"
                        onClick={() => photoInputRef.current?.click()}
                        className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
                      >
                        <ImagePlus className="w-3 h-3" /> Ajouter
                      </button>
                    )}
                  </div>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => { handleAddPhotos(e.target.files); e.target.value = ''; }}
                  />
                  {photoFiles.length > 0 ? (
                    <div className="grid grid-cols-5 gap-1.5">
                      {photoFiles.map((f, i) => (
                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(f)} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-2.5 h-2.5 text-white" />
                          </button>
                        </div>
                      ))}
                      {photoFiles.length < MAX_PHOTOS && (
                        <button
                          type="button"
                          onClick={() => photoInputRef.current?.click()}
                          className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all"
                        >
                          <ImagePlus className="w-4 h-4 text-muted-foreground" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => photoInputRef.current?.click()}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-all text-xs font-mono text-muted-foreground"
                    >
                      <ImagePlus className="w-4 h-4" /> Ajouter des photos
                    </button>
                  )}
                  {photoError && <p className={errorCls}>{photoError}</p>}
                </div>

                {/* Resolution note */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                    Note de clôture
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    placeholder="Observations, remarques…"
                    {...register('resolutionNote')}
                  />
                </div>

                </fieldset>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors disabled:opacity-50">
                    Annuler
                  </button>
                  <Button type="submit" disabled={isPending} className="font-mono text-xs">
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    {isUploading ? 'Envoi du document…' : updateIntervention.isPending ? 'En cours…' : 'Confirmer la résolution'}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
