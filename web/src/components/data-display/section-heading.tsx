import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

/**
 * Section label of the design system: mono, 11px, uppercase, wide tracking,
 * with a hairline underneath. Used to split panels into labelled blocks.
 */
export function SectionHeading({ children, className }: { children: ReactNode; className?: string }) {
	return (
		<h4
			className={cn(
				'mb-3 border-b pb-2 font-mono text-[11px] tracking-[0.06em] uppercase text-muted-foreground',
				className
			)}
		>
			{children}
		</h4>
	);
}
