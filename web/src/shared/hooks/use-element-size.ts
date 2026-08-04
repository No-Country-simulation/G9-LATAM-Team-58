import { useEffect, useRef, useState } from 'react';

interface ElementSize {
	width: number;
	height: number;
}

/** Tracks an element's content-box size via ResizeObserver, for canvases that need pixel dimensions up front (the map's SVG). */
export function useElementSize<T extends HTMLElement>() {
	const ref = useRef<T>(null);
	const [size, setSize] = useState<ElementSize>({ width: 0, height: 0 });

	useEffect(() => {
		const element = ref.current;
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
