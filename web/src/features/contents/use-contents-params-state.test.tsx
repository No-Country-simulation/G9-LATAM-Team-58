import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { useContentsParamsState } from './use-contents-params-state';

function wrapper(initialEntries: string[]) {
	return function Wrapper({ children }: { children: ReactNode }) {
		return <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>;
	};
}

describe('useContentsParamsState', () => {
	it('defaults to empty query, no category and page 0', () => {
		const { result } = renderHook(() => useContentsParamsState(), { wrapper: wrapper(['/contenidos']) });

		expect(result.current.q).toBe('');
		expect(result.current.category).toBeUndefined();
		expect(result.current.page).toBe(0);
	});

	it('ignores a category outside the known list', () => {
		const { result } = renderHook(() => useContentsParamsState(), {
			wrapper: wrapper(['/contenidos?category=Inventada'])
		});

		expect(result.current.category).toBeUndefined();
	});

	it('rejects a non-numeric page and defaults to 0', () => {
		const { result } = renderHook(() => useContentsParamsState(), {
			wrapper: wrapper(['/contenidos?page=abc'])
		});

		expect(result.current.page).toBe(0);
	});

	it('resets the page when the query changes', () => {
		const { result } = renderHook(() => useContentsParamsState(), {
			wrapper: wrapper(['/contenidos?page=3'])
		});

		act(() => result.current.setQuery('spring'));

		expect(result.current.page).toBe(0);
		expect(result.current.q).toBe('spring');
	});

	it('resets the page when the category changes', () => {
		const { result } = renderHook(() => useContentsParamsState(), {
			wrapper: wrapper(['/contenidos?page=3'])
		});

		act(() => result.current.setCategory('Backend'));

		expect(result.current.page).toBe(0);
		expect(result.current.category).toBe('Backend');
	});

	it('clearFilters removes q, category and page', () => {
		const { result } = renderHook(() => useContentsParamsState(), {
			wrapper: wrapper(['/contenidos?q=api&category=Backend&page=2'])
		});

		act(() => result.current.clearFilters());

		expect(result.current.q).toBe('');
		expect(result.current.category).toBeUndefined();
		expect(result.current.page).toBe(0);
	});
});
