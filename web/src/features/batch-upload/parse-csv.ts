import Papa from 'papaparse';
import { REQUIRED_COLUMNS } from './constants';

export interface ParsedCsv {
	rows: { title: string; body: string }[];
	totalRows: number;
}

export type CsvParseResult =
	{ ok: true; data: ParsedCsv } | { ok: false; expected: readonly string[]; received: string[]; missing: string[] };

/** Client-side mirror of BatchUploadServiceImpl.parseCsvLine's column contract. */
export function parseBatchCsv(text: string): CsvParseResult {
	const { data, meta } = Papa.parse<Record<string, string>>(text, {
		header: true,
		skipEmptyLines: true
	});

	const received = meta.fields ?? [];
	const missing = REQUIRED_COLUMNS.filter(column => !received.includes(column));

	if (missing.length > 0) {
		return { ok: false, expected: REQUIRED_COLUMNS, received, missing };
	}

	const rows = data.map(row => ({ title: row.title ?? '', body: row.body ?? '' }));
	return { ok: true, data: { rows, totalRows: rows.length } };
}
