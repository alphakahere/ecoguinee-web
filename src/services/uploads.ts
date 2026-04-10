import { api } from './api';
import { MAX_PHOTO_BYTES, MAX_DOC_BYTES } from "@/lib/constants";

const ACCEPTED_IMAGE_TYPES = [
	"image/jpeg",
	"image/jpg",
	"image/png",
	"image/webp",
	"image/heic",
	"image/heif",
];
const ACCEPTED_DOC_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const ACCEPTED_TYPES = [...ACCEPTED_IMAGE_TYPES, ...ACCEPTED_DOC_TYPES];

function formatMo(bytes: number): string {
	return `${Math.round(bytes / (1024 * 1024))} Mo`;
}

export async function uploadFiles(files: File[]): Promise<string[]> {
  if (files.length === 0) return [];

  const rejected = files.filter((f) => !ACCEPTED_TYPES.includes(f.type));
  if (rejected.length > 0) {
		const names = rejected.map((f) => f.name).join(", ");
		throw new Error(
			`Format non supporté : ${names}. Formats acceptés : JPEG, JPG, PNG, WebP, HEIC, HEIF, PDF, DOC.`,
		);
  }

  const tooLarge = files.filter((f) => {
		const maxBytes = ACCEPTED_IMAGE_TYPES.includes(f.type)
			? MAX_PHOTO_BYTES
			: MAX_DOC_BYTES;
		return f.size > maxBytes;
  });
  if (tooLarge.length > 0) {
		const details = tooLarge
			.map((f) => {
				const max = ACCEPTED_IMAGE_TYPES.includes(f.type)
					? MAX_PHOTO_BYTES
					: MAX_DOC_BYTES;
				return `${f.name} (${formatMo(f.size)} / max ${formatMo(max)})`;
			})
			.join(", ");
		throw new Error(`Fichier trop volumineux : ${details}`);
  }

  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));

  const { data } = await api.post<{ urls: string[] }>('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.urls;
}
