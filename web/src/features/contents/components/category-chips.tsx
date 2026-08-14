import { CATEGORIES } from '@/shared/config/constants';
import { categoryStyle } from '@/shared/config/categories';
import { cn } from '@/shared/lib/utils';

interface CategoryChipsProps {
	byCategory: Record<string, number>;
	active: string | undefined;
	onSelect: (category: string | undefined) => void;
}

/** Clicking the already-active chip clears the filter instead of re-selecting it. */
export function CategoryChips({ byCategory, active, onSelect }: CategoryChipsProps) {
	return (
		<div className="flex flex-wrap gap-2">
			{CATEGORIES.map(category => {
				const isActive = active === category;
				return (
					<button
						key={category}
						type="button"
						style={categoryStyle(category)}
						onClick={() => onSelect(isActive ? undefined : category)}
						aria-pressed={isActive}
						className={cn(
							'flex items-center gap-2 rounded-full border border-(--cat)/40 px-3 py-1.5 transition-colors',
							isActive ? 'bg-(--cat)/25' : 'bg-(--cat)/10 hover:bg-(--cat)/20'
						)}
					>
						<span className="size-1.5 rounded-full bg-(--cat)" />
						<span className="font-mono text-[11px] text-(--cat) uppercase">{category}</span>
						<span className="font-mono text-[11px] text-text-dim tabular-nums">{byCategory[category] ?? 0}</span>
					</button>
				);
			})}
		</div>
	);
}
