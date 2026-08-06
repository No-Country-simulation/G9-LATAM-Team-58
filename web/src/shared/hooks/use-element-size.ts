import { useCallback, useState } from 'react';

interface ElementSize {
	width: number;
	height: number;
}

/**
 * Tracks an element's content-box size via ResizeObserver, for canvases that
 * need pixel dimensions up front (the map's canvas). Uses a callback ref, not
 * a `useEffect(..., [])` on a plain ref: the element this measures can mount
 * behind an early return (a loading state, for instance), arriving on a later
 * render than the one where the effect ran — a callback ref fires exactly when
 * the node attaches, whichever render that happens to be.
 */
export function useElementSize<T extends HTMLElement>() {
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

	const ref = useCallback((element: T | null) => {
		if (!element) {
			return;
		}

		const observer = new ResizeObserver(entries => {
			const entry = entries[0];
			if (!entry) {
				return;
			}
			const { inlineSize, blockSize } = entry.borderBoxSize[0] ?? { inlineSize: 0, blockSize: 0 };
			setSize({ width: inlineSize, height: blockSize });
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, []);

	return [ref, size] as const;
}
