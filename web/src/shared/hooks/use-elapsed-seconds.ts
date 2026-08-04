import { useEffect, useState } from 'react';

/** Seconds since the component mounted, ticking at `intervalMs`. */
export function useElapsedSeconds(intervalMs = 100) {
	const [elapsed, setElapsed] = useState(0);

	useEffect(() => {
		const startedAt = Date.now();
		const id = window.setInterval(() => {
			setElapsed((Date.now() - startedAt) / 1000);
		}, intervalMs);
		return () => window.clearInterval(id);
	}, [intervalMs]);

	return elapsed;
}
