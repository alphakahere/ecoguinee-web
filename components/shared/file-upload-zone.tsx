'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Upload, X, FileText } from 'lucide-react';

interface Props {
  files: File[];
  existingUrls?: string[];
  onAddFiles: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onRemoveExisting?: (index: number) => void;
  accept?: string;
  max?: number;
  label?: string;
}

const IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];

function isImage(name: string) {
  return IMAGE_EXTS.some((ext) => name.toLowerCase().endsWith(ext));
}

function isImageUrl(url: string) {
  return IMAGE_EXTS.some((ext) => url.toLowerCase().includes(ext));
}

export function FileUploadZone({
  files,
  existingUrls = [],
  onAddFiles,
  onRemoveFile,
  onRemoveExisting,
  accept = 'image/*',
  max = 5,
  label = 'Fichiers',
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const totalCount = existingUrls.length + files.length;
  const remaining = max - totalCount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files ?? []);
    onAddFiles(selected.slice(0, remaining));
    e.target.value = '';
  };

  const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
          {label}
        </span>
        <span className="text-[10px] font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          {totalCount}/{max}
        </span>
      </div>

      {remaining > 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full flex flex-col items-center justify-center gap-2 py-6 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-primary/5 transition-all"
        >
          <Upload className="w-6 h-6 text-primary/60" />
          <p className="text-xs font-mono text-muted-foreground">
            Cliquer pour ajouter ({remaining} restant{remaining > 1 ? 's' : ''})
          </p>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        className="hidden"
        onChange={handleChange}
      />

      {(existingUrls.length > 0 || files.length > 0) && (
        <div className="flex gap-2 mt-3 flex-wrap">
          {existingUrls.map((url, i) => (
            <div
              key={`existing-${i}`}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group"
            >
              {isImageUrl(url) ? (
                <Image
                  src={`${apiBase}${url}`}
                  alt=""
                  className="w-full h-full object-cover"
                  fill
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(i)}
                  className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          ))}

          {files.map((f, i) => (
            <div
              key={`new-${i}`}
              className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group"
            >
              {isImage(f.name) ? (
                <Image
                  src={URL.createObjectURL(f)}
                  alt={f.name}
                  className="w-full h-full object-cover"
                  fill
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-muted p-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[7px] font-mono text-muted-foreground truncate w-full text-center mt-0.5">
                    {f.name.split('.').pop()}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemoveFile(i)}
                className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
