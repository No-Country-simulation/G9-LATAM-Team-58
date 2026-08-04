import { SegmentedBar } from '@/components/data-display';

/**
 * Semantic wrapper over `SegmentedBar`: adds the progressbar role and the
 * percentage for assistive tech. The bar itself only knows how to paint blocks.
 */
export function ConfidenceBar({ value, className }: { value: number; className?: string }) {
	const percent = Math.round(Math.min(1, Math.max(0, value)) * 100);

	return (
		<div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} aria-label="Confianza">
			<SegmentedBar value={value} className={className} />
		</div>
	);
}
