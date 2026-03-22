import { api } from './api';

export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const { data } = await api.post<{ urls: string[] }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls;
}
