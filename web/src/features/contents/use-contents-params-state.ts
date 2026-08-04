import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import { CATEGORIES } from '@/shared/config/constants';

function isCategory(value: string | null): boolean {
	return CATEGORIES.some(category => category === value);
}

/**
 * Library state lives in the URL so a filtered, paginated view is shareable
 * and survives back/forward navigation. Changing the query or the category
 * resets the page — otherwise the URL could point at a page that no longer
 * exists for the new filter.
 */
export function useContentsParamsState() {
	const [searchParams, setSearchParams] = useSearchParams();

	const rawQuery = searchParams.get('q');
	const rawCategory = searchParams.get('category');
	const rawPage = searchParams.get('page');

	const q = rawQuery ?? '';
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
			params.delete('q');
			params.delete('category');
			params.delete('page');
			return params;
		});
	}, [setSearchParams]);

	return useMemo(
		() => ({ q, category, page, setQuery, setCategory, setPage, clearFilters }),
		[q, category, page, setQuery, setCategory, setPage, clearFilters]
	);
}
