import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiPath } from '@/test/msw/handlers';
import { apiClient, ApiError } from './client';

describe('apiClient error interceptor', () => {
	it('maps a {error, message} envelope to an ApiError', async () => {
		server.use(
			http.get(apiPath('/broken'), () =>
				HttpResponse.json({ error: 'VALIDATION_ERROR', message: 'Datos inválidos.' }, { status: 400 })
			)
		);

		await expect(apiClient.get('/broken')).rejects.toMatchObject({
			code: 'VALIDATION_ERROR',
			message: 'Datos inválidos.',
			status: 400
		});
	});

	it('maps a non-envelope error response to UNKNOWN_ERROR', async () => {
		server.use(http.get(apiPath('/broken'), () => HttpResponse.json({ oops: true }, { status: 500 })));

		await expect(apiClient.get('/broken')).rejects.toMatchObject({
			code: 'UNKNOWN_ERROR',
			status: 500
		});
	});

	it('maps a timeout to TIMEOUT with status 0', async () => {
		server.use(
			http.get(apiPath('/slow'), async () => {
				await new Promise(resolve => setTimeout(resolve, 50));
				return HttpResponse.json({});
			})
		);

		await expect(apiClient.get('/slow', { timeout: 1 })).rejects.toMatchObject({
			code: 'TIMEOUT',
			status: 0
		});
	});

	it('maps a network failure (no response) to NETWORK_ERROR', async () => {
		server.use(http.get(apiPath('/unreachable'), () => HttpResponse.error()));

		await expect(apiClient.get('/unreachable')).rejects.toMatchObject({
			code: 'NETWORK_ERROR',
			status: 0
		});
	});

	it('rejects with an instance of ApiError', async () => {
		server.use(http.get(apiPath('/unreachable'), () => HttpResponse.error()));

		await expect(apiClient.get('/unreachable')).rejects.toBeInstanceOf(ApiError);
	});
});
