import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useSearchParamsState } from './use-search-params-state';

function wrapper(initialEntries: string[]) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
	};
}

describe('useSearchParamsState', () => {
	it('defaults to semantic mode, no category and page 0', () => {
		const { result } = renderHook(() => useSearchParamsState(), { wrapper: wrapper(['/buscar']) });

		expect(result.current.query).toBe('');
		expect(result.current.mode).toBe('semantic');
		expect(result.current.category).toBeUndefined();
		expect(result.current.page).toBe(0);
	});

	it('falls back to semantic for an invalid mode param', () => {
		const { result } = renderHook(() => useSearchParamsState(), {
			wrapper: wrapper(['/buscar?mode=not-a-mode'])
		});

		expect(result.current.mode).toBe('semantic');
	});

	it('ignores a category outside the known list', () => {
		const { result } = renderHook(() => useSearchParamsState(), {
			wrapper: wrapper(['/buscar?category=Inventada'])
		});

		expect(result.current.category).toBeUndefined();
	});

	it('rejects a non-numeric page and defaults to 0', () => {
		const { result } = renderHook(() => useSearchParamsState(), { wrapper: wrapper(['/buscar?page=abc']) });

		expect(result.current.page).toBe(0);
	});

	it('parses a valid page number', () => {
		const { result } = renderHook(() => useSearchParamsState(), { wrapper: wrapper(['/buscar?page=3']) });

		expect(result.current.page).toBe(3);
	});

	it('resets the page when the query changes', () => {
		const { result } = renderHook(() => useSearchParamsState(), {
			wrapper: wrapper(['/buscar?page=3'])
		});

		act(() => result.current.setQuery('spring boot'));

		expect(result.current.page).toBe(0);
		expect(result.current.query).toBe('spring boot');
	});

	it('resets the page when the mode changes', () => {
		const { result } = renderHook(() => useSearchParamsState(), {
			wrapper: wrapper(['/buscar?page=3'])
		});

		act(() => result.current.setMode('keyword'));

		expect(result.current.page).toBe(0);
		expect(result.current.mode).toBe('keyword');
	});

	it('resets the page when the category changes', () => {
		const { result } = renderHook(() => useSearchParamsState(), {
			wrapper: wrapper(['/buscar?page=3'])
		});

		act(() => result.current.setCategory('Backend'));

		expect(result.current.page).toBe(0);
		expect(result.current.category).toBe('Backend');
	});

	it('setPage(0) removes the page param instead of writing "0"', () => {
		const { result } = renderHook(() => useSearchParamsState(), { wrapper: wrapper(['/buscar?page=3']) });

		act(() => result.current.setPage(0));

		expect(result.current.page).toBe(0);
	});

	it('clearFilters removes category and page but keeps the query', () => {
		const { result } = renderHook(() => useSearchParamsState(), {
			wrapper: wrapper(['/buscar?q=api&category=Backend&page=2'])
		});

		act(() => result.current.clearFilters());

		expect(result.current.query).toBe('api');
		expect(result.current.category).toBeUndefined();
		expect(result.current.page).toBe(0);
	});
});
