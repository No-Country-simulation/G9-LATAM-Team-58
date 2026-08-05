import { CSV_TEMPLATE } from './constants';

export function formatFileSize(bytes: number) {
	if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
	return `${(bytes / (1024 * 1024)).toLocaleString('es', { maximumFractionDigits: 1 })} MB`;
}

const rateFormatter = new Intl.NumberFormat('es', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Rows classified per second, as shown next to the processing progress bar. */
export function formatRate(rowsPerSecond: number): string {
	return `${rateFormatter.format(rowsPerSecond)} filas/s`;
}

/** Seconds remaining as `mm:ss`, clamped to non-negative and finite. */
export function formatDuration(seconds: number): string {
	const clamped = Number.isFinite(seconds) ? Math.max(0, Math.round(seconds)) : 0;
	const minutes = Math.floor(clamped / 60);
	const remainder = clamped % 60;
	return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}

export function downloadTemplate() {
	const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = 'plantilla-lote.csv';
	link.click();
	URL.revokeObjectURL(url);
}
