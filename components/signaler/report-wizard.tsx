'use client';

import { useState } from 'react';
import { ArrowLeft, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { StepLocation } from './step-location';
import { StepDetails } from './step-details';
import { StepPhoto } from './step-photo';
import { StepConfirm } from './step-confirm';
import { useCreatePublicReport } from '@/hooks/mutations/useCreatePublicReport';
import { useLocationLabel } from '@/hooks/useLocationLabel';
import { uploadFiles } from '@/services/uploads';

export type Step = 1 | 2 | 3 | 4;
export type WasteType = 'liquid' | 'solid';
export type Gravite = 'faible' | 'modere' | 'critique';

export interface ReportData {
  commune: string;
  quartier: string;
  secteur: string;
  zoneId: string;
  latitude: number;
  longitude: number;
  wasteType: WasteType | null;
  gravite: Gravite | null;
  photos: { url: string; name: string; file?: File }[];
  description: string;
  prenom: string;
  telephone: string;
}

const INITIAL: ReportData = {
  commune: '', quartier: '', secteur: '', zoneId: '', latitude: 0, longitude: 0,
  wasteType: null, gravite: null,
  photos: [], description: '', prenom: '', telephone: '',
};

const WASTE_MAP: Record<string, string> = { liquid: 'LIQUID', solid: 'SOLID' };
const SEVERITY_MAP: Record<string, string> = { faible: 'LOW', modere: 'MODERATE', critique: 'CRITICAL' };

const STEP_LABELS = ['Localisation', 'Type & Gravité', 'Photos & Description', 'Confirmation'];

export function ReportWizard() {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<ReportData>(INITIAL);
  const [submitted, setSubmitted] = useState(false);

  const createReport = useCreatePublicReport();
  const locationLabel = useLocationLabel(data.commune, data.quartier, data.secteur);

  const update = (d: Partial<ReportData>) => setData((prev) => ({ ...prev, ...d }));

  const canNext = (): boolean => {
    if (step === 1) return !!(data.commune && data.secteur && data.zoneId);
    if (step === 2) return !!(data.wasteType && data.gravite);
    return true;
  };

  const handleNext = () => {
    if (step < 4) { setStep((step + 1) as Step); window.scrollTo(0, 0); }
    else handleSubmit();
  };

  const handleBack = () => {
    if (step > 1) { setStep((step - 1) as Step); window.scrollTo(0, 0); }
  };

  const handleSubmit = async () => {
    if (!data.zoneId || !data.wasteType || !data.gravite) return;

    try {
      const photoFiles = data.photos.map((p) => p.file).filter(Boolean) as File[];
      const photoUrls = await uploadFiles(photoFiles);

      await createReport.mutateAsync({
        type: WASTE_MAP[data.wasteType] ?? 'SOLID',
        severity: SEVERITY_MAP[data.gravite] ?? 'MODERATE',
        description: data.description.trim() || undefined,
        address: locationLabel,
        latitude: data.latitude || 9.5370,
        longitude: data.longitude || -13.6785,
        zoneId: data.zoneId,
        contactName: data.prenom.trim() || undefined,
        contactPhone: data.telephone.trim() || undefined,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });
      setSubmitted(true);
      toast.success('Signalement envoyé avec succès !', { description: 'Les autorités ont été notifiées.' });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Impossible d\'envoyer le signalement. Réessayez.';
      toast.error(message);
    }
  };

  const handleReset = () => {
    setData(INITIAL);
    setStep(1);
    setSubmitted(false);
    window.scrollTo(0, 0);
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-5 text-center py-20">
        <div className="w-24 h-24 rounded-full bg-[#6FCF4A]/15 border-2 border-[#6FCF4A]/30 flex items-center justify-center mb-6">
          <CheckCircle className="w-12 h-12 text-[#6FCF4A]" />
        </div>
        <h1 className="font-bold text-3xl mb-2">Signalement envoyé !</h1>
        <p className="text-base font-mono text-muted-foreground mb-8 max-w-sm">
          Merci pour votre contribution. Les autorités et l&apos;équipe terrain ont été notifiées.
        </p>
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button onClick={handleReset} className="py-4 rounded-2xl bg-primary text-white font-mono font-semibold hover:bg-primary/90 transition-colors">
            Faire un autre signalement
          </button>
          <Link href="/" className="py-3 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors text-center">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[580px] mx-auto px-5 py-10 bg-white rounded-2xl my-10">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex gap-1 mb-2.5">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex-1 h-1 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{ width: s <= step ? '100%' : '0%', background: '#2D7D46' }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-1">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex-1 text-center">
              <span className={`text-[9px] font-mono ${i + 1 === step ? 'text-primary font-semibold' : i + 1 < step ? 'text-[#6FCF4A]' : 'text-muted-foreground'}`}>
                {i + 1 < step ? '\u2713 ' : ''}{label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {step > 1 && (
        <button onClick={handleBack} className="flex items-center gap-1.5 mb-6 text-sm font-mono text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Étape précédente
        </button>
      )}

      {step === 1 && <StepLocation data={data} update={update} />}
      {step === 2 && <StepDetails data={data} update={update} />}
      {step === 3 && <StepPhoto data={data} update={update} />}
      {step === 4 && <StepConfirm data={data} goTo={setStep} />}

      <div className="mt-8">
        <button
          onClick={handleNext}
          disabled={!canNext() || createReport.isPending}
          className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-mono font-semibold transition-all ${
            step === 4
              ? 'bg-[#2D7D46] text-white hover:bg-[#2D7D46]/90 disabled:opacity-40'
              : 'bg-primary text-white hover:bg-primary/90 disabled:opacity-40'
          } disabled:cursor-not-allowed`}
        >
          {createReport.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Envoi en cours...</>
          ) : step === 4 ? 'Envoyer le signalement' : 'Continuer'}
        </button>
      </div>
    </div>
  );
}
