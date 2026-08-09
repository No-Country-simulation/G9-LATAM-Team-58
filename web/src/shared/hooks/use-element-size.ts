import { useEffect, useState } from 'react';

interface ElementSize {
	width: number;
	height: number;
}

/**
 * Tracks an element's content-box size via ResizeObserver, for canvases that
 * need pixel dimensions up front (the map's canvas).
 *
 * The node arrives through state — the returned ref is a state setter — not a
 * `useEffect(..., [])` on a plain ref: the element this measures can mount
 * behind an early return (a loading state, for instance), arriving on a later
 * render than the one where such an effect ran. Keying the effect on the
 * stored node subscribes exactly when the element attaches, whichever render
 * that happens to be, and the observer's cleanup rides the effect lifecycle,
 * so the subscription is released on detach and unmount.
 */
export function useElementSize<T extends HTMLElement>() {
	const [element, setElement] = useState<T | null>(null);
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

	useEffect(() => {
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
	}, [element]);

	return [setElement, size] as const;
}
