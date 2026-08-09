import { CATEGORIES } from '@/shared/config/constants';
import { categoryStyle } from '@/shared/config/categories';
import { CategoryDot } from './category-dot';

interface CategoryBarsProps {
	byCategory: Record<string, number>;
	/** 'canonical' lists all 8 categories in CATEGORIES order; 'count' only the ones with data, sorted desc. */
	order?: 'canonical' | 'count';
	/** Bar width relative to the grand total, or to the largest single value. */
	scale?: 'total' | 'max';
	/** Share of the grand total, shown next to the count — independent of `scale`. */
	showPercentage?: boolean;
}

/** Shared by the dashboard and the batch summary. */
export function CategoryBars({
	byCategory,
	order = 'canonical',
	scale = 'total',
	showPercentage = false
}: CategoryBarsProps) {
	const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);

	const allRows = CATEGORIES.map(category => ({ category, count: byCategory[category] ?? 0 }));
	const rows = order === 'canonical' ? allRows : allRows.filter(row => row.count > 0).sort((a, b) => b.count - a.count);

	const widthDenominator = scale === 'total' ? total : Math.max(...rows.map(row => row.count), 1);

	return (
		<div className="flex flex-col gap-3">
			{rows.map(({ category, count }) => {
				const width = widthDenominator ? Math.round((count / widthDenominator) * 100) : 0;
				const percentage = total ? Math.round((count / total) * 100) : 0;
				return (
					<div key={category} className="flex items-center gap-3 text-sm">
						<span className="flex w-36 shrink-0 items-center gap-2 truncate text-muted-foreground">
							<CategoryDot category={category} />
							{category}
						</span>
						<div className="h-1.5 flex-1 overflow-hidden rounded-sm bg-muted">
							<div
								style={{ ...categoryStyle(category), width: `${width}%` }}
								className="h-full rounded-sm bg-(--cat)"
							/>
						</div>
						<span className="w-16 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
							{count.toLocaleString('es')}
							{showPercentage && ` (${percentage}%)`}
						</span>
					</div>
				);
			})}
		</div>
	);
}
