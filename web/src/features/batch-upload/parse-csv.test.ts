import { describe, expect, it } from 'vitest';
import { parseBatchCsv } from './parse-csv';

describe('parseBatchCsv', () => {
	it('parses a well-formed CSV into rows', () => {
		const csv = 'title,body\nTítulo uno,Cuerpo uno\nTítulo dos,Cuerpo dos';

		expect(parseBatchCsv(csv)).toEqual({
			ok: true,
			data: {
				totalRows: 2,
				rows: [
					{ title: 'Título uno', body: 'Cuerpo uno' },
					{ title: 'Título dos', body: 'Cuerpo dos' }
				]
			}
		});
	});

	it('reports missing required columns', () => {
		const csv = 'titulo,texto\nfoo,bar';

		expect(parseBatchCsv(csv)).toMatchObject({
			ok: false,
			expected: ['title', 'body'],
			received: ['titulo', 'texto'],
			missing: ['title', 'body']
		});
	});

	it('reports a single missing column when only one is absent', () => {
		expect(parseBatchCsv('title\nOnly title')).toMatchObject({ ok: false, missing: ['body'] });
	});

	it('handles commas, quotes and newlines embedded inside quoted fields', () => {
		const csv = 'title,body\n"Título, con coma","Cuerpo con ""comillas""\ny salto de línea"';

		expect(parseBatchCsv(csv)).toEqual({
			ok: true,
			data: {
				totalRows: 1,
				rows: [{ title: 'Título, con coma', body: 'Cuerpo con "comillas"\ny salto de línea' }]
			}
		});
	});

	it('skips empty lines', () => {
		const csv = 'title,body\nA,B\n\nC,D\n';

		expect(parseBatchCsv(csv)).toMatchObject({ ok: true, data: { totalRows: 2 } });
	});

	it('ignores extra columns beyond title/body', () => {
		const csv = 'title,body,source\nA,B,blog';

		expect(parseBatchCsv(csv)).toEqual({ ok: true, data: { totalRows: 1, rows: [{ title: 'A', body: 'B' }] } });
	});

	it('defaults missing cell values to empty strings', () => {
		const csv = 'title,body\nOnly title,';

		expect(parseBatchCsv(csv)).toEqual({
			ok: true,
			data: { totalRows: 1, rows: [{ title: 'Only title', body: '' }] }
		});
	});
});
