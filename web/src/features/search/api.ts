import { apiClient } from '@/shared/api/client';
import type { SearchResponse } from '@/shared/api/contracts';
import type { SearchMode } from '@/shared/config/constants';

export const DEFAULT_SEARCH_PAGE_SIZE = 10;

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
	size = DEFAULT_SEARCH_PAGE_SIZE
}: SearchFilters): Promise<SearchResponse> {
	const { data } = await apiClient.get<SearchResponse>('/search', {
		params: { q: query, mode, category, page, size }
	});
	return data;
}
