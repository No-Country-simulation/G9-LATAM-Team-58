import { CategoryDot } from '@/components/data-display';
import { CATEGORIES } from '@/shared/config/constants';
import { cn } from '@/shared/lib/utils';

interface CategoryLegendProps {
	byCategory: Record<string, number>;
	total: number;
	active: string | undefined;
	onToggle: (category: string) => void;
}

/**
 * The design calls this "CLUSTERES SEMÁNTICOS", but it lists the 8 categories,
 * not the KMeans clusters — the counts come from the points already on screen,
 * not from /stats, since the map only shows rows with a UMAP projection.
 */
export function CategoryLegend({ byCategory, total, active, onToggle }: CategoryLegendProps) {
	return (
		<div className="absolute top-6 left-6 z-20 flex w-[260px] flex-col gap-3 rounded-lg border border-outline bg-card/80 p-4 backdrop-blur-md">
			<h2 className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground uppercase">Categorías</h2>
			<div className="flex flex-col gap-2">
				{CATEGORIES.map(category => (
					<button
						key={category}
						type="button"
						onClick={() => onToggle(category)}
						aria-pressed={active === category}
						className={cn(
							'group flex items-center justify-between text-left transition-opacity',
							active !== undefined && active !== category && 'opacity-40'
						)}
					>
						<span className="flex items-center gap-2">
							<CategoryDot category={category} className="size-2.5" />
							<span className="font-body text-[13px] text-muted-foreground transition-colors group-hover:text-foreground">
								{category}
							</span>
						</span>
						<span className="font-mono text-[12px] text-text-dim tabular-nums">{byCategory[category] ?? 0}</span>
					</button>
				))}
			</div>
			<div className="mt-1 border-t border-outline pt-3">
				<span className="font-mono text-[11px] text-muted-foreground tabular-nums">
					{total.toLocaleString('es')} documentos
				</span>
			</div>
		</div>
	);
}
