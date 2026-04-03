import { ApiZone } from "@/types/api";
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
	if (!url) {
		return (
			"https://placehold.co/600x400?text=" +
			encodeURIComponent("Aucun document") +
			"&bg=transparent&fg=transparent"
		);
	} else if (url.startsWith("http")) {
		return url;
	} else {
		return `${domain}${url.startsWith("/") ? "" : "/"}${url}`;
	}
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
	if (!url) {
		return (
			"https://placehold.co/600x400?text=" +
			encodeURIComponent("Aucune image") +
			"&bg=transparent&fg=transparent"
		);
	} else if (url.startsWith("http")) {
		return url;
	} else {
		return `${domain}${url.startsWith("/") ? "" : "/"}${url}`;
	}
}

export function flattenTree(nodes: ApiZone[]): ApiZone[] {
	const result: ApiZone[] = [];
	function walk(n: ApiZone) {
		result.push(n);
		n.children?.forEach(walk);
	}
	nodes.forEach(walk);
	return result;
}

export function getMunicipalitiesFromNeighborhoods(
	agentZones: ApiZone[],
	flat: ApiZone[],
): ApiZone[] {
	const map = new Map(flat.map((z) => [z.id, z]));

	const municipalities = agentZones
		.map((zone) => {
			// sécurité : on prend depuis le flat
			const current = map.get(zone.id);

			// Si jamais ce n’est pas déjà un quartier
			if (current?.type !== "NEIGHBORHOOD") {
				return null;
			}

			// remonter au parent = MUNICIPALITY
			return current.parentId ? map.get(current.parentId) : null;
		})
		.filter(
			(z): z is ApiZone => z != null && z.type === "MUNICIPALITY",
		);

	// enlever les doublons
	return Array.from(new Map(municipalities.map((m) => [m.id, m])).values());
}
