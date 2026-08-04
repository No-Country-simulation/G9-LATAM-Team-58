import { useEffect, useState } from 'react';

interface SimulatedProgressOptions {
	/** Where the bar starts, 0..100. */
	from?: number;
	/** Where it stops and waits for the real answer, 0..100. */
	ceiling?: number;
	stepMs?: number;
}

/**
 * Drives a progress bar for operations that give no intermediate feedback: it
 * creeps forward and then parks below 100% until the caller unmounts it.
 * Purely cosmetic — never derive real state from this.
 */
export function useSimulatedProgress({ from = 8, ceiling = 90, stepMs = 380 }: SimulatedProgressOptions = {}) {
	const [progress, setProgress] = useState(from);

	useEffect(() => {
		const id = window.setInterval(() => {
			setProgress(current =>
				current >= ceiling ? ceiling : Math.min(ceiling, current + Math.ceil(Math.random() * 6))
			);
		}, stepMs);
		return () => window.clearInterval(id);
	}, [ceiling, stepMs]);

	return progress;
}
