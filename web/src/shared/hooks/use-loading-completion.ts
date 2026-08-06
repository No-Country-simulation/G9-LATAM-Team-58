import { useEffect, useState } from 'react';

interface LoadingCompletionOptions {
	isPending: boolean;
	isComplete: boolean;
	from?: number;
	ceiling?: number;
	stepMs?: number;
	completionStepMs?: number;
}

/**
 * Keeps a simulated loader mounted long enough to visibly finish after a
 * successful request. Errors skip the completion phase and render at once.
 */
export function useLoadingCompletion({
	isPending,
	isComplete,
	from = 8,
	ceiling = 90,
	stepMs = 380,
	completionStepMs = 55
}: LoadingCompletionOptions) {
	const [progress, setProgress] = useState(from);
	const [isVisible, setIsVisible] = useState(isPending);

	useEffect(() => {
		if (!isPending) return;

		const startId = window.setTimeout(() => {
			setProgress(from);
			setIsVisible(true);
		});
		const id = window.setInterval(() => {
			setProgress(current =>
				current >= ceiling ? ceiling : Math.min(ceiling, current + Math.ceil(Math.random() * 6))
			);
		}, stepMs);

		return () => {
			window.clearTimeout(startId);
			window.clearInterval(id);
		};
	}, [ceiling, from, isPending, stepMs]);

	useEffect(() => {
		if (isPending || !isVisible) return;

		if (!isComplete) {
			const hideId = window.setTimeout(() => setIsVisible(false));
			return () => window.clearTimeout(hideId);
		}

		const id = window.setInterval(() => {
			setProgress(current => {
				if (current >= 100) return current;
				return Math.min(100, current + Math.max(1, Math.ceil((100 - current) / 5)));
			});
		}, completionStepMs);
		const doneId = window.setTimeout(() => setIsVisible(false), completionStepMs * 7);

		return () => {
			window.clearInterval(id);
			window.clearTimeout(doneId);
		};
	}, [completionStepMs, isComplete, isPending, isVisible]);

	return { isVisible, progress };
}
