import axios, { AxiosError } from 'axios';
import { env } from '@/shared/config/env';
import type { ApiErrorResponse } from './contracts';

function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
	return (
		typeof value === 'object' &&
		value !== null &&
		typeof (value as ApiErrorResponse).error === 'string' &&
		typeof (value as ApiErrorResponse).message === 'string'
	);
}

// Normalized error the whole app can switch on. `code` is the English error
// code from the contract (VALIDATION_ERROR, NOT_FOUND...); `message` is the
// Spanish, user-facing text returned by the API (or a local fallback).
export class ApiError extends Error {
	readonly code: string;
	readonly status: number;

	constructor(code: string, message: string, status: number) {
		super(message);
		this.name = 'ApiError';
		this.code = code;
		this.status = status;
	}
}

export const apiClient = axios.create({
	baseURL: env.apiBaseUrl,
	// Generous default: ingestion and semantic search go through inference.
	timeout: 30_000
});

apiClient.interceptors.response.use(
	response => response,
	(error: AxiosError) => {
		if (error.response) {
			const status = error.response.status;
			if (isApiErrorResponse(error.response.data)) {
				return Promise.reject(new ApiError(error.response.data.error, error.response.data.message, status));
			}
			return Promise.reject(new ApiError('UNKNOWN_ERROR', `Error inesperado del servidor (${status}).`, status));
		}
		if (error.code === 'ECONNABORTED') {
			return Promise.reject(new ApiError('TIMEOUT', 'La solicitud tardó demasiado. Inténtalo de nuevo.', 0));
		}
		return Promise.reject(new ApiError('NETWORK_ERROR', 'No se pudo conectar con el servidor.', 0));
	}
);
