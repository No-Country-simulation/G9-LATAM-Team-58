import { Skeleton } from '@/components/ui/skeleton';

/** Shown for the instant a lazy route chunk takes to arrive. */
export function RouteFallback() {
	return (
		<div className="flex flex-1 flex-col gap-4 p-4">
			<Skeleton className="h-8 w-64" />
			<Skeleton className="h-4 w-96" />
			<Skeleton className="flex-1" />
		</div>
	);
}
