import { describe, expect, it } from 'vitest';
import { ApiError } from '@/shared/api/client';
import { shouldRetry } from './query-client';

describe('shouldRetry', () => {
	it('never retries a 4xx ApiError', () => {
		const error = new ApiError('VALIDATION_ERROR', 'Datos inválidos.', 400);
		expect(shouldRetry(0, error)).toBe(false);
		expect(shouldRetry(1, error)).toBe(false);
	});

	it('retries a 5xx ApiError up to 2 times', () => {
		const error = new ApiError('UNKNOWN_ERROR', 'Error inesperado.', 500);
		expect(shouldRetry(0, error)).toBe(true);
		expect(shouldRetry(1, error)).toBe(true);
		expect(shouldRetry(2, error)).toBe(false);
	});

	it('retries a non-ApiError up to 2 times', () => {
		const error = new Error('boom');
		expect(shouldRetry(0, error)).toBe(true);
		expect(shouldRetry(2, error)).toBe(false);
	});
});
