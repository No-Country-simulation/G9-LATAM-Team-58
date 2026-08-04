import { apiClient } from '@/shared/api/client';
import {
	contentDetailSchema,
	contentListSchema,
	relatedContentResponseSchema,
	type ContentDetail,
	type ContentSummary,
	type RelatedContentResponse
} from '@/shared/api/contracts';

// The API only sorts when sort is exactly 'added_at' or 'addedAt' (DESC);
// anything else means unordered.
export type ContentsSort = 'added_at' | 'addedAt';

export interface ContentsFilter {
	category?: string;
	sort?: ContentsSort;
	page?: number;
	size?: number;
}

export async function getContents({ category, sort, page = 0, size = 20 }: ContentsFilter = {}): Promise<
	ContentSummary[]
> {
	const { data } = await apiClient.get('/contents', {
		params: { category, sort, page, size }
	});
	return contentListSchema.parse(data);
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
