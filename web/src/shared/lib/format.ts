const dateTimeFormatter = new Intl.DateTimeFormat('es', {
	dateStyle: 'medium',
	timeStyle: 'short'
});

export function formatDateTime(iso: string): string {
	const date = new Date(iso);
	return Number.isNaN(date.getTime()) ? iso : dateTimeFormatter.format(date);
}

/** `similarity` is 1 - cosine distance: 1.0 means identical. */
export function formatSimilarity(similarity: number): string {
	return `${Math.round(similarity * 100)}%`;
}

const cosineFormatter = new Intl.NumberFormat('es', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2
});

/** Raw cosine score, as the design shows it next to related content: `0,89`. */
export function formatCosine(similarity: number): string {
	return cosineFormatter.format(similarity);
}

const probabilityFormatter = new Intl.NumberFormat('es', {
	minimumFractionDigits: 1,
	maximumFractionDigits: 1
});

export function formatProbability(probability: number): string {
	return `${probabilityFormatter.format(probability * 100)}%`;
}
