import { describe, expect, it } from 'vitest';
import { validateBatchFile } from './use-batch-file';
import { MAX_FILE_SIZE } from './constants';

function makeFile(name: string, size: number): File {
	const content = size > 0 ? new Uint8Array(size) : new Uint8Array(0);
	return new File([content], name, { type: 'text/csv' });
}

describe('validateBatchFile', () => {
	it('rejects a file without the .csv extension', () => {
		expect(validateBatchFile(makeFile('data.txt', 100))).toMatch(/\.csv/);
	});

	it('accepts .CSV case-insensitively', () => {
		expect(validateBatchFile(makeFile('DATA.CSV', 100))).toBeNull();
	});

	it('rejects an empty file', () => {
		expect(validateBatchFile(makeFile('data.csv', 0))).toMatch(/vacío/);
	});

	it('rejects a file over the 5 MB limit', () => {
		expect(validateBatchFile(makeFile('data.csv', MAX_FILE_SIZE + 1))).toMatch(/5 MB/);
	});

	it('accepts a valid file within limits', () => {
		expect(validateBatchFile(makeFile('data.csv', 1024))).toBeNull();
	});
});
