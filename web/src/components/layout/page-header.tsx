import type { ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';

interface PageHeaderProps {
	title: ReactNode;
	description?: ReactNode;
	className?: string;
}

/** Consistent title and supporting text for application pages. */
export function PageHeader({ title, description, className }: PageHeaderProps) {
	return (
		<header className={cn('shrink-0', className)}>
			<h1>{title}</h1>
			{description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
		</header>
	);
}
