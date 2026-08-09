import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiPath } from '@/test/msw/handlers';
import type { ContentDetail, ContentListResponse, RelatedContentResponse } from '@/shared/api/contracts';
import { DEFAULT_CONTENTS_PAGE_SIZE, getContent, getContents, getRelatedContents } from './api';

describe('getContents', () => {
	it('sends category/q/sort/page/size and returns the typed response', async () => {
		let capturedUrl: URL | undefined;
		const response: ContentListResponse = { total: 0, items: [] };

		server.use(
			http.get(apiPath('/contents'), ({ request }) => {
				capturedUrl = new URL(request.url);
				return HttpResponse.json(response);
			})
		);

		const result = await getContents({ category: 'Backend', q: 'api', sort: 'addedAt', page: 1 });

		expect(result).toEqual(response);
		expect(capturedUrl?.searchParams.get('category')).toBe('Backend');
		expect(capturedUrl?.searchParams.get('q')).toBe('api');
		expect(capturedUrl?.searchParams.get('sort')).toBe('addedAt');
		expect(capturedUrl?.searchParams.get('page')).toBe('1');
		expect(capturedUrl?.searchParams.get('size')).toBe(String(DEFAULT_CONTENTS_PAGE_SIZE));
	});

	it('defaults page/size when called with no arguments', async () => {
		let capturedUrl: URL | undefined;

		server.use(
			http.get(apiPath('/contents'), ({ request }) => {
				capturedUrl = new URL(request.url);
				return HttpResponse.json({ total: 0, items: [] });
			})
		);

		await getContents();

		expect(capturedUrl?.searchParams.get('page')).toBe('0');
		expect(capturedUrl?.searchParams.get('size')).toBe(String(DEFAULT_CONTENTS_PAGE_SIZE));
	});
});

describe('getContent', () => {
	it('requests /contents/:id and returns the typed detail', async () => {
		const detail: ContentDetail = {
			id: '42',
			title: 'T',
			category: 'Backend',
			source: 'blog',
			language: 'es',
			addedAt: '2026-01-01T00:00:00Z',
			body: 'body',
			probability: 0.5,
			keywords: [],
			explanation: [],
			url: null
		};

		server.use(http.get(apiPath('/contents/42'), () => HttpResponse.json(detail)));

		await expect(getContent('42')).resolves.toEqual(detail);
	});
});

describe('getRelatedContents', () => {
	it('sends the limit param and returns the typed response', async () => {
		let capturedUrl: URL | undefined;
		const response: RelatedContentResponse = { id: '42', title: 'T', related: [] };

		server.use(
			http.get(apiPath('/contents/42/related'), ({ request }) => {
				capturedUrl = new URL(request.url);
				return HttpResponse.json(response);
			})
		);

		const result = await getRelatedContents('42', 3);

		expect(result).toEqual(response);
		expect(capturedUrl?.searchParams.get('limit')).toBe('3');
	});

	it('defaults limit to 5', async () => {
		let capturedUrl: URL | undefined;

		server.use(
			http.get(apiPath('/contents/42/related'), ({ request }) => {
				capturedUrl = new URL(request.url);
				return HttpResponse.json({ id: '42', title: 'T', related: [] });
			})
		);

		await getRelatedContents('42');

		expect(capturedUrl?.searchParams.get('limit')).toBe('5');
	});
});
