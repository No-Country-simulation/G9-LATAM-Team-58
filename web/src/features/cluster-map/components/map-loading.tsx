import { IconChartScatter } from '@tabler/icons-react';
import { SegmentedBar } from '@/components/data-display';
import { Skeleton } from '@/components/ui/skeleton';

/** No real progress to report from a single GET /map — cosmetic only, like the analyze pipeline. */
export function MapLoading({ progress }: { progress: number }) {
	return (
		<div className="relative h-full w-full" aria-hidden="true">
			<div className="absolute top-6 left-6 z-20 flex w-[260px] flex-col gap-3 rounded-lg border border-outline bg-card/80 p-4 backdrop-blur-md">
				<Skeleton className="h-3 w-32" />
				<div className="flex flex-col gap-3">
					{Array.from({ length: 8 }, (_, index) => (
						<div key={index} className="flex items-center gap-2" style={{ opacity: 1 - index * 0.08 }}>
							<Skeleton className="size-2.5 rounded-full" />
							<Skeleton className="h-3 flex-1" />
							<Skeleton className="h-3 w-8" />
						</div>
					))}
				</div>
			</div>

			<div className="flex h-full flex-col items-center justify-center gap-1">
				<IconChartScatter className="mb-4 size-8 text-outline" stroke={1.5} />
				<h1 className="font-heading text-base font-semibold text-muted-foreground">Proyectando el espacio vectorial</h1>
				<p className="mb-6 font-mono text-[11px] text-text-dim">reduciendo 384 dimensiones a 2 con UMAP</p>
				<SegmentedBar value={progress / 100} className="w-60" />
			</div>
		</div>
	);
}
