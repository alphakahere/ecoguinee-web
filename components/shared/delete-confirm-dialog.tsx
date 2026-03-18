'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmDialogProps {
  open: boolean;
  name: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmDialog({ open, name, onClose, onConfirm }: DeleteConfirmDialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none"
          >
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-sm pointer-events-auto border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#D94035]/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-[#D94035]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Supprimer</h3>
                    <p className="text-sm text-muted-foreground font-mono">
                      Êtes-vous sûr de vouloir supprimer <span className="text-foreground font-semibold">«{name}»</span> ?
                      Cette action est irréversible.
                    </p>
                  </div>
                  <button onClick={onClose} className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground ml-auto">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-3 justify-end">
                  <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-mono border border-border hover:bg-muted/50 transition-colors">
                    Annuler
                  </button>
                  <button onClick={() => { onConfirm(); onClose(); }} className="px-4 py-2 rounded-lg text-sm font-mono bg-[#D94035] text-white hover:bg-[#D94035]/90 transition-colors">
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
