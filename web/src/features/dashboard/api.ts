import { apiClient } from '@/shared/api/client';
import type { ModelResponse, StatsResponse } from '@/shared/api/contracts';

export async function getStats(): Promise<StatsResponse> {
	const { data } = await apiClient.get<StatsResponse>('/stats');
	return data;
}

// The only endpoint that works without the database (passthrough to inference).
export async function getModelInfo(): Promise<ModelResponse> {
	const { data } = await apiClient.get<ModelResponse>('/model');
	return data;
}
