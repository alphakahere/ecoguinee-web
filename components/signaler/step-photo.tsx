'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import type { ReportData } from './report-wizard';

interface Props {
  data: ReportData;
  update: (d: Partial<ReportData>) => void;
}

export function StepPhoto({ data, update }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const remaining = 3 - data.photos.length;
    const toAdd = files.slice(0, remaining).map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
    }));
    update({ photos: [...data.photos, ...toAdd] });
    e.target.value = '';
  };

  const removePhoto = (i: number) => {
    update({ photos: data.photos.filter((_, idx) => idx !== i) });
  };

  const charsLeft = 300 - data.description.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-bold text-2xl mb-1">Montrez-nous le problème</h1>
        <p className="text-sm font-mono text-muted-foreground">
          Une photo vaut mille mots — optionnel mais très utile.
        </p>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-mono text-muted-foreground">Photos</p>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            Optionnel - max 3
          </span>
        </div>

        {data.photos.length < 3 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="w-full flex flex-col items-center justify-center gap-2.5 py-8 rounded-2xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all min-h-[120px]"
          >
            <Camera className="w-8 h-8 text-primary/60" />
            <div className="text-center">
              <p className="text-sm font-mono text-foreground">Prendre une photo ou importer</p>
              <p className="text-[11px] font-mono text-muted-foreground mt-0.5">
                Cliquer pour parcourir
              </p>
            </div>
          </button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          multiple
          className="hidden"
          onChange={handleFiles}
        />

        {data.photos.length > 0 && (
          <div className="flex gap-2 mt-3 flex-wrap">
            {data.photos.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-border group">
                <Image src={p.url} alt={p.name} className="w-full h-full object-cover" fill unoptimized />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-mono text-muted-foreground">Description</label>
          <span className={`text-[10px] font-mono ${charsLeft < 50 ? 'text-[#E8A020]' : 'text-muted-foreground'}`}>
            {data.description.length}/300
          </span>
        </div>
        <textarea
          value={data.description}
          onChange={(e) => { if (e.target.value.length <= 300) update({ description: e.target.value }); }}
          placeholder="Décrivez le problème en quelques mots..."
          rows={4}
          className="w-full px-4 py-3.5 rounded-xl border border-border bg-background text-base font-mono resize-none outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground leading-relaxed"
        />
      </div>

      <div>
        <label className="block text-sm font-mono text-muted-foreground mb-2">Prénom (optionnel)</label>
        <input
          value={data.prenom}
          onChange={(e) => update({ prenom: e.target.value })}
          placeholder="Mamadou"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base font-mono outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="block text-sm font-mono text-muted-foreground mb-2">Téléphone (optionnel)</label>
        <input
          value={data.telephone}
          onChange={(e) => update({ telephone: e.target.value })}
          placeholder="+224 6XX XX XX XX"
          type="tel"
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-base font-mono outline-none focus:ring-2 focus:ring-primary/30"
        />
      </div>
    </div>
  );
}
