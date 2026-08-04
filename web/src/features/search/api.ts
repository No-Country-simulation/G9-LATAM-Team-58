import { apiClient } from '@/shared/api/client';
import { searchResponseSchema, type SearchResponse } from '@/shared/api/contracts';
import type { SearchMode } from '@/shared/config/constants';

export interface SearchFilters {
	query: string;
	mode: SearchMode;
	category?: string;
	page?: number;
	size?: number;
}

export async function searchContents({
	query,
	mode,
	category,
	page = 0,
	size = 10
}: SearchFilters): Promise<SearchResponse> {
	const { data } = await apiClient.get('/search', {
		params: { q: query, mode, category, page, size }
	});
	return searchResponseSchema.parse(data);
}
