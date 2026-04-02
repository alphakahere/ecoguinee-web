'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, X, FileText, Upload, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useUpdateCampaign } from '@/hooks/mutations/useUpdateCampaign';
import { uploadFiles } from '@/services/uploads';

const schema = z.object({
  proofNote: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  campaignId: string;
  onClose: () => void;
}

const inputCls = 'w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40';
const errorCls = 'mt-1 text-[11px] font-mono text-destructive';

export function CompleteCampaignDialog({ open, campaignId, onClose }: Props) {
  const updateCampaign = useUpdateCampaign();
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofError, setProofError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { proofNote: '' },
  });

  const handleClose = () => {
    reset();
    setProofFile(null);
    setProofError('');
    onClose();
  };

  const onSubmit = async (values: FormValues) => {
    if (!proofFile) {
      setProofError('Le document de preuve est requis');
      return;
    }
    setProofError('');

    setIsUploading(true);
    let proofDocument: string;
    try {
      const urls = await uploadFiles([proofFile]);
      proofDocument = urls[0];
    } catch {
      toast.error("Échec de l'envoi du document de preuve");
      setIsUploading(false);
      return;
    }
    setIsUploading(false);

    try {
      await updateCampaign.mutateAsync({
        id: campaignId,
        payload: {
          status: 'COMPLETED',
          proofDocument,
          proofNote: values.proofNote?.trim() || undefined,
        },
      });
      toast.success('Campagne clôturée');
      handleClose();
    } catch {
      toast.error('Impossible de clôturer la campagne');
    }
  };

  const isPending = isUploading || updateCampaign.isPending;

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
              className="bg-card rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto border border-border overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-sm">Clôturer la campagne</h2>
                    <p className="text-xs text-muted-foreground font-mono">Joindre le document de preuve</p>
                  </div>
                </div>
                <button type="button" onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <fieldset disabled={isPending} className="space-y-4 disabled:opacity-60">
                {/* Proof document */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                    Document de preuve *
                  </label>
                  {proofFile ? (
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-primary/30 bg-primary/5">
                      <FileText className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-sm font-mono truncate flex-1">{proofFile.name}</span>
                      <button
                        type="button"
                        onClick={() => setProofFile(null)}
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
                        accept="image/jpeg,image/png,image/webp,image/gif,image/jpg"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { setProofFile(f); setProofError(''); }
                          e.target.value = '';
                        }}
                      />
                    </label>
                  )}
                  {proofError && <p className={errorCls}>{proofError}</p>}
                </div>

                {/* Proof note */}
                <div>
                  <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">
                    Note de clôture
                  </label>
                  <textarea
                    className={`${inputCls} min-h-[80px] resize-y`}
                    placeholder="Résultats, observations…"
                    {...register('proofNote')}
                  />
                </div>

                </fieldset>

                <div className="flex justify-end gap-3 pt-2 border-t border-border">
                  <button type="button" onClick={handleClose} disabled={isPending} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors disabled:opacity-50">
                    Annuler
                  </button>
                  <Button type="submit" disabled={isPending} className="font-mono text-xs">
                    {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />}
                    {isUploading ? 'Envoi du document…' : updateCampaign.isPending ? 'En cours…' : 'Confirmer la clôture'}
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
