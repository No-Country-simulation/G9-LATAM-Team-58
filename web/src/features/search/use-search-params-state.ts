import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { CATEGORIES, SEARCH_MODES, type SearchMode } from '@/shared/config/constants';

function isSearchMode(value: string | null): value is SearchMode {
	return SEARCH_MODES.some(mode => mode.value === value);
}

function isCategory(value: string | null): boolean {
	return CATEGORIES.some(category => category === value);
}

/**
 * Search state lives in the URL so a query is shareable and survives
 * back/forward navigation. Changing the query, mode or category resets the
 * page — otherwise the URL could point at a page that no longer exists.
 */
export function useSearchParamsState() {
	const [searchParams, setSearchParams] = useSearchParams();

	const rawQuery = searchParams.get('q');
	const rawMode = searchParams.get('mode');
	const rawCategory = searchParams.get('category');
	const rawPage = searchParams.get('page');

	const query = rawQuery ?? '';
	const mode = isSearchMode(rawMode) ? rawMode : 'semantic';
	const category = rawCategory && isCategory(rawCategory) ? rawCategory : undefined;
	const page = rawPage !== null && /^\d+$/.test(rawPage) ? Number(rawPage) : 0;

	const setQuery = useCallback(
		(next: string) => {
			setSearchParams(
				params => {
					if (next) {
						params.set('q', next);
					} else {
						params.delete('q');
					}
					params.delete('page');
					return params;
				},
				{ replace: true }
			);
		},
		[setSearchParams]
	);

	const setMode = useCallback(
		(next: SearchMode) => {
			setSearchParams(params => {
				params.set('mode', next);
				params.delete('page');
				return params;
			});
		},
		[setSearchParams]
	);

	const setCategory = useCallback(
		(next: string | undefined) => {
			setSearchParams(params => {
				if (next) {
					params.set('category', next);
				} else {
					params.delete('category');
				}
				params.delete('page');
				return params;
			});
		},
		[setSearchParams]
	);

	const setPage = useCallback(
		(next: number) => {
			setSearchParams(params => {
				if (next > 0) {
					params.set('page', String(next));
				} else {
					params.delete('page');
				}
				return params;
			});
		},
		[setSearchParams]
	);

	const clearFilters = useCallback(() => {
		setSearchParams(params => {
			params.delete('category');
			params.delete('page');
			return params;
		});
	}, [setSearchParams]);

	return useMemo(
		() => ({ query, mode, category, page, setQuery, setMode, setCategory, setPage, clearFilters }),
		[query, mode, category, page, setQuery, setMode, setCategory, setPage, clearFilters]
	);
}
