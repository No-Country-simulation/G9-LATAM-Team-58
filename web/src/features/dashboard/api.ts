import { apiClient } from '@/shared/api/client';
import {
	modelResponseSchema,
	statsResponseSchema,
	type ModelResponse,
	type StatsResponse
} from '@/shared/api/contracts';

export async function getStats(): Promise<StatsResponse> {
	const { data } = await apiClient.get('/stats');
	return statsResponseSchema.parse(data);
}

// The only endpoint that works without the database (passthrough to inference).
export async function getModelInfo(): Promise<ModelResponse> {
	const { data } = await apiClient.get('/model');
	return modelResponseSchema.parse(data);
}
