import { Skeleton } from '@/components/ui/skeleton';

const CARD_WIDTHS = ['100%', '85%', '70%', '55%', '40%'];

/** Placeholder cards shown while a search request is in flight. */
export function ResultsSkeleton() {
	return (
		<div className="flex flex-col gap-3" aria-hidden="true">
			{CARD_WIDTHS.map(width => (
				<div key={width} className="flex flex-col gap-3 rounded-md border border-outline bg-card p-4" style={{ width }}>
					<div className="flex items-center justify-between gap-3">
						<Skeleton className="h-4 w-20 rounded-full" />
						<Skeleton className="h-4 w-12" />
					</div>
					<Skeleton className="h-4 w-3/5" />
				</div>
			))}
		</div>
	);
}
