import { Skeleton } from '@/components/ui/skeleton';

export function ResultsSkeleton() {
	return (
		<div className="flex flex-col gap-3" aria-hidden="true">
			{Array.from({ length: 5 }, (_, index) => (
				<div key={index} className="flex w-full flex-col gap-3 rounded-md border border-outline bg-card p-4">
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
