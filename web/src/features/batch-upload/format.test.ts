import { describe, expect, it } from 'vitest';
import { formatDuration, formatFileSize, formatRate } from './format';

describe('formatFileSize', () => {
	it('floors to 1 KB for very small sizes', () => {
		expect(formatFileSize(0)).toBe('1 KB');
		expect(formatFileSize(10)).toBe('1 KB');
	});

	it('rounds to whole KB below the 1 MB threshold', () => {
		expect(formatFileSize(1023 * 1024)).toBe('1023 KB');
	});

	it('switches to MB at exactly 1 MB', () => {
		expect(formatFileSize(1024 * 1024)).toBe('1 MB');
	});

	it('shows one decimal for MB sizes', () => {
		expect(formatFileSize(1.5 * 1024 * 1024)).toBe('1,5 MB');
	});
});

describe('formatRate', () => {
	it('formats with one decimal and the Spanish unit suffix', () => {
		expect(formatRate(12.34)).toBe('12,3 filas/s');
	});
});

describe('formatDuration', () => {
	it('formats seconds as mm:ss', () => {
		expect(formatDuration(61)).toBe('01:01');
		expect(formatDuration(0)).toBe('00:00');
		expect(formatDuration(600)).toBe('10:00');
	});

	it('clamps negative values to zero', () => {
		expect(formatDuration(-5)).toBe('00:00');
	});

	it('clamps non-finite values to zero', () => {
		expect(formatDuration(Infinity)).toBe('00:00');
		expect(formatDuration(NaN)).toBe('00:00');
	});

	it('rounds fractional seconds', () => {
		expect(formatDuration(59.6)).toBe('01:00');
	});
});
