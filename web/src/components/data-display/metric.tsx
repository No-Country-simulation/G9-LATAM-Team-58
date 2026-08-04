import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface MetricProps {
	label: string;
	children: ReactNode;
	/** Right-aligns the block, for metrics that sit at the end of a header row. */
	align?: 'start' | 'end';
	className?: string;
}

/**
 * A labelled figure: mono uppercase caption on top, large mono value below.
 * Every number in the product is rendered this way (confidence, batch totals,
 * dashboard counters).
 */
export function Metric({ label, children, align = 'start', className }: MetricProps) {
	return (
		<div className={cn('flex flex-col', align === 'end' && 'items-end text-right', className)}>
			<span className="font-mono text-[11px] tracking-[0.06em] uppercase text-muted-foreground">{label}</span>
			<span className="font-mono text-2xl tabular-nums text-foreground">{children}</span>
		</div>
	);
}
