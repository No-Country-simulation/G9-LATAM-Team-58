import { CategoryBadge } from '@/components/data-display';
import type { MapPoint } from '@/shared/api/contracts';

/** Content of the hover tooltip. No "confianza" — MapPoint doesn't carry it. */
export function MapTooltip({ point }: { point: MapPoint }) {
	return (
		<div className="flex w-[220px] flex-col gap-2">
			<CategoryBadge category={point.category} />
			<p className="line-clamp-2 text-[13px] leading-tight font-medium text-foreground">{point.title}</p>
		</div>
	);
}
