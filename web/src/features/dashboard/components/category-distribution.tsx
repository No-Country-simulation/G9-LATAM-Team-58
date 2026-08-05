import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router';
import { CategoryBars } from '@/components/data-display';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryDistributionProps {
	byCategory: Record<string, number>;
	isLoading: boolean;
}

export function CategoryDistribution({ byCategory, isLoading }: CategoryDistributionProps) {
	return (
		<div className="rounded-md border bg-card p-5">
			<div className="flex items-center justify-between gap-4">
				<div>
					<p className="font-mono text-[11px] uppercase tracking-[0.06em] text-muted-foreground">
						Distribución del conocimiento
					</p>
					<h2 className="mt-1 font-heading text-lg font-semibold">Contenidos por categoría</h2>
				</div>
				<Link
					to="/contenidos"
					className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
				>
					Biblioteca <IconArrowRight className="size-4" />
				</Link>
			</div>

			<div className="mt-6">
				{isLoading ? (
					<div className="space-y-3">
						{Array.from({ length: 5 }, (_, index) => (
							<Skeleton key={index} className="h-8" />
						))}
					</div>
				) : (
					<CategoryBars byCategory={byCategory} order="canonical" scale="total" />
				)}
			</div>
		</div>
	);
}
