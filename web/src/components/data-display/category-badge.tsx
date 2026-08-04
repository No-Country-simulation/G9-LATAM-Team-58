import { Badge } from '@/components/ui/badge';
import { categoryStyle } from '@/shared/config/categories';
import { cn } from '@/shared/lib/utils';

/**
 * The category pill: dot + name, tinted with the category colour.
 * Single source of truth — search results, the library and the analyze result
 * all render categories through this.
 */
export function CategoryBadge({ category, className }: { category: string; className?: string }) {
	return (
		<Badge
			variant="soft"
			style={categoryStyle(category)}
			className={cn('border border-(--cat)/40 bg-(--cat)/12 font-mono text-(--cat)', className)}
		>
			<span className="size-1.5 rounded-full bg-(--cat)" />
			{category}
		</Badge>
	);
}
