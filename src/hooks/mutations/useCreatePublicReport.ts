import { useMutation } from '@tanstack/react-query';
import { api } from '@/services/api';
import { uploadFiles } from '@/services/uploads';

export interface PublicReportPayload {
  type: string;
  severity: string;
  description?: string;
  address?: string;
  latitude: number;
  longitude: number;
  zoneId: string;
  contactName?: string;
  contactPhone?: string;
  photoFiles?: File[];
}

export function useCreatePublicReport() {
  return useMutation({
    mutationFn: async ({ photoFiles, ...payload }: PublicReportPayload) => {
      const photoUrls = photoFiles && photoFiles.length > 0 ? await uploadFiles(photoFiles) : [];
      const { data } = await api.post('/reports/public', {
        ...payload,
        photos: photoUrls.length > 0 ? photoUrls : undefined,
      });
      return data;
    },
  });
}
