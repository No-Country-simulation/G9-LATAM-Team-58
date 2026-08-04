import { RelatedList, SectionHeading } from '@/components/data-display';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApiError } from '@/shared/api/client';
import type { RelatedItem } from '@/shared/api/contracts';

interface RelatedPanelProps {
	isPending: boolean;
	error: ApiError | null;
	related: RelatedItem[] | null;
}

export function RelatedPanel({ isPending, error, related }: RelatedPanelProps) {
	return (
		<Card className="gap-0 py-5">
			<CardContent className="flex flex-col gap-4">
				<SectionHeading>Contenido relacionado</SectionHeading>
				{isPending && (
					<div className="flex flex-col gap-2">
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
						<Skeleton className="h-9 w-full" />
					</div>
				)}
				{error && <p className="text-sm text-muted-foreground">{error.message}</p>}
				{related && related.length === 0 && (
					<p className="text-sm text-muted-foreground">Todavía no hay contenidos relacionados.</p>
				)}
				{related && related.length > 0 && <RelatedList related={related} />}
			</CardContent>
		</Card>
	);
}
