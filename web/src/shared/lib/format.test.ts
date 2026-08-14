import { describe, expect, it } from 'vitest';
import { formatCosine, formatDateTime, formatProbability, formatSimilarity } from './format';

describe('formatDateTime', () => {
	it('formats a valid ISO date using the es locale', () => {
		const result = formatDateTime('2026-01-15T10:30:00Z');
		expect(result).not.toBe('2026-01-15T10:30:00Z');
		expect(result.length).toBeGreaterThan(0);
	});

	it('falls back to the raw string when the date cannot be parsed', () => {
		expect(formatDateTime('not-a-date')).toBe('not-a-date');
	});
});

describe('formatSimilarity', () => {
	it('rounds to the nearest whole percentage', () => {
		expect(formatSimilarity(0.923)).toBe('92%');
		expect(formatSimilarity(1)).toBe('100%');
		expect(formatSimilarity(0)).toBe('0%');
	});
});

describe('formatCosine', () => {
	it('formats with two decimals and a comma separator', () => {
		expect(formatCosine(0.89)).toBe('0,89');
		expect(formatCosine(1)).toBe('1,00');
	});
});

describe('formatProbability', () => {
	it('formats as a percentage with one decimal', () => {
		expect(formatProbability(0.876)).toBe('87,6%');
	});
});
