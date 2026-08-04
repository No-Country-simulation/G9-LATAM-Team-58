import { Skeleton } from '@/components/ui/skeleton';

export function DetailSkeleton() {
	return (
		<div className="flex flex-col gap-8" aria-hidden="true">
			<div className="flex flex-col gap-4">
				<Skeleton className="h-3 w-32" />
				<Skeleton className="h-8 w-2/3" />
				<Skeleton className="h-6 w-40" />
			</div>
			<div className="flex flex-row items-start gap-6">
				<Skeleton className="h-96 w-2/3" />
				<div className="flex w-1/3 flex-col gap-4">
					<Skeleton className="h-40 w-full" />
					<Skeleton className="h-32 w-full" />
					<Skeleton className="h-48 w-full" />
				</div>
			</div>
		</div>
	);
}
