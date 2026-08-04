import { cn } from '@/shared/lib/utils';

const DEFAULT_SEGMENTS = 20;

interface SegmentedBarProps {
	/** Fill ratio, 0..1. Values outside the range are clamped. */
	value: number;
	segments?: number;
	className?: string;
}

/**
 * Purely presentational: paints N discrete blocks and fills the first ones.
 * It knows nothing about probabilities, progress or accessibility — callers
 * add the semantics (see `ConfidenceBar`).
 */
export function SegmentedBar({ value, segments = DEFAULT_SEGMENTS, className }: SegmentedBarProps) {
	const clamped = Math.min(1, Math.max(0, value));
	const filled = Math.round(clamped * segments);

	return (
		<div aria-hidden className={cn('flex gap-1', className)}>
			{Array.from({ length: segments }, (_, index) => (
				<span
					key={index}
					className={cn(
						'h-2 flex-1 rounded-xs',
						index < filled
							? 'bg-primary dark:shadow-[0_0_6px_color-mix(in_oklab,var(--primary)_40%,transparent)]'
							: 'bg-muted'
					)}
				/>
			))}
		</div>
	);
}
