import { apiClient } from '@/shared/api/client';
import {
	contentDetailSchema,
	contentListResponseSchema,
	relatedContentResponseSchema,
	type ContentDetail,
	type ContentListResponse,
	type RelatedContentResponse
} from '@/shared/api/contracts';

// The API only sorts when sort is exactly 'added_at' or 'addedAt' (DESC);
// anything else means unordered.
export type ContentsSort = 'added_at' | 'addedAt';

export const DEFAULT_CONTENTS_PAGE_SIZE = 20;

export interface ContentsFilter {
	category?: string;
	q?: string;
	sort?: ContentsSort;
	page?: number;
	size?: number;
}

export async function getContents({
	category,
	q,
	sort,
	page = 0,
	size = DEFAULT_CONTENTS_PAGE_SIZE
}: ContentsFilter = {}): Promise<ContentListResponse> {
	const { data } = await apiClient.get('/contents', {
		params: { category, q, sort, page, size }
	});
	return contentListResponseSchema.parse(data);
}

export async function getContent(id: string): Promise<ContentDetail> {
	const { data } = await apiClient.get(`/contents/${id}`);
	return contentDetailSchema.parse(data);
}

export async function getRelatedContents(id: string, limit = 5): Promise<RelatedContentResponse> {
	const { data } = await apiClient.get(`/contents/${id}/related`, {
		params: { limit }
	});
	return relatedContentResponseSchema.parse(data);
}
