import { api } from './api';

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES];

export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const rejected = files.filter((f) => !ACCEPTED_TYPES.includes(f.type));
  if (rejected.length > 0) {
    const names = rejected.map((f) => f.name).join(', ');
    throw new Error(`Format non supporté : ${names}. Formats acceptés : JPEG, PNG, WebP, HEIC, PDF, DOC.`);
  }

  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const { data } = await api.post<{ urls: string[] }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls;
}
