import { describe, expect, it } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/msw/server';
import { apiPath } from '@/test/msw/handlers';
import type { SearchResponse } from '@/shared/api/contracts';
import { DEFAULT_MIN_SIMILARITY, DEFAULT_SEARCH_PAGE_SIZE, searchContents } from './api';

describe('searchContents', () => {
	it('sends q/mode/category/page/size and returns the typed response', async () => {
		let capturedUrl: URL | undefined;
		const response: SearchResponse = { mode: 'semantic', total: 1, elapsedMs: 5, results: [] };

		server.use(
			http.get(apiPath('/search'), ({ request }) => {
				capturedUrl = new URL(request.url);
				return HttpResponse.json(response);
			})
		);

		const result = await searchContents({ query: 'api rest', mode: 'semantic', category: 'Backend', page: 2 });

		expect(result).toEqual(response);
		expect(capturedUrl?.searchParams.get('q')).toBe('api rest');
		expect(capturedUrl?.searchParams.get('mode')).toBe('semantic');
		expect(capturedUrl?.searchParams.get('category')).toBe('Backend');
		expect(capturedUrl?.searchParams.get('page')).toBe('2');
		expect(capturedUrl?.searchParams.get('size')).toBe(String(DEFAULT_SEARCH_PAGE_SIZE));
		expect(capturedUrl?.searchParams.get('minSimilarity')).toBe(String(DEFAULT_MIN_SIMILARITY));
	});

	it('defaults page to 0 and size to DEFAULT_SEARCH_PAGE_SIZE', async () => {
		let capturedUrl: URL | undefined;

		server.use(
			http.get(apiPath('/search'), ({ request }) => {
				capturedUrl = new URL(request.url);
				return HttpResponse.json({ mode: 'semantic', total: 0, elapsedMs: 1, results: [] });
			})
		);

		await searchContents({ query: 'x', mode: 'keyword' });

		expect(capturedUrl?.searchParams.get('page')).toBe('0');
		expect(capturedUrl?.searchParams.get('size')).toBe(String(DEFAULT_SEARCH_PAGE_SIZE));
	});
});
