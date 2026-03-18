'use client';

import { useState } from 'react';
import { X, MapPin, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  open: boolean;
  onClose: () => void;
}

const COMMUNES = ['Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto'];

export function NewReportModal({ open, onClose }: Props) {
  const [commune, setCommune] = useState('Dixinn');
  const [sector, setSector] = useState('');
  const [description, setDescription] = useState('');

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
        <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg pointer-events-auto border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">Nouveau Signalement</h2>
                <p className="text-xs text-muted-foreground font-mono">Signaler un point noir</p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Commune</label>
              <div className="relative">
                <select value={commune} onChange={(e) => setCommune(e.target.value)} className="w-full pl-9 pr-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border appearance-none">
                  {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Secteur</label>
              <input value={sector} onChange={(e) => setSector(e.target.value)} placeholder="Ex: Hamdallaye" className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border" />
            </div>

            <div>
              <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wide">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Décrivez le problème..." className="w-full px-3 py-2 rounded-lg border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40 border-border resize-none" />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border">
              <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              <Button type="submit">Créer le signalement</Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
