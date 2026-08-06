import { apiClient } from '@/shared/api/client';
import type { IngestionResponse } from '@/shared/api/contracts';

export interface AnalyzeInput {
	title: string;
	body: string;
}

// The analyze screen reuses the content ingestion pipeline: POST /content
// embeds, classifies, and returns the related neighbours in one round-trip.
export async function analyzeContent(input: AnalyzeInput): Promise<IngestionResponse> {
	const { data } = await apiClient.post<IngestionResponse>('/content', input);
	return data;
}
