import type { Icon } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface EmptyStateProps {
	icon: Icon;
	title: string;
	description?: string;
	/** Optional actions rendered under the description. */
	children?: ReactNode;
	className?: string;
}

/**
 * The sober empty state of the design system: outline icon, heading and one
 * line of help. No illustrations, no spinners.
 */
export function EmptyState({ icon: IconComponent, title, description, children, className }: EmptyStateProps) {
	return (
		<div className={cn('flex flex-1 flex-col items-center justify-center gap-2 p-8 text-center', className)}>
			<IconComponent className="size-8 text-outline" stroke={1.5} />
			<p className="font-heading text-base text-muted-foreground">{title}</p>
			{description && <p className="max-w-xs text-sm text-text-dim">{description}</p>}
			{children && <div className="mt-4 flex flex-wrap justify-center gap-3">{children}</div>}
		</div>
	);
}
