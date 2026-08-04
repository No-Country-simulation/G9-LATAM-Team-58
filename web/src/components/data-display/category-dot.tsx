import { categoryStyle } from '@/shared/config/categories';
import { cn } from '@/shared/lib/utils';

/**
 * Bare colour dot for a category, for rows too dense to fit a full badge
 * (related content, map legend, compact lists).
 */
export function CategoryDot({ category, className }: { category: string; className?: string }) {
	return (
		<span
			aria-hidden
			style={categoryStyle(category)}
			className={cn('size-1.5 shrink-0 rounded-full bg-(--cat)', className)}
		/>
	);
}
