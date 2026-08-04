import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ApiError } from '@/shared/api/client';
import type { ContentDetail, ContentListResponse, RelatedContentResponse } from '@/shared/api/contracts';
import { getContent, getContents, getRelatedContents, type ContentsFilter } from './api';

export const contentKeys = {
	all: ['contents'] as const,
	lists: () => [...contentKeys.all, 'list'] as const,
	list: (filter: ContentsFilter) => [...contentKeys.lists(), filter] as const,
	details: () => [...contentKeys.all, 'detail'] as const,
	detail: (id: string) => [...contentKeys.details(), id] as const,
	related: (id: string, limit: number) => [...contentKeys.details(), id, 'related', limit] as const
};

export function useContents(filter: ContentsFilter = {}) {
	return useQuery<ContentListResponse, ApiError>({
		queryKey: contentKeys.list(filter),
		queryFn: () => getContents(filter),
		placeholderData: keepPreviousData
	});
}

export function useContent(id: string) {
	return useQuery<ContentDetail, ApiError>({
		queryKey: contentKeys.detail(id),
		queryFn: () => getContent(id),
		enabled: id.length > 0
	});
}

export function useRelatedContents(id: string, limit = 5) {
	return useQuery<RelatedContentResponse, ApiError>({
		queryKey: contentKeys.related(id, limit),
		queryFn: () => getRelatedContents(id, limit),
		enabled: id.length > 0
	});
}
