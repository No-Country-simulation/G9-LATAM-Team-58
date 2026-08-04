import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { SearchResponse } from '@/shared/api/contracts';
import { searchContents, type SearchFilters } from './api';

export const searchKeys = {
	all: ['search'] as const,
	results: (filters: SearchFilters) => [...searchKeys.all, 'results', filters] as const
};

export function useSearch(filters: SearchFilters) {
	return useQuery<SearchResponse, ApiError>({
		queryKey: searchKeys.results(filters),
		queryFn: () => searchContents(filters),
		enabled: filters.query.trim().length > 0,
		placeholderData: keepPreviousData
	});
}
