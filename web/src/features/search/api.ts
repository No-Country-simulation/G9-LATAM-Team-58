import { apiClient } from '@/shared/api/client';
import type { SearchResponse } from '@/shared/api/contracts';
import type { SearchMode } from '@/shared/config/constants';

export const DEFAULT_SEARCH_PAGE_SIZE = 10;
// Below this cosine similarity, semantic search returns noise: E5 embeddings on this
// corpus are anisotropic, so even off-topic queries score ~0.82-0.84 against unrelated
// docs. 0.84 is the point where an off-domain query's match count collapses to ~0
// while on-topic queries still retain a meaningful candidate set.
export const DEFAULT_MIN_SIMILARITY = 0.84;

export interface SearchFilters {
	query: string;
	mode: SearchMode;
	category?: string;
	page?: number;
	size?: number;
	minSimilarity?: number;
}

export async function searchContents({
	query,
	mode,
	category,
	page = 0,
	size = DEFAULT_SEARCH_PAGE_SIZE,
	minSimilarity = DEFAULT_MIN_SIMILARITY
}: SearchFilters): Promise<SearchResponse> {
	const { data } = await apiClient.get<SearchResponse>('/search', {
		params: { q: query, mode, category, page, size, minSimilarity }
	});
	return data;
}
