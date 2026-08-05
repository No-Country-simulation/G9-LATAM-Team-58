import { CategoryDot } from '@/components/data-display';
import { CATEGORIES } from '@/shared/config/constants';
import { categoryStyle } from '@/shared/config/categories';

interface BatchCategoryBreakdownProps {
	byCategory: Record<string, number>;
}

export function BatchCategoryBreakdown({ byCategory }: BatchCategoryBreakdownProps) {
	const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);
	if (total === 0) return null;

	const rows = CATEGORIES.map(category => ({ category, count: byCategory[category] ?? 0 }))
		.filter(row => row.count > 0)
		.sort((a, b) => b.count - a.count);
	const max = Math.max(...rows.map(row => row.count));

	return (
		<div className="rounded-md border bg-card p-5">
			<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
				Distribución por categoría
			</p>
			<div className="mt-4 flex flex-col gap-3">
				{rows.map(({ category, count }) => (
					<div key={category} className="flex items-center gap-3">
						<div className="flex w-40 shrink-0 items-center gap-2">
							<CategoryDot category={category} />
							<span className="truncate text-sm">{category}</span>
						</div>
						<div className="h-2 flex-1 rounded-full bg-muted">
							<div
								style={{ ...categoryStyle(category), width: `${(count / max) * 100}%` }}
								className="h-2 rounded-full bg-(--cat)"
							/>
						</div>
						<span className="w-24 shrink-0 text-right font-mono text-xs tabular-nums text-muted-foreground">
							{count.toLocaleString('es')} ({((count / total) * 100).toLocaleString('es', { maximumFractionDigits: 1 })}
							%)
						</span>
					</div>
				))}
			</div>
		</div>
	);
}
