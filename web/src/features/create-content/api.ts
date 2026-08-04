import { apiClient } from '@/shared/api/client';
import { ingestionResponseSchema, type IngestionResponse } from '@/shared/api/contracts';

export interface CreateContentInput {
	title: string;
	body: string;
}

export async function createContent(input: CreateContentInput): Promise<IngestionResponse> {
	const { data } = await apiClient.post('/content', input);
	return ingestionResponseSchema.parse(data);
}
