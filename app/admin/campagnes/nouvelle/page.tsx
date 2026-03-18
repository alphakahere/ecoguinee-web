'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PageHeader } from '@/components/shared/page-header';

const COMMUNES = ['Kaloum', 'Dixinn', 'Matam', 'Ratoma', 'Matoto'];
const TYPES = [
  { value: 'sensibilisation', label: 'Sensibilisation' },
  { value: 'promotion', label: 'Promotion' },
  { value: 'formation', label: 'Formation' },
];

export default function AdminCampagneNouvellePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    titre: '', description: '', type: 'sensibilisation',
    commune: 'Dixinn', secteur: '', datePrevue: '',
    agentNom: '', pmeOrganisatrice: '', notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre || !form.secteur || !form.datePrevue) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    toast.success('Campagne créée avec succès !');
    router.push('/admin/campagnes');
  };

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const inputCls = 'w-full px-4 py-3 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30';

  return (
    <div className="max-w-3xl">
      <Link href="/admin/campagnes" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors mb-4">
        <ArrowLeft className="w-4 h-4" /> Retour aux campagnes
      </Link>

      <PageHeader title="Nouvelle Campagne" description="Créer une campagne de sensibilisation" />

      <form onSubmit={handleSubmit} className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Titre *</label>
          <input value={form.titre} onChange={(e) => update('titre', e.target.value)} placeholder="Nom de la campagne" className={inputCls} />
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Description</label>
          <textarea value={form.description} onChange={(e) => update('description', e.target.value)} rows={3} placeholder="Description détaillée..." className={`${inputCls} resize-none`} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Type *</label>
            <div className="relative">
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Commune *</label>
            <div className="relative">
              <select value={form.commune} onChange={(e) => update('commune', e.target.value)} className={`${inputCls} appearance-none pr-10`}>
                {COMMUNES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Secteur *</label>
            <input value={form.secteur} onChange={(e) => update('secteur', e.target.value)} placeholder="Ex: Hamdallaye" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Date prévue *</label>
            <input type="datetime-local" value={form.datePrevue} onChange={(e) => update('datePrevue', e.target.value)} className={inputCls} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Agent responsable</label>
            <input value={form.agentNom} onChange={(e) => update('agentNom', e.target.value)} placeholder="Nom de l'agent" className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">PME organisatrice</label>
            <input value={form.pmeOrganisatrice} onChange={(e) => update('pmeOrganisatrice', e.target.value)} placeholder="Nom de la PME" className={inputCls} />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-muted-foreground mb-1.5 uppercase tracking-wide">Notes</label>
          <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} rows={2} placeholder="Notes additionnelles..." className={`${inputCls} resize-none`} />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border">
          <Link href="/admin/campagnes">
            <Button type="button" variant="outline">Annuler</Button>
          </Link>
          <Button type="submit">Créer la campagne</Button>
        </div>
      </form>
    </div>
  );
}
