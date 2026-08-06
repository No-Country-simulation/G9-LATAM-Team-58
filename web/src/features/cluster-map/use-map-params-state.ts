import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router';

/**
 * Holds the selected point in the URL so a specific map point is shareable and
 * survives back/forward navigation. Zoom and pan are not included here — they
 * are ephemeral interaction state, not something worth linking to.
 */
export function useMapParamsState() {
	const [searchParams, setSearchParams] = useSearchParams();

	const selectedId = searchParams.get('punto') ?? undefined;

	const select = useCallback(
		(id: string | undefined) => {
			setSearchParams(params => {
				if (id) {
					params.set('punto', id);
				} else {
					params.delete('punto');
				}
				return params;
			});
		},
		[setSearchParams]
	);

	return useMemo(() => ({ selectedId, select }), [selectedId, select]);
}
