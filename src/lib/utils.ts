import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function formatDate(
	date: string | Date,
	options?: Intl.DateTimeFormatOptions,
): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
		...options,
	});
}

export function formatDateTime(date: string | Date): string {
	const d = typeof date === "string" ? new Date(date) : date;
	return d.toLocaleDateString("fr-FR", {
		day: "numeric",
		month: "long",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function isActivePath(currentPath: string, href: string): boolean {
	if (href === "/") return currentPath === "/";
	return currentPath.startsWith(href);
}

export function getDocumentUrl(url: string): string {
	const domain = process.env.NEXT_PUBLIC_API_URL;
	return url.startsWith("http")
		? url
		: `${domain}${url.startsWith("/") ? "" : "/"}${url}`;
}

export function documentLabel(url: string, index: number): string {
	try {
		const path = new URL(url).pathname.split("/").filter(Boolean).pop();
		if (path) return decodeURIComponent(path);
	} catch {
		/* relative URL */
	}
	const last = url.split("/").filter(Boolean).pop();
	if (last) return decodeURIComponent(last);
	return `Document ${index + 1}`;
}

// get Image URL
export function getImageUrl(url: string): string {
	const domain = process.env.NEXT_PUBLIC_API_URL;
	return url.startsWith("http")
		? url
		: `${domain}${url.startsWith("/") ? "" : "/"}${url}`;
}
