import { CategoryBars } from '@/components/data-display';

interface BatchCategoryBreakdownProps {
	byCategory: Record<string, number>;
}

export function BatchCategoryBreakdown({ byCategory }: BatchCategoryBreakdownProps) {
	const total = Object.values(byCategory).reduce((sum, count) => sum + count, 0);
	if (total === 0) return null;

	return (
		<div className="rounded-md border bg-card p-5">
			<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
				Distribución por categoría
			</p>
			<div className="mt-4">
				<CategoryBars byCategory={byCategory} order="count" scale="max" showPercentage />
			</div>
		</div>
	);
}
