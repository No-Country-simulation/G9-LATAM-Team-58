import { IconArrowRight, IconX } from '@tabler/icons-react';
import { Link } from 'react-router';
import { CategoryBadge, RelatedList, SectionHeading } from '@/components/data-display';
import { ErrorBanner } from '@/components/feedback/error-banner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useContent, useRelatedContents } from '@/features/contents';
import { formatDateTime } from '@/shared/lib/format';
import type { MapPoint } from '@/shared/api/contracts';

const coordinateFormatter = new Intl.NumberFormat('es', { minimumFractionDigits: 3, maximumFractionDigits: 3 });

interface PointDetailPanelProps {
	point: MapPoint;
	onClose: () => void;
}

/** Side panel for the selected point. `MapPoint` only has id/title/category/x/y, so
 *  the body, source and date come from a single on-demand `useContent` call. */
export function PointDetailPanel({ point, onClose }: PointDetailPanelProps) {
	const content = useContent(point.id);
	const related = useRelatedContents(point.id);

	return (
		<aside className="absolute top-0 right-0 z-40 flex h-full w-90 flex-col border-l bg-card shadow-xl">
			<button
				type="button"
				onClick={onClose}
				aria-label="Cerrar"
				className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:text-foreground"
			>
				<IconX className="size-5" />
			</button>

			<div className="flex-1 overflow-y-auto p-6">
				<CategoryBadge category={point.category} className="mb-4" />

				{content.isPending && (
					<div className="flex flex-col gap-3">
						<Skeleton className="h-6 w-4/5" />
						<Skeleton className="h-3 w-2/3" />
						<Skeleton className="h-20 w-full" />
					</div>
				)}

				{content.isError && <ErrorBanner title="No se pudo cargar el contenido" error={content.error} />}

				{content.data && (
					<>
						<h2 className="font-heading mb-2 text-lg leading-tight font-semibold text-foreground">
							{content.data.title}
						</h2>
						<div className="mb-4 font-mono text-[11px] text-text-dim">
							id {content.data.id} · {formatDateTime(content.data.addedAt)} · {content.data.source}
						</div>
						<p className="mb-8 line-clamp-4 text-[13px] leading-relaxed text-muted-foreground">{content.data.body}</p>
					</>
				)}

				<div className="mb-8">
					<SectionHeading>Coordenadas</SectionHeading>
					<div className="grid grid-cols-2 gap-y-2">
						<span className="font-mono text-[13px] text-foreground">x {coordinateFormatter.format(point.x)}</span>
						{point.clusterId != null && (
							<span className="font-mono text-[13px] text-foreground">cluster {point.clusterId}</span>
						)}
						<span className="font-mono text-[13px] text-foreground">y {coordinateFormatter.format(point.y)}</span>
					</div>
				</div>

				<div>
					<SectionHeading>Vecinos más cercanos</SectionHeading>
					{related.isPending && (
						<div className="flex flex-col gap-2">
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
							<Skeleton className="h-9 w-full" />
						</div>
					)}
					{related.data && related.data.related.length === 0 && (
						<p className="text-sm text-muted-foreground">Todavía no hay contenidos relacionados.</p>
					)}
					{related.data && related.data.related.length > 0 && <RelatedList related={related.data.related} />}
				</div>
			</div>

			<div className="shrink-0 border-t bg-card p-6">
				<Button asChild className="w-full" data-icon="inline-end">
					<Link to={`/contenidos/${point.id}`}>
						Ver detalle completo
						<IconArrowRight />
					</Link>
				</Button>
			</div>
		</aside>
	);
}
